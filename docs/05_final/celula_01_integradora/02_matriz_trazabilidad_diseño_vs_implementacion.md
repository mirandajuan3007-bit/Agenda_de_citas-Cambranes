# Entregable 1 — Matriz de trazabilidad: diseño vs implementación

> **Cabecera de control**
>
> | Campo | Valor |
> |---|---|
> | Célula | Célula 1 — Integradora |
> | Fecha de corte | 2026-05-07 |
> | Rama | `contexto_ia` |
> | Commit base | (último commit de la rama al momento del corte) |
> | Versión del documento | 1.0 — levantamiento inicial |
> | Estado | En curso. Pendiente de hallazgos de Células 2 y 3 |

---

## 1. Propósito

Este documento extiende la matriz base de `docs/05_final/matriz_trazabilidad.md` con la información mínima necesaria para verificar **diseño vs implementación**:

- Qué archivo o componente del backend cubre cada requisito.
- Cómo puede probarse.
- Qué evidencia respalda la afirmación.
- Si lo implementado está documentado y viceversa.

La columna `Conformidad` se actualizará al integrar los hallazgos de Célula 2 y Célula 3 (Etapas 4 a 7 del procedimiento).

---

## 2. Convención de estados

| Estado | Significado |
|---|---|
| ✅ Cumple | Implementado y corresponde al diseño, con evidencia. |
| ⚠️ Cumple parcial | Implementado, pero existe una diferencia con el diseño o falta evidencia parcial. |
| ❌ No cumple | No implementado o contradice el diseño. |
| 🔲 Sin verificar | Aún no validado por la célula responsable. |

Estado de columna `Cambio no documentado`: **Sí** cuando hay implementación sin documento de respaldo.
Estado de columna `Deuda de implementación`: **Sí** cuando hay diseño/documento sin implementación detectada.

---

## 3. Inventario de artefactos detectados

### 3.1. Documentos de requisitos

| RF/RNF | Archivo | Estado |
|---|---|---|
| RF-01 | `docs/02_requirements/rf01_requirement_description.md` | ✅ Existe |
| RF-02 | `docs/02_requirements/rf02_requirement_description.md` | ✅ Existe |
| RF-03 | — | ❌ No existe |
| RF-04 | — | ❌ No existe |
| RF-05 | `docs/02_requirements/rf05_requirement_description.md` | ✅ Existe |
| RF-06 | `docs/02_requirements/rf06_requirement_description.md` | ✅ Existe |
| RF-07 | `docs/02_requirements/rf07_requirement_description.md` | ✅ Existe |
| RF-08 | `docs/02_requirements/rf08_requirement_description.md` | ✅ Existe |
| RF-09 | `docs/02_requirements/rf09_requirement_description.md` | ✅ Existe |
| RF-11 | — | ❌ No existe |
| RNF-02 | `docs/02_requirements/rnf02_requirement_description.md` | ✅ Existe |
| RNF-04 | `docs/02_requirements/rnf04_requirement_description.md` | ✅ Existe |
| RNF-06 | `docs/02_requirements/rnf06_requirement_description.md` | ✅ Existe |
| RNF-07 | `docs/02_requirements/rnf07_requirement_description.md` | ✅ Existe |
| RNF-09 | `docs/02_requirements/rnf09_requirement_description.md` | ✅ Existe |
| RNF-10 | — | ❌ No existe |
| RNF-11 | — | ❌ No existe |

### 3.2. Diagramas de flujo

| RF | Archivo |
|---|---|
| RF-01 | `docs/03_modeling/rf01_flow_diagram.png` |
| RF-02 | `docs/03_modeling/rf02_flow_diagram.png` |
| RF-05 | `docs/03_modeling/rf05_flow_diagram.jpg` |
| RF-06 | `docs/03_modeling/rf06_flow_diagram.png` |
| RF-07 | `docs/03_modeling/rf07_flow_diagram.png` |
| RF-08 | `docs/03_modeling/rf08_flow_diagram.png` |
| RF-09 | `docs/03_modeling/rf09_flow_diagram.jpg` |
| RF-03, RF-04, RF-11 | ❌ No existen |

### 3.3. Diseños técnicos

