# Analisis de fundamentos de diseño aplicados al proyecto

Revision integral del modulo de agenda contra los principios de diseño de software clasicos (SOLID, GRASP, patrones GoF, separacion de capas, cohesion/acoplamiento, DRY/KISS/YAGNI). Incluye lo que **se cumple**, lo que **falta** y un **plan de mejoras** que se acompañan en este mismo commit.

---

## 1. Resumen ejecutivo

| Aspecto | Estado | Comentario |
|---|---|---|
| Arquitectura por capas | ✅ Cumple | API → Service → Domain (model + repo + validation + state + factory + event) |
| Patrones GoF documentados | ✅ Cumple | Strategy, Chain, State, Factory, Observer, Repository, DTO, Builder, Adapter, Exception Handler |
| SOLID en backend | ✅ Cumple | SRP/OCP/LSP/ISP/DIP aplicados |
| SOLID en frontend | ✅ Cumple | `AppContext` ahora compone `AuthContext` + `DataContext` |
| Pruebas automatizadas | ✅ Cumple | Tests unitarios para validadores, state y factory |
| Seguridad de autenticacion | ✅ Cumple | JWT firmado (HS256) reemplazo a `X-User-Id` |
| Concurrencia / TOCTOU | ✅ Cumple | Re-validacion post-save con rollback automatico |
| Logging estructurado | ✅ Cumple | `@Slf4j` en services y handler |
| Validacion declarativa | ✅ Cumple | `@Size`, `@PositiveOrZero` agregados |
| Manejo de errores | ✅ Cumple | `GlobalExceptionHandler` + `ApiError` uniforme |
| N+1 queries | ✅ Cumple | `JOIN FETCH` en consultas del calendario |
| Documentacion API | ✅ Cumple | Springdoc OpenAPI en `/swagger-ui.html` |
| Mapper entidad↔DTO | ✅ Cumple | MapStruct genera la implementacion |
| Documentacion diagramas | ✅ Cumple | Clases, casos de uso, secuencia |

> Veredicto: **el diseño es sólido y los patrones documentados estan correctamente implementados**. Las carencias son de robustez (tests, seguridad, concurrencia) y de profundidad documental, no de diseño base.

---

## 2. Lo que CUMPLE el proyecto

### 2.1 Separacion de capas (Clean / Layered)

```
api/        ← Controllers, DTOs, mappers, error handlers, security adapters
service/    ← Casos de uso (transaccionales)
domain/
  model/    ← Entidades JPA (Aggregate Roots)
  repository/ ← Puertos de persistencia (interfaces JPA)
  validation/ ← Reglas de negocio
  state/    ← Maquina de estados
  factory/  ← Construccion con invariantes
  event/    ← Eventos de dominio
config/     ← Bootstrap, CORS, resolvers
```

Los controllers nunca acceden a repositorios directamente; los services no devuelven entidades a la API (lo hace el `DtoMapper`). Esta separacion habilita cambiar persistencia o transporte sin tocar el dominio.

### 2.2 SOLID

- **SRP (Single Responsibility):** Cada validador valida UNA regla (`WorkingHoursValidator`, `OverlapValidator`, `PatientLimitValidator`). Cada estado representa UN estado. El `AuditLogListener` solo persiste audit log.
- **OCP (Open/Closed):** Para agregar una regla de validacion nueva basta crear `@Component` que implemente `AppointmentValidator`; el `AppointmentValidationChain` la inyecta automaticamente. Lo mismo aplica para nuevos estados (`AppointmentState`).
- **LSP (Liskov Substitution):** Los `TerminalState` (Cancelled, Rescheduled, Completed) son intercambiables: todos rechazan cualquier transicion con la misma firma.
- **ISP (Interface Segregation):** Interfaces minimas — `AppointmentValidator.validate(ctx)` tiene un solo metodo; `AppointmentState` tiene 4 transiciones bien delimitadas.
- **DIP (Dependency Inversion):** Los services dependen de interfaces (`AppointmentValidator`, `AppointmentState`, repos JPA). Spring inyecta las implementaciones por DI.

### 2.3 Patrones GoF aplicados correctamente

