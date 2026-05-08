# Reporte de Validación Técnica — Módulo de Agenda Cambranes

> **Célula:** Validación técnica (parte media y baja del ciclo V)
> **Alcance:** comparación entre el diseño técnico (`Agenda/`) y la implementación (`Agenda_Web/`)

---

## 1. Resumen ejecutivo

| Eje validado | Resultado | % cumplido |
|---|---|---|
| Arquitectura implementada vs diseñada | Parcial, la app frontend cumple, pero el backend/BD relacional del diseño no fue construido | 55 % |
| Modelo de base de datos vs esquema real | Sustituido, no hay BD, localStorage simula las tablas. Estructura espejea el diseño | 70 % estructural / 0 % persistencia real |
| Componentes (responsabilidades) | Aceptable, capas y separación se respetan, salvo por algunas decisiones no documentadas | 80 % |
| Lógica crítica de negocio (RFs) | Alto, 9/9 RFs implementados, pero con observaciones | 95 % |
| RNFs verificables a nivel técnico | Mixto, documentación y UI aceptables, integridad/seguridad/observabilidad débiles | 45 % |

> El módulo "funciona" como demo de frontend, pero no es una implementación del sistema diseñado. Es una simulación monolítica en cliente que omite el backend, la base de datos, la autenticación segura. Esto debe formalizarse o reescribirse antes de considerar el módulo cerrado.

---

## 2. Hallazgos críticos (importantes)

| # | Hallazgo | Severidad | Origen | Impacto |
|---|---|---|---|---|
| H-01 | No existe backend ni base de datos: el diseño define PostgreSQL con 8 tablas; la implementación usa `localStorage` desde React | Crítica | `docs/05_final/diseño_base_de_datos.md` vs `frontend/src/data/storage.ts` | Cualquier RNF de integridad, persistencia multiusuario o seguridad real es inalcanzable |
| H-02 | Contraseñas en texto plano: `User.password` (no `password_hash`); el diseño exige bcrypt/argon2 | Crítica | `frontend/src/types/index.ts:13-17` vs `diseño_base_de_datos.md` | Viola RNF-02 y la sección "Seguridad y buenas prácticas" del diseño |
| H-03 | `AuditLog` definido pero sin uso operativo: queda en localStorage del usuario; no hay forma de exportarlo, consultarlo o auditarlo | Alta | `frontend/src/data/storage.ts` | RNF-04 (observabilidad/logging) no se cumple |
| H-04 | Decisiones técnicas no documentadas: campos `cuota`, `rescheduledFromId`, `Therapist.roomId` (sala fija como atributo) viven solo en el código | Media | `frontend/src/types/index.ts` | Acumula deuda de diseño; el ER oficial no las contempla |
| H-05 | `Therapist.user_id` faltante en la implementación, aunque está en el diseño SQL | Media | `frontend/src/types/index.ts:32-39` | Se rompe la trazabilidad usuario-terapeuta prevista |
| H-06 | Hora "actual" hardcodeada (`DEMO_NOW = '2026-04-27T10:45:00'`) en lugar de `new Date()`; el indicador de "atrasada" depende de esa constante | Media | `frontend/src/data/seed.ts:16` | La aplicación no avanza con el reloj |

---

## 3. Checklist solicitado

| Checklist original | Resultado |
|---|---|
| Se revisó la arquitectura técnica implementada | Hecho |
| Se comparó el modelo de base de datos con el diseño aprobado | Hecho |
| Se revisaron módulos, servicios o componentes principales | Hecho |
| Se verificaron contratos entre componentes | Hecho |
| Se revisó la lógica técnica crítica del sistema | Hecho |
| Se validó la existencia de pruebas unitarias o técnicas | Hecho |
| Se registraron diferencias entre diseño técnico e implementación | Hecho |
| Se reportaron hallazgos a la célula integradora | Pendiente de envío |

---

## 4. Arquitectura: diseño vs implementación

### 4.1. Arquitectura diseñada

El diseño plantea un sistema web cliente-servidor con:

- **Frontend**: web accesible desde navegador, con vistas para personal administrativo.
- **Backend**: API protegida con autenticación y roles, que valida disponibilidad y persiste citas.
- **Base de datos**: PostgreSQL con 8 tablas relacionales (users, patients, therapists, rooms, appointments, appointment_statuses, session_types, audit_logs) más una tabla opcional (`therapist_availabilities`).
- **Seguridad**: contraseñas con bcrypt/argon2, secretos via variables de entorno, endpoints protegidos.
- **Auditoría**: `audit_logs` recibe registros de creación, actualización, cancelación y reprogramación.
- **Reglas de integridad**: FK con `ON DELETE RESTRICT`, `CHECK (start_at < end_at)`, índices compuestos, sin eliminación física de citas.