| RF | Archivo | Convención |
|---|---|---|
| RF-01 | `docs/04_design/rf01_database_design.md` | ✅ Correcta |
| RF-05 | `docs/04_design/rf05.database_desing.md` | ⚠️ Mal nombrado (D-03) |
| RF-08 | `docs/04_design/rf08_database_design.md` | ✅ Correcta |
| Resto | — | ❌ No existen |

### 3.4. Prototipos

| RF | Archivo |
|---|---|
| RF-01 | `prototypes/rf01_frontend_prototype.png` |
| RF-02 | `prototypes/rf02_frontend_prototype.png` |
| RF-06 | `prototypes/rf06_frontend_consultar_citas.jpg` |
| RF-07 | `prototypes/rf07_flow_diagram.png` |
| RF-08 | `prototypes/rf08_frontend_prototype.jpg` |
| RF-09 | `prototypes/rf09_frontend_prototype.jpeg` |
| RF-03, RF-04, RF-05, RF-11 | ❌ No existen |

### 3.5. Estructura de la implementación (backend)

Paquetes principales detectados en `backend/src/main/java/com/clinica/agenda/`:

- `config/` — `BusinessProperties`, `DataInitializer`, `SecurityConfig`.
- `dto/` — `AppointmentForm`, `CancelForm`, `PatientForm`, `RescheduleForm`.
- `enums/` — `AppointmentStatusCode`, `Role`.
- `exception/` — manejo centralizado (`GlobalExceptionHandler`, `BusinessException`, `ConflictException`, `NotFoundException`).
- `model/` — `Appointment`, `AppointmentStatus`, `AuditLog`, `Patient`, `Room`, `SessionType`, `Therapist`, `User`.
- `repository/` — repositorios Spring Data por cada entidad.
- `security/` — `AppUserDetails`, `AppUserDetailsService`.
- `service/` — `AppointmentService`, `AuditService`, `AvailabilityService`, `FolioGenerator`, `PatientService`.
- `web/` — `AppointmentWebController`, `AuthWebController`, `DashboardWebController`, `GlobalModelAttributes`, `PatientWebController`.

Migraciones:

- `backend/src/main/resources/db/migration/V1__schema.sql` — esquema completo (8 tablas + índices).
- `backend/src/main/resources/db/migration/V2__seed.sql` — estados, tipos de sesión, usuarios y datos demo.

Configuración:

- `backend/src/main/resources/application.yml` — perfiles, datasource, Flyway, actuator (`health`, `info`, `metrics`), reglas de negocio (`agenda.business.*`).
- `backend/src/main/resources/logback-spring.xml` — configuración de logs.

---

## 4. Matriz extendida — Requisitos funcionales

> Estados marcados como 🔲 dependen de hallazgos de Célula 2 o Célula 3. La Célula 1 levanta la primera versión y los actualiza al consolidar.

### RF-01 — Creación de cita

| Campo | Valor |
|---|---|
| Documento req. | ✅ `docs/02_requirements/rf01_requirement_description.md` |
| Diagrama | ✅ `docs/03_modeling/rf01_flow_diagram.png` |
| Diseño técnico | ✅ `docs/04_design/rf01_database_design.md` |
| Prototipo | ✅ `prototypes/rf01_frontend_prototype.png` |
| Implementación | ✅ `service/AppointmentService.java#create` |
| Punto de prueba | UI `/appointments/new` (POST). Probar dos flujos: `EVALUATION` y `THERAPY`. |
| Evidencia | Código entre líneas 58–98 del archivo. Estado inicial `SCHEDULED` confirmado en `enums/AppointmentStatusCode`. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 Sin verificar (Célula 2 debe probar ambos flujos y la regla de máx. 3 pendientes) |
| Célula | Célula 2 |
| Notas | Regla `max-pending-per-patient: 3` configurada en `application.yml`. Validada por `AvailabilityService#assertWithinPendingLimit`. |

### RF-02 — Mostrar resumen final antes de confirmar

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Diagrama | ✅ |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ✅ |
| Implementación | ✅ `templates/appointments/summary.html` + `web/AppointmentWebController` |
| Punto de prueba | UI: tras enviar el formulario de nueva cita, debe mostrarse pantalla de resumen antes de confirmar. |
| Evidencia | Existencia del template `summary.html`. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | ⚠️ D-01: el documento usa `Pendiente`, la implementación usa `SCHEDULED`. Confirmar etiqueta visual en el resumen. |