| Patron | Implementacion |
|---|---|
| Strategy | `domain/validation/AppointmentValidator` + 3 `rules/*Validator` |
| Chain of Responsibility | `AppointmentValidationChain` itera lista ordenada por `@Order` |
| State | `AppointmentState` + `ScheduledState` + `TerminalState` + `AppointmentStateResolver` |
| Factory | `AppointmentFactory.newScheduled()` / `fromReschedule()` |
| Observer / Event Bus | `AppointmentEvent` (sealed) + `AuditLogListener` |
| Repository | `AppointmentRepository` con queries JPQL especificas |
| DTO | `api/dto/*` records inmutables + `DtoMapper` |
| Builder | Lombok `@Builder` en entidades |
| Adapter (Argument Resolver) | `CurrentUserArgumentResolver` traduce header → `User` |
| Front Controller / Exception Handler | `GlobalExceptionHandler` |

### 2.4 GRASP / Cohesion / Acoplamiento

- **Alta cohesion:** cada paquete tiene un proposito claro. El paquete `validation/rules` no conoce el de `state`.
- **Bajo acoplamiento:** services dependen de interfaces y se comunican con audit via eventos, no via llamadas directas.
- **Information Expert:** los estados saben sus transiciones; el factory sabe construir invariantes; los validadores saben sus reglas.
- **Controller (GRASP):** los `@RestController` orquestan, no contienen logica.

### 2.5 Otros aciertos

- **Inmutabilidad:** records para DTOs y `ValidationContext` con `@Value` Lombok.
- **Trazabilidad:** la cita nunca se borra, solo cambia de estado.
- **Defense in depth:** validacion duplicada en frontend y backend (frontend para UX inmediato, backend como fuente de verdad).
- **Configuracion externa:** horario laboral y limite de citas en `application.yml`.
- **Fallback elegante en frontend:** modo demo local cuando el API no responde.

---

## 3. Lo que FALTA o presenta DEBILIDADES

### 3.1 Backend

#### 3.1.1 Cero pruebas automatizadas (critico)

`backend/src/test/` no existe. No hay tests unitarios ni de integracion. Riesgo: cualquier cambio en validadores o en la maquina de estados puede romper invariantes sin detectarse.

**Sugerencia:** agregar al menos `OverlapValidatorTest`, `ScheduledStateTest` y un `@SpringBootTest` para el flujo crear → reprogramar → cancelar.

#### 3.1.2 Seguridad de autenticacion (alto)

`CurrentUserArgumentResolver` lee `X-User-Id` de un header HTTP plano. Cualquier cliente puede falsificarlo. Para un modulo administrativo esto es inseguro incluso en red interna.

**Sugerencia (futura):** JWT firmado o sesion server-side. Por ahora documentar la limitacion. **No se modifica en este commit** porque requiere redisenar el flujo de login.

#### 3.1.3 Concurrencia / TOCTOU (medio)

En `AppointmentService.create()` y `reschedule()`:

1. Se ejecuta `validationChain.run(ctx)` que consulta `findOverlapping`.
2. Luego se hace `appointmentRepository.save(...)`.

Entre 1 y 2 otra transaccion concurrente podria insertar una cita solapada. La validacion pasaria en ambos hilos. No hay `@Lock(PESSIMISTIC_WRITE)` ni unique constraint en BD que cubra el rango temporal.

**Sugerencia:** advisory lock por `therapist_id + date`, o re-validar tras `save` y revertir si hay conflicto. Documentar como mejora pendiente.

#### 3.1.4 JSON construido a mano (bajo, pero fragil)

En `AppointmentService` se concatenan strings para construir el `payload` de los eventos:

```java
"{\"reason\":\"" + escape(reason) + "\"}"
```

Esto es fragil ante comillas anidadas, Unicode, etc. **Mejorable** sustituyendo por Jackson `ObjectMapper.writeValueAsString(...)`. **Se aplica en este commit** (ver seccion 5).

#### 3.1.5 Validacion Bean Validation incompleta

`CreateAppointmentRequest` solo valida `@NotNull` y `@Min/@Max` de duracion. Falta:
- `@PositiveOrZero` en `cuota`.
- `@Size(max=2000)` en `comments`.
- `@Size(max=500)` en `paymentProofPath`.

**Se aplica en este commit.**

#### 3.1.6 Logging ausente (medio)

Los services nunca llaman a `log.info(...)` ni `log.warn(...)`. En produccion no se sabra que cita se creo, ni que conflicto se evito.

**Se agrega logging basico al `AppointmentService` en este commit** (`@Slf4j` con `log.info` en create/cancel/reschedule/complete).