### 4.2. Arquitectura implementada

La implementación es una SPA monolítica en el cliente sin backend:

```
Navegador
  React 18 + Vite + TypeScript

  components/
    auth | calendar | dashboard | layout | modals | ...
        |
        v
  context/
    AppContext + useReducer -> API global (login, CRUD)
        |
        v
  services/
    appointments | patients | validation
        |
        v
  data/
    storage.ts (getData/saveData) + seed.ts
        |
        v
  localStorage
```

### 4.3. Comparativo

| Capa esperada | ¿Implementada? | Comentario |
|---|---|---|
| Frontend (React/SPA) | Sí | Buena separación por feature, alineado con la lista de prototipos |
| Capa de servicios (lógica de negocio) | Sí | `services/appointments.ts`, `patients.ts`, `validation.ts` cumplen el rol |
| API/Backend | No | No existe, los servicios escriben directo a localStorage |
| Base de datos relacional | No | Sustituida por una clave única en localStorage (`agenda_cambranes_v1`) que serializa todo el `AppData` |
| Auditoría persistente | Parcial | El array `auditLogs` existe pero vive en el navegador del usuario |
| Autenticación (sesiones, hash, JWT, etc.) | solo Frontend | Comparación de email/password en texto plano vs el array `users` del seed |
| Restricciones de integridad (FKs, CHECKs, índices) | Replicadas en código | La validación funcional está, pero no hay garantía estructural |

---

## 5. Componentes: revisión de responsabilidades

| Componente / Módulo | Responsabilidad esperada | Implementación | Cumple |
|---|---|---|---|
| `LoginPage` | Autenticación de usuario, redirección a dashboard | `components/auth/LoginPage.tsx` valida contra `users` en localStorage | Parcial — funcional; password en plano |
| `Sidebar`, `Header` | Navegación entre vistas | `components/layout/*` | Sí |
| `DashboardView` | Resumen del día | `components/dashboard/DashboardView.tsx` | Sí |
| `CalendarView`, `CalendarGrid`, `AppointmentBlock` | Visualización tipo calendario semanal | `components/calendar/*` | Sí |
| `PatientsView` | Listado y búsqueda de pacientes | `components/patients/PatientsView.tsx` | Sí |
| `NewAppointmentModal` | Wizard 5 pasos (RF-01, RF-02, RF-04, RF-05) | Implementado | Sí |
| `AppointmentDetailModal` | Consulta detalles (RF-06) | Implementado | Sí |
| `RescheduleModal` | Reprogramación (RF-08) | Implementado | Sí |
| `CancelModal` | Cancelación (RF-09) | Implementado | Sí |
| `services/validation.ts` | Validar disponibilidad (RF-03) | `validateAvailability` + `validateWorkingHours` + `runFullValidation` | Sí |
| `services/appointments.ts` | CRUD de citas + auditoría | Implementado correctamente | Sí |
| `services/patients.ts` | CRUD de pacientes + folio | Implementado correctamente | Sí |
| `context/AppContext.tsx` | Estado global tipo store | `useReducer` con acciones LOGIN/LOGOUT/NAVIGATE/REFRESH_DATA | Sí |
| Capa de control de acceso por rol | Diferenciar secretaria/coordinador | No implementada — login distingue role pero no se filtran vistas/acciones | No |
| Capa de logging exportable | RNF-04 | No existe | No |

---

## 6. Contratos entre componentes

Verificación de que las interfaces TypeScript que median entre capas concuerdan con el diseño:

| Contrato | Definido en | Coherencia con el diseño |
|---|---|---|
| `User` | `types/index.ts` | Difiere, usa `password` en plano en lugar de `password_hash` |
| `Patient` | `types/index.ts` | Coincide salvo `birth_date` opcional/vacío en el flujo nuevo paciente |
| `Therapist` | `types/index.ts` | No tiene `user_id` ni `notes`, agrega `roomId` |
| `Room` | `types/index.ts` | No tiene `capacity` ni `created_at` |
| `Appointment` | `types/index.ts` | Agrega `cuota` y `rescheduledFromId`; conserva el resto |
| `AppointmentStatus` | `types/index.ts` | 4 estados (1=SCHEDULED, 2=CANCELLED, 3=RESCHEDULED, 4=COMPLETED) |
| `SessionType` | `types/index.ts` | 2 tipos (1=Evaluación inicial, 2=Sesión terapéutica) |
| `AuditLog` | `types/index.ts` | Agrega `entityType: 'patient'`, faltan acciones `STATUS_CHANGE` |
| `CreateAppointmentInput` | `types/index.ts` | DTO de entrada al servicio, claro |
| `RescheduleInput` | `types/index.ts` | Solo `startAt` (terapeuta/sala/duración heredan del original) |
| `ConflictError` | `types/index.ts` | Tipo de retorno de `validateAvailability`, claro y suficiente |