### RF-03 — Validar disponibilidad de recursos (transversal)

| Campo | Valor |
|---|---|
| Documento req. | ❌ Sin documento |
| Diagrama | ❌ Sin diagrama |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ❌ Sin prototipo |
| Implementación | ✅ `service/AvailabilityService.java` |
| Punto de prueba | Crear dos citas que se solapen en mismo terapeuta, sala o paciente. Debe responder con `ConflictException` y mensaje correspondiente. |
| Evidencia | `AvailabilityService#assertResourcesFree` (líneas 76–89). Queries `findOverlappingByTherapist`, `findOverlappingByRoom`, `findOverlappingByPatient` en `AppointmentRepository`. |
| Cambio no documentado | **Sí** — implementación existe sin documento de requisito |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 3 |
| Notas | Implementación parece sólida. Falta formalizar el documento del RF-03 para cerrar la trazabilidad. |

### RF-04 — Generación automática de ID de paciente

| Campo | Valor |
|---|---|
| Documento req. | ❌ Sin documento |
| Diagrama | ❌ Sin diagrama |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ❌ Sin prototipo |
| Implementación | ✅ `service/FolioGenerator.java` |
| Punto de prueba | Registrar paciente nuevo (flujo de evaluación inicial) y verificar que el campo `folio` siga el patrón `PAC-YYYYMMDD-NNNN` y sea único. |
| Evidencia | `FolioGenerator#next` con `synchronized` y verificación de unicidad contra `patientRepository.findByFolio`. Restricción `UNIQUE` en `V1__schema.sql` línea 16. |
| Cambio no documentado | **Sí** |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 3 |
| Notas | Verificar comportamiento en concurrencia. El uso de `AtomicInteger` + `synchronized` es defensivo, pero al reiniciar el servicio el contador vuelve a 1; la unicidad la garantiza la BD, no el contador. |

### RF-05 — Guardar datos del paciente e historial

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Diagrama | ✅ |
| Diseño técnico | ⚠️ Existe mal nombrado (`rf05.database_desing.md`) |
| Prototipo | ❌ Sin prototipo |
| Implementación | ✅ `service/PatientService.java` + `model/Patient.java` |
| Punto de prueba | Flujo paciente nuevo (desde RF-01 EVALUATION) y flujo paciente existente (búsqueda por folio o nombre). Verificar persistencia de campos básicos. |
| Evidencia | Tabla `patients` con `folio UNIQUE`, `full_name`, `phone`, `email`, `birth_date` en `V1__schema.sql` líneas 14–23. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | ⚠️ D-02: el documento de RF-05 referencia "RF-06" y "RF-07" con sentido distinto al definido. ⚠️ D-03: archivo de diseño mal nombrado. |

### RF-06 — Consultar detalles de una cita

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Diagrama | ✅ |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ✅ |
| Implementación | ✅ `web/AppointmentWebController` + `templates/appointments/detail.html` y `list.html` |
| Punto de prueba | UI: abrir una cita desde calendario y desde listado. Verificar campos: paciente, sala, terapeuta, tipo de sesión, duración, estado. |
| Evidencia | Templates en `backend/src/main/resources/templates/appointments/`. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | Confirmar que la consulta no muta datos. |

### RF-07 — Identificación visual de citas atrasadas

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Diagrama | ✅ |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ✅ |
| Implementación | ✅ `service/AppointmentService.java#isLate` |
| Punto de prueba | Crear una cita en estado `SCHEDULED` con hora pasada (manualmente en BD) y verificar el resaltado visual en la UI. Citas en `CANCELLED`, `RESCHEDULED` o `COMPLETED` no deben resaltarse. |
| Evidencia | `AppointmentService#isLate` (líneas 196–200). No muta BD, solo lectura. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | Cumple el principio del diseño: "atraso" no es un estado, es derivación temporal del estado actual. |

