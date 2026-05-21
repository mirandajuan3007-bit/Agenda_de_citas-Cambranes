# Arquitectura del Modulo de Agenda

Vista general de la arquitectura del modulo. Complementa `PATRONES_DE_DISEÑO.md` (que profundiza en patrones GoF) y `docs/05_final/analisis_diseño.md` (que evalua los fundamentos de diseño).

---

## 1. Vista de capas

```
┌──────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript)                                       │
│  ┌─────────────┐  ┌────────────┐  ┌────────────┐                     │
│  │ components/ │←→│ context/   │←→│ services/  │  ← capa de servicios│
│  └─────────────┘  └────────────┘  └─────┬──────┘                     │
└────────────────────────────────────────-─┼─────────────────────────────┘
                                           │ HTTP (X-User-Id, JSON)
                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  BACKEND (Spring Boot 3)                                             │
│                                                                      │
│  api/   ── Controllers, DTOs, mappers, error handlers, security      │
│   │                                                                  │
│   ▼                                                                  │
│  service/   ── Casos de uso (transaccionales) + excepciones de negocio│
│   │                                                                  │
│   ▼                                                                  │
│  domain/                                                             │
│   ├── model/      (Aggregate Roots / entidades JPA)                  │
│   ├── repository/ (puertos JPA)                                      │
│   ├── validation/ (Strategy + Chain of Responsibility)               │
│   ├── state/      (State pattern)                                    │
│   ├── factory/    (Factory)                                          │
│   └── event/      (Observer / Event Bus)                             │
│                                                                      │
│  config/   ── CORS, argument resolvers, seeders                      │
└──────────────────────────────────────────┬───────────────────────────┘
                                           │ JPA / Hibernate
                                           ▼
                              ┌────────────────────────┐
                              │  MySQL  (Flyway)       │
                              └────────────────────────┘
```

Reglas de dependencia (de afuera hacia adentro, jamas al reves):

- `api` puede depender de `service` y de `domain` solo para leer entidades via mapper.
- `service` puede depender de `domain` y de DTOs de `api`.
- `domain` no depende de Spring MVC ni de DTOs.

---

## 2. Componentes clave por capa

### api/
- `AppointmentController`, `PatientController`, `AuthController`, `CatalogController`.
- `dto/` — records inmutables que definen el contrato HTTP.
- `mapper/DtoMapper` — convierte entidad ↔ DTO en un solo lugar.
- `error/GlobalExceptionHandler` — mapea excepciones de dominio a HTTP.
- `security/CurrentUserArgumentResolver` — adapter de `X-User-Id` a `User`.

### service/
- `AppointmentService` — casos de uso de cita (crear, cancelar, completar, reprogramar).
- `PatientService` — alta y busqueda de pacientes.
- `AuthService` — login con BCrypt.
- `CatalogService` — terapeutas, salas, tipos de sesion, estados.

### domain/
- `model/` — Appointment (Aggregate Root), Patient, Therapist, Room, User, AppointmentStatus, AuditLog.
- `repository/` — interfaces JPA con queries especificas (`findOverlapping`, `countScheduledByPatient`).
- `validation/` — `AppointmentValidator` (Strategy) + `AppointmentValidationChain` (Chain) + 3 reglas.
- `state/` — `AppointmentState` + `ScheduledState`, `CancelledState`, `RescheduledState`, `CompletedState`, `TerminalState`, `AppointmentStateResolver`.
- `factory/` — `AppointmentFactory` que encapsula las invariantes de construccion.
- `event/` — `AppointmentEvent` (sealed) + `AuditLogListener` (Observer).

---

## 3. Flujo de una operacion (crear cita)

```
HTTP POST /api/appointments
        │
        ▼
AppointmentController.create
        │ valida @Valid CreateAppointmentRequest (Bean Validation)
        ▼
AppointmentService.create        @Transactional
        │ 1. resuelve Patient/Therapist/Room/SessionType del repo
        │ 2. valida coherencia therapist↔room
        │ 3. AppointmentValidationChain.run(ctx)
        │     ├── WorkingHoursValidator    (Strategy + @Order 10)
        │     ├── OverlapValidator         (Strategy + @Order 20)
        │     └── PatientLimitValidator    (Strategy + @Order 30)
        │ 4. AppointmentFactory.newScheduled(...)
        │ 5. AppointmentRepository.save(...)
        │ 6. publishEvent(AppointmentEvent.Created)
        │                       │
        │                       ▼
        │           AuditLogListener.onAppointmentEvent
        │                       │
        │                       ▼
        │           AuditLogRepository.save(...)
        ▼
DtoMapper.toDto(saved)
        │
        ▼
HTTP 201 Created + AppointmentDto
```

Si en el paso 3 hay errores, se lanza `BusinessRuleException` y `GlobalExceptionHandler` la traduce a HTTP 409 con el detalle.

---

## 4. Decisiones de diseño relevantes

| Decision | Motivo |
|---|---|
| Patrones GoF en `domain/` y no en `service/` | Mantener `service/` orientado a casos de uso. La logica reusable vive en dominio. |
| Eventos de dominio para audit | Desacoplar trazabilidad de la logica de negocio. |
| DTO records inmutables | Contrato API estable y type-safe. |
| Maquina de estados explicita | Las reglas dicen que la cita nunca se borra; ScheduledState es el unico no-terminal. |
| Validacion duplicada en frontend (preview) | UX inmediato + defense in depth. El backend siempre re-valida. |
| Trazabilidad: nunca DELETE | Cancelar/reprogramar son cambios de estado, no borrado fisico. |
| `open-in-view: false` | Evita el antipatron OSIV; obliga a controlar carga LAZY desde el service. |
| MySQL + Flyway | Migraciones versionadas; `ddl-auto: validate` impide cambios silenciosos del esquema. |

---

## 5. Configuracion del comportamiento

`application.yml` expone parametros de negocio para no quemarlos en codigo:

```yaml
app:
  business:
    working-hours:
      start: "09:00"
      end:   "17:30"
    max-active-appointments-per-patient: 3
```

Cambiarlos no requiere recompilar. Esto refleja el principio de **configuracion sobre codificacion** y deja el dominio limpio de constantes magicas.

---

## 6. Que mejorar en el futuro

Ver `docs/05_final/analisis_diseño.md` seccion 6. Los temas principales son:

- Autenticacion real (JWT) — el `X-User-Id` actual es demo.
- Tests unitarios + integracion (JUnit + Testcontainers).
- Lock pesimista o advisory lock para eliminar el TOCTOU en `findOverlapping → save`.
- MapStruct para reemplazar `DtoMapper` manual.
- Springdoc OpenAPI.
- Refactor de `AppContext` en frontend (Auth vs Datos).