---

## 7. Diferencias significativas

| ID | Diseño dice | Implementación hace | Tipo | Decisión recomendada |
|---|---|---|---|---|
| D-01 | PostgreSQL + tablas SQL | localStorage del navegador | Omisión arquitectónica | Construir backend antes de salir a producción |
| D-02 | `password_hash` con bcrypt/argon2 | `password` en texto plano | Violación de seguridad | Reescribir auth o documentar explícitamente "demo" |
| D-03 | Endpoints protegidos con auth/roles | Filtrado solo en frontend | Limitación esperada | Aceptable si se reconoce el alcance demo (ver RNF-02) |
| D-04 | `audit_logs` en BD con consulta SQL | Array en localStorage del cliente | Implementación incompleta | Persistir en backend o exportar como CSV |
| D-05 | `appointment_statuses` como tabla con códigos `SCHEDULED`/`CANCELLED`/`RESCHEDULED`/`COMPLETED` | `appointmentStatuses` en seed con mismos códigos | Coincide | |
| D-06 | `session_types` con `Evaluación inicial` y `Sesión terapéutica` | `sessionTypes` con esos dos elementos | Coincide | |
| D-07 | `CHECK (start_at < end_at)` en BD | Validación equivalente en `validateWorkingHours` | Equivalente funcional | |
| D-08 | Solapamiento prohibido por terapeuta/sala/paciente | `validateAvailability` lo cubre con fórmula `s1 < e2 && s2 < e1` | Coincide | |
| D-09 | Máx. 3 citas activas por paciente | `countScheduledAppointments` existe pero no se usa desde el wizard de creación | Bug funcional | Llamar a `countScheduledAppointments` antes de `createAppointment` |
| D-10 | Sala fija por terapeuta como decisión "abierta" en BD | Se materializa con `Therapist.roomId` (atributo del terapeuta) | Decisión técnica no formalizada | Documentar la decisión en `04_design` |
| D-11 | `cuota` y `payment_proof_path` mencionados como abiertos | Ambos implementados como campos opcionales de `Appointment` | Decisión técnica no formalizada | Decidir si entran al MVP y documentar |
| D-12 | Indicador visual de cita atrasada calculado en cliente | `isOverdue()` en `helpers.ts` con `now` inyectable | Correcto, hace match con el diseño | Quitar `DEMO_NOW` antes de producción |
| D-13 | Nueve (9) RFs documentados | Nueve (9) RFs implementados (con observaciones) | Coincide | |
| D-14 | Diez (10) RNFs documentados | Cumplimiento parcial | Mixto | Cerrar brechas de seguridad/observabilidad |

---

## 8. RNFs verificables

| RNF | Estado | Evidencia / hueco |
|---|---|---|
| RNF-01 Integridad transaccional | No real | localStorage no es transaccional, un fallo a mitad de `rescheduleAppointment` deja el estado inconsistente |
| RNF-02 Control de acceso y privacidad UI | Parcial | Login existe, cierre de sesión existe, filtrado por rol no implementado, password en plano |
| RNF-03 Documentación | Buena | `docs/01-05` están presentes |
| RNF-04 Observabilidad y logging | No | `auditLogs` queda en localStorage; no hay export ni consumo |
| RNF-05 Minimización de exposición de datos | Aceptable en UI | No hay rutas con datos, pero todo el seed (incluyendo passwords) está en `seed.ts` versionado |
| RNF-06 Usabilidad y diseño coherente | Aceptable | Componentes consistentes, toasts, modales, alineado con prototipos |
| RNF-07 Onboarding operativo | Buena | Wizard claro, sin tutorial ni texto de ayuda contextual |
| RNF-08 Claridad de formularios | Aceptable | Wizard 5 pasos bien segmentado |
| RNF-09 Mensajes y retroalimentación | Aceptable | `useToast` en mutaciones, `ConflictError` con mensajes específicos |
| RNF-10 Adaptación a escritorio y zoom | No verificado | Requiere prueba manual en navegador (No corresponde a la validación técnica) |

---

## 10. Conclusiones y recomendaciones

### 10.1. Conclusiones

1. El módulo implementa correctamente la capa de dominio funcional que el diseño describe (los 9 RFs están cubiertos), con calidad de código razonable y separación clara entre `types`, `services`, `context` y `components`.
2. El módulo no implementa el sistema diseñado en sentido estricto: no hay backend ni base de datos. Es una demo de cliente. Esta diferencia es estructural y debe formalizarse o asumiendo el alcance MVP-demo, o reescribiendo la arquitectura para producción.
3. Existen decisiones técnicas del código que no aparecen en el diseño (cuota, sala fija como atributo, rescheduledFromId, DEMO_NOW). Hay que decidir si se documentan o se retiran.