### RF-08 — Reprogramar una cita

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Diagrama | ✅ |
| Diseño técnico | ✅ `docs/04_design/rf08_database_design.md` |
| Prototipo | ✅ |
| Implementación | ✅ `service/AppointmentService.java#reschedule` |
| Punto de prueba | Reprogramar una cita en `SCHEDULED`. Verificar: cita original pasa a `RESCHEDULED`, se crea cita nueva en `SCHEDULED`, `rescheduled_to_id` apunta correctamente, transacción atómica. |
| Evidencia | Líneas 104–162 del archivo. Campo `rescheduled_to_id` en `V1__schema.sql` línea 70. Anotación `@Transactional`. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | Validar atomicidad: simular fallo en la creación de la nueva cita y verificar que el estado de la original no cambia. |

### RF-09 — Cancelar cita con anticipación

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Diagrama | ✅ |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ✅ |
| Implementación | ✅ `service/AppointmentService.java#cancel` |
| Punto de prueba | Cancelar una cita futura: debe pasar a `CANCELLED` con `cancelled_reason`, `cancelled_at`, `cancelled_by`. Intentar cancelar una cita ya iniciada o pasada: debe fallar. |
| Evidencia | Líneas 167–190. Validación `if (!appt.getStartAt().isAfter(now))`. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | Espacio vuelve a estar disponible al pasar a `CANCELLED` porque las queries de solapamiento filtran por estado. Confirmar que ese filtro existe en `AppointmentRepository`. |

### RF-11 — Confirmación final por correo electrónico

| Campo | Valor |
|---|---|
| Documento req. | ❌ Sin documento |
| Diagrama | ❌ Sin diagrama |
| Diseño técnico | ❌ Sin diseño |
| Prototipo | ❌ Sin prototipo |
| Implementación | ❌ No detectada (no existe paquete de mailing ni dependencia `spring-boot-starter-mail`) |
| Punto de prueba | n/a — no hay implementación |
| Evidencia | n/a |
| Cambio no documentado | No |
| Deuda de implementación | **Sí** |
| Conformidad | ❌ No cumple (no documentado, no implementado) |
| Célula | Célula 2 |
| Notas | Si el negocio lo requiere, debe abrirse historia formal y diseño antes de implementar. |

---

## 5. Matriz extendida — Requisitos no funcionales

### RNF-02 — Control de acceso básico y privacidad en UI

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Implementación | ✅ `config/SecurityConfig.java`, `enums/Role.java`, `security/AppUserDetailsService.java` |
| Punto de prueba | Ingresar con `secretaria@clinica.local` y con `coordinador@clinica.local`. Acceder a rutas protegidas sin sesión y verificar redirección a `/login`. Probar `/actuator/**` solo accesible para `COORDINATOR`. |
| Evidencia | `SecurityConfig#filterChain` (líneas 40–66). Seed de usuarios con roles en `V2__seed.sql`. BCrypt en `passwordEncoder()`. |
| Cambio no documentado | No |
| Deuda de implementación | No |
| Conformidad | 🔲 |
| Célula | Célula 3 |
| Notas | Verificar que ningún listado o URL exponga datos sensibles. |

### RNF-04 — Observabilidad, logging y recuperación

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Implementación | ⚠️ Parcial: `/actuator/health`, `/actuator/info`, `/actuator/metrics` expuestos. Logback configurado en `logback-spring.xml`. |
| Punto de prueba | `GET /actuator/health` debe responder `UP`. Verificar formato de logs. Confirmar mecanismo de respaldo de BD (Flyway maneja migraciones, pero no respaldos). |
| Evidencia | Sección `management:` en `application.yml` líneas 43–56. |
| Cambio no documentado | No |
| Deuda de implementación | A confirmar — verificar logs en formato JSON y respaldo de BD. |
| Conformidad | 🔲 |
| Célula | Célula 3 |
| Notas | Confirmar si los logs salen estructurados (JSON) o solo texto. |

### RNF-06 — Minimización de exposición de datos

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Implementación | ✅ Roles definidos en `enums/Role.java`. |
| Punto de prueba | Comparar pantallas con rol `SECRETARY` vs `COORDINATOR`. Verificar que `SECRETARY` no vea datos restringidos. |
| Evidencia | `SecurityConfig` controla acceso por ruta. Diferenciación de UI por rol debe verificarse en templates. |
| Cambio no documentado | No |
| Deuda de implementación | A confirmar |
| Conformidad | 🔲 |
| Célula | Célula 3 |