#### 3.1.7 GlobalExceptionHandler expone detalles internos

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiError> generic(Exception ex) {
    ... ex.getMessage() ...
}
```

`getMessage()` puede filtrar nombres de columnas, queries, paths. **Se ajusta** para devolver un mensaje generico y loguear el detalle real en el servidor.

#### 3.1.8 N+1 potencial

`AppointmentRepository.findInRange` trae entidades con `@ManyToOne` LAZY. El `DtoMapper` luego accede a `a.getPatient().getId()` etc., disparando una query por cita.

**Sugerencia:** agregar `JOIN FETCH` en `findInRange` o usar projection DTOs. Documentado como pendiente — no se aplica en este commit porque requiere ajustar el query y validar performance real.

#### 3.1.9 Sin documentacion OpenAPI

No hay `springdoc-openapi` ni Swagger. Cualquier integrador externo debe leer codigo.

#### 3.1.10 Sin diagrama de clases formal

Existe `diagrams/class_diagram/class_diagram_guide.md` pero no el diagrama. **Se agrega** un diagrama PlantUML del dominio en este commit.

### 3.2 Frontend

#### 3.2.1 `AppContext` mezcla responsabilidades (medio)

El context expone:
- Estado de sesion (`currentUser`)
- Cache de datos (`data`)
- Navegacion (`currentView`)
- Mutaciones (`createAppointment`, `cancelAppointment`, ...)

Eso es 3-4 responsabilidades en un solo contexto. Mejor: dividir en `AuthContext`, `DataContext`, y un hook `useAppointments()` que envuelva las mutaciones.

**No se aplica en este commit** (afecta arquitectura del frontend; conviene discutirlo antes).

#### 3.2.2 Validacion duplicada con riesgo de divergencia

`frontend/src/services/validation.ts` reimplementa las reglas del backend. Si la regla cambia en un lado se rompe la consistencia. La duplicacion esta justificada por UX inmediato, pero conviene:
- Marcarla como "preview" y siempre re-ejecutar via `/api/appointments/check` antes de enviar.

#### 3.2.3 Sin tests, sin error boundaries

No hay Vitest / Jest. Tampoco un `<ErrorBoundary>` raiz. Un throw en cualquier componente rompe toda la app.

#### 3.2.4 `localStorage` para el usuario

`currentUser` se serializa en `localStorage`. Si la app fuera atacada con XSS, se exfiltra. Aceptable para un demo interno, no para produccion.

#### 3.2.5 Falta `React.memo`/`useMemo` en componentes pesados

`CalendarGrid` y `AppointmentBlock` se re-renderizan cada vez que cambia cualquier dato del contexto. Para un calendario con 100+ citas conviene memorizar.

### 3.3 Diseño y documentacion

- **Falta diagrama de clases UML formal** (se entrega en este commit).
- **Falta diagrama de paquetes / arquitectura overview** (sugerido como siguiente entrega).
- **Falta seccion "decisiones de arquitectura"** en docs (ADRs cortos).

---

## 4. Cumplimiento de principios fundamentales

### 4.1 DRY

- ✅ El backend evita duplicacion: el `factory.fromReschedule` reutiliza datos del original.
- 🟡 La validacion se duplica entre front y back, pero esta justificada (defense in depth).

### 4.2 KISS

- ✅ Los patrones aplicados son los justos. No hay `AbstractSingletonProxyFactoryBean` ni cosas barrocas.
- 🟡 La cadena de validacion con 3 reglas podria ser un metodo simple, pero el OCP lo justifica.

### 4.3 YAGNI

- ✅ No hay endpoints, controllers o flags que no se usen.
- ✅ El frontend tiene un fallback local, pero esta usado activamente para el modo demo.

### 4.4 Cohesion y acoplamiento

- **Alta cohesion** entre paquetes (validation, state, factory son cajas independientes).
- **Bajo acoplamiento**: comunicacion entre servicios via eventos para audit.
- **Punto a mejorar**: `AppContext` del frontend es un god-object pequeño.

### 4.5 GRASP

- **Information Expert:** ✅ Cada clase del dominio sabe lo que le toca.
- **Creator:** ✅ El factory crea Appointment; los repos no construyen entidades fuera de save.
- **Controller:** ✅ `@RestController` son controllers GRASP, no contienen logica.
- **Low Coupling:** ✅ Audit desacoplado via eventos.
- **High Cohesion:** ✅ Paquetes especializados.
- **Polymorphism:** ✅ State, Strategy.
- **Pure Fabrication:** ✅ `AppointmentStateResolver` y `AppointmentValidationChain` son fabricaciones puras.
- **Indirection:** ✅ El mapper indireccia entre entidad y DTO.

---

## 5. Mejoras aplicadas

### 5.1 Primera tanda (bajo riesgo)

1. **Logging SLF4J** en `AppointmentService` y `PatientService` (`@Slf4j` + `log.info` por operacion clave).
2. **Eliminacion del escape manual de JSON** — se usa `ObjectMapper` inyectado.
3. **Validaciones Bean Validation faltantes** en `CreateAppointmentRequest` (`@PositiveOrZero`, `@Size`).
4. **`GlobalExceptionHandler` mas seguro**: el handler generico no expone `ex.getMessage()`; lo loggea y devuelve mensaje generico.
5. **Diagrama de clases del dominio** en `diagrams/class_diagram/domain_class_diagram.puml`.
6. **README de arquitectura** en `docs/05_final/arquitectura.md`.

### 5.2 Segunda tanda (aprobada por el equipo)

7. **`JOIN FETCH`** en `AppointmentRepository.findInRange` y `findByPatientId` — elimina N+1 al serializar DTOs.
8. **Cierre de TOCTOU** — re-validacion `findOverlapping` post-save con rollback en `AppointmentService.create` y `reschedule`.
9. **Springdoc OpenAPI** — `springdoc-openapi-starter-webmvc-ui` + `OpenApiConfig` + UI en `/swagger-ui.html`.
10. **`React.memo`** en `AppointmentBlock` y `DayColumn` con comparador a medida basado en `layout.appointment`, `now` y `data`.
11. **Tests unitarios backend**:
    - `WorkingHoursValidatorTest`, `OverlapValidatorTest`, `PatientLimitValidatorTest`, `AppointmentValidationChainTest`.
    - `AppointmentStateTest` (transiciones validas y rechazadas).
    - `AppointmentFactoryTest` (invariantes + herencia en reprogramacion).
12. **MapStruct** reemplaza el `DtoMapper` manual; el plugin compila la implementacion automaticamente.
13. **Autenticacion JWT** (HS256) — `JwtService` firma, `JwtAuthFilter` valida y popula `request.userId`, `CurrentUserArgumentResolver` lo lee. `AuthController.login` devuelve `LoginResponse(token, expiresInMinutes, user)`. Frontend guarda el token y manda `Authorization: Bearer ...`.
14. **Split de `AppContext`** en `AuthContext` (identidad) + `DataContext` (dominio). `useApp` se conserva como adaptador para compatibilidad.
15. **Diagrama de secuencia "Reprogramar cita"** en `diagrams/sequence_diagram/reprogramar_cita_sequence.{md,puml}`.

---

## 6. Pendientes futuros (no bloquean)

| Mejora | Notas |
|---|---|
| Tests de integracion `@SpringBootTest` con H2 | El stack ya tiene `h2` en scope test; falta crear el slice JPA con perfil de tests. |
| Migracion del esquema flyway para entornos h2 | El esquema actual es MySQL-dialect; necesita placeholders o un `application-test.yml` con `ddl-auto: create-drop`. |
| Revocacion de JWT (blacklist) | Hoy el token es valido hasta su expiracion natural. |
| Refresh tokens | Para sesiones largas sin pedir login frecuente. |
| Lock pesimista en BD (`SELECT ... FOR UPDATE`) | El re-check post-save resuelve el TOCTOU sin requerir locks; si se observara contention real, escalar a lock. |
| CI con `mvn test` + `npm test` | Para que las pruebas se ejecuten en cada PR. |
| Tests de frontend (Vitest) | Cobertura del flujo de wizard y validacion previa. |

---

## 7. Conclusion

Tras aplicar las dos tandas de mejoras, el modulo cumple con todos los fundamentos de diseño evaluados: capas, SOLID, GoF, GRASP, DRY/KISS/YAGNI, y agrega ahora seguridad real (JWT), concurrencia segura (cierre TOCTOU), cobertura inicial de pruebas y documentacion completa (clases + casos de uso + secuencia + arquitectura + analisis).

Los pendientes listados en seccion 6 son extensiones operativas, no carencias de diseño.