### RNF-07 — Usabilidad y diseño coherente

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Implementación | `templates/layout.html` + estilos compartidos |
| Punto de prueba | Recorrer flujos crear, consultar y reprogramar sin instructivo y comparar consistencia visual y de mensajes. |
| Evidencia | `templates/layout.html`, capturas de UI |
| Cambio no documentado | No |
| Deuda de implementación | A confirmar |
| Conformidad | 🔲 |
| Célula | Célula 2 |

### RNF-09 — Mensajes y retroalimentación al usuario

| Campo | Valor |
|---|---|
| Documento req. | ✅ |
| Implementación | `exception/GlobalExceptionHandler.java` + flash messages en controllers |
| Punto de prueba | Provocar errores típicos (cita en pasado, conflicto de horario, paciente sin folio) y validar mensajes claros. |
| Evidencia | `GlobalExceptionHandler` y excepciones tipadas (`BusinessException`, `ConflictException`, `NotFoundException`). |
| Cambio no documentado | No |
| Deuda de implementación | A confirmar |
| Conformidad | 🔲 |
| Célula | Célula 2 |

### RNF-10 — Adaptación a escritorio y zoom

| Campo | Valor |
|---|---|
| Documento req. | ❌ Sin documento |
| Implementación | A determinar — depende de CSS responsivo |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | Issue abierta sin documento. Si se confirma implementación, marcar como **cambio no documentado**. |

### RNF-11 — Facilidad de aprendizaje para usuarios nuevos

| Campo | Valor |
|---|---|
| Documento req. | ❌ Sin documento |
| Implementación | n/a — sin criterio de verificación definido |
| Conformidad | 🔲 |
| Célula | Célula 2 |
| Notas | Sin criterio medible. Recomendación: cerrar como deuda documental si no hay criterio. |

---

## 6. Artefactos transversales del diseño

| Artefacto | Existe en repo | Estado | Observación |
|---|---|---|---|
| Diseño BD general | ✅ `docs/05_final/diseño_base_de_datos.md` | 🔲 | Comparar contra `V1__schema.sql`. Tablas y campos coinciden a primera vista. |
| Contexto de implementación | ✅ `docs/05_final/implementation_context.md` | 🔲 | Reglas críticas aplicadas en código (estados, no eliminación física, regla de 3 pendientes). |
| Diseño BD RF-05 | ⚠️ `docs/04_design/rf05.database_desing.md` | 🔲 | Renombrar a `rf05_database_design.md` (D-03). |
| Diagrama ER | ❌ | 🔲 | Issue #30 abierta. Bloquea cierre formal de Célula 3. |
| Diagrama de arquitectura | ❌ | 🔲 | Issues #31 y #32 abiertas. |
| Diagrama de casos de uso | ❌ | 🔲 | Issue #29 abierta. |
| Esquema vigente | ✅ `backend/src/main/resources/db/migration/V1__schema.sql` | 🔲 | Cruce con diseño BD general. |
| Seed | ✅ `backend/src/main/resources/db/migration/V2__seed.sql` | 🔲 | Confirma estados `SCHEDULED, CANCELLED, RESCHEDULED, COMPLETED`. |

---

## 7. Comparación esquema diseño vs schema implementado

| Aspecto | Diseño (`diseño_base_de_datos.md`) | Implementación (`V1__schema.sql`) | Coincide |
|---|---|---|---|
| Tabla `users` con `email UNIQUE`, `password_hash`, `role` | ✅ | ✅ | Sí |
| Tabla `patients` con `folio UNIQUE` | ✅ | ✅ | Sí |
| Tabla `therapists` con `user_id` opcional | ✅ | ✅ + `room_id UNIQUE REFERENCES rooms` | **Cumple parcial**: el diseño menciona la regla de sala fija como opcional; la implementación la fuerza con `UNIQUE` (decisión técnica documentable). |
| Tabla `rooms` con `name`, `location`, `capacity` | ✅ | ✅ | Sí |
| Tabla `appointment_statuses` con `id SMALLINT`, `code UNIQUE` | ✅ | ✅ | Sí |
| Tabla `session_types` | ✅ | ✅ | Sí |
| Tabla `appointments` con `patient_id`, `therapist_id`, `room_id`, `session_type_id`, `start_at`, `end_at`, `duration_minutes`, `status_id`, `created_by` | ✅ | ✅ | Sí |
| Restricción `start_at < end_at` | ✅ | ✅ `chk_appt_time` | Sí |
| Restricción `duration_minutes > 0` | No mencionada | ✅ `chk_appt_duration` | **Cambio no documentado** (mejora) |
| Campo `cancelled_by` | No mencionado | ✅ | **Cambio no documentado** (mejora alineada con RF-09) |
| Campo `rescheduled_to_id` | No mencionado | ✅ | **Cambio no documentado** (mejora alineada con RF-08) |
| Campo `fee` | No mencionado | ✅ | **Cambio no documentado** |
| Tabla `audit_logs` | ✅ con `payload JSONB` | ✅ con `payload TEXT` | **Cumple parcial**: tipo distinto (`TEXT` vs `JSONB`). Posible decisión por compatibilidad H2. Confirmar con Célula 3. |
| Tabla `therapist_availabilities` opcional | ✅ opcional | ❌ no existe | Aceptable: era opcional. |
| Estados en seed: `SCHEDULED, CANCELLED, RESCHEDULED, COMPLETED` | ✅ | ✅ | Sí |

---

## 8. Discrepancias detectadas en levantamiento documental

> Estas discrepancias provienen de la matriz base y se mantienen aquí como referencia activa.

| ID | Origen | Descripción | Impacto | Célula | Estado |
|---|---|---|---|---|---|
| D-01 | RF-02 vs diseño BD vs código | RF-02 usa `Pendiente` como estado inicial. Diseño y código usan `SCHEDULED`. | Medio (la implementación es correcta; el documento de RF-02 quedó desfasado) | Célula 1 | Abierto — ajustar documento |
| D-02 | RF-05 (referencias internas) | Numeración cruzada incorrecta de RF en el documento. | Medio | Célula 1 | Abierto — corregir documento |
| D-03 | Archivo `rf05.database_desing.md` | Nombre fuera de convención. | Bajo | Célula 1 | Abierto — renombrar |
| D-04 | RF-03, RF-04, RF-11 | Sin documento de requisito ni diseño formal. RF-03 y RF-04 sí están implementados; RF-11 no. | Alto | Célula 1 | Abierto — formalizar o aceptar como deuda |
| D-05 | Schema vs diseño BD | Campos `cancelled_by`, `rescheduled_to_id`, `fee`, restricción `chk_appt_duration` no aparecen en el diseño general. | Bajo (mejoras) | Célula 3 | Abierto — actualizar diseño BD para reflejar implementación |
| D-06 | Audit log payload | Diseño dice `JSONB`, implementación usa `TEXT`. | Bajo | Célula 3 | Abierto — confirmar decisión |

---

## 9. Resumen del corte

| Indicador | Valor |
|---|---|
| RF totales considerados | 10 (RF-01 a RF-09 + RF-11) |
| RF con implementación detectada | 9 (todos menos RF-11) |
| RF con documento de requisito | 7 |
| RF con diseño técnico canónico | 2 (RF-01, RF-08) |
| RF con prototipo | 6 |
| RNF totales considerados | 7 |
| RNF con documento | 5 |
| Cambios no documentados detectados (a nivel inicial) | 5 (RF-03, RF-04 + 3 columnas/constraints en `appointments`) |
| Deudas de implementación | 1 (RF-11) |
| Discrepancias activas | 6 (D-01 a D-06) |
| Filas en estado 🔲 | Todas las funcionales y no funcionales — pendiente de cierre |

---

## 10. Próximos pasos

1. Esperar reporte de Célula 2 (RF funcionales y RNF de UX).
2. Esperar reporte de Célula 3 (RF transversales y RNF técnicos).
3. Consolidar hallazgos en `03_lista_consolidada_hallazgos.md`.
4. Cerrar conformidad por requisito en `04_clasificacion_conformidad.md`.
5. Emitir reporte final en `05_reporte_final_validacion.md`.

---

> Esta matriz será actualizada conforme lleguen los hallazgos. La fecha del último cambio se anota en la cabecera y en el changelog interno del archivo.

## Changelog

| Fecha | Versión | Autor | Cambios |
|---|---|---|---|
| 2026-05-07 | 1.0 | Célula 1 | Levantamiento inicial. Inventario, matriz extendida y discrepancias D-01 a D-06. |
