# Comparativo Requisito por Requisito — Diseño vs Implementación

Convenciones de la columna "resultado":

1. Sí: Cumple
2. Parcial: Cumple parcialmente
3. No: No cumple
4. Manual: Se requiere validación manual

---

## Requisitos funcionales

### RF-01 — Creación de citas

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Dos tipos de cita (Evaluación inicial / Cita de terapia) | Sí | `sessionTypes: [Evaluación inicial, Sesión terapéutica]` + wizard paso 1 | Sí |
| Datos de evaluación inicial (nombre, apellidos, tel, correo, terapeuta, fecha, hora, duración, sala, comentarios) | Sí | Wizard pasos 2 y 3 capturan equivalentes (sin "apellidos" separado) | Parcial, combina nombre+apellidos en `fullName` |
| Datos de cita de terapia (paciente existente, folio, terapeuta, fecha, hora, duración, sala, comprobante de pago, cuota, comentarios) | Sí | Wizard captura equivalentes; `paymentProofPath` y `cuota` están en el tipo | Sí |
| Folio se genera automáticamente | Sí | `createPatient` genera `PAC-XXXX` | Sí (RF-04) |
| Cita aparece automáticamente en la agenda | Sí | `dispatch REFRESH_DATA` re-renderiza el calendario | Sí |
| Regla 1: terapeuta sin doble cita | Sí | `validateAvailability` por `therapistId` | Sí |
| Regla 2: sala sin doble cita | Sí | `validateAvailability` por `roomId` | Sí |
| Regla 3: paciente sin doble cita | Sí | `validateAvailability` por `patientId` | Sí |
| Regla 4: hora inicio < hora fin | Sí | `validateWorkingHours` retorna error | Sí |
| Regla 5: estado inicial = "programada" | Sí | `statusId: 1 // SCHEDULED` en `createAppointment` | Sí |
| Regla 6: máx. 3 citas pendientes por paciente | Sí | `countScheduledAppointments` existe, pero no se invoca desde el wizard | No |
| **Cumplimiento RF-01** | | | aprox. 90 % |

### RF-02 — Mostrar resumen final antes de confirmar

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Pantalla de resumen previo a guardar | Sí | Wizard paso 4 = pantalla de resumen | Sí |
| Permite confirmar o regresar a editar | Sí | Botones Atrás / Confirmar en el modal | Sí |
| Información mínima (paciente, fecha, hora, servicio, profesional, observaciones, estado preliminar) | Sí | Resumen muestra paciente, terapeuta, fecha, hora, sala, tipo, comentarios | Sí |
| Regla "no se confirma sin revisar resumen" | Sí | El paso 4 es obligatorio para llegar a `createAppointment` | Sí |
| Regla "estado inicial Pendiente" (SCHEDULED) | Sí | `statusId=1` se asigna al confirmar | Sí |
| Regla "ID se genera al confirmar" | Sí | `data.nextAppointmentId` se incrementa solo al guardar | Sí |
| Regla "datos no se pierden al regresar" | Sí | Estado del wizard se preserva al cambiar `step` | Sí |
| **Cumplimiento RF-02** | | | 100 % |

### RF-03 — Validar disponibilidad de recursos

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Valida terapeuta, sala y paciente | Sí | `validateAvailability` los cubre | Sí |
| Valida en flujo de creación | Sí | `NewAppointmentModal` paso 3 llama a `runFullValidation` | Sí |
| Valida en flujo de reprogramación | Sí | `RescheduleModal` llama a `runFullValidation` con `excludeAppointmentId` | Sí |
| Bloquea operación si hay conflicto | Sí | `conflicts.length > 0` deshabilita "Continuar"/"Confirmar" | Sí |
| Mensaje de error claro | Sí | `ConflictError.message` con horario exacto del conflicto | Sí |
| No modifica información | Sí | `validateAvailability` es pura, sin side effects | Sí |
| Considera horario laboral lun-vie 9-17:30 | Sí (RF-08) | `validateWorkingHours` lo aplica | Sí |
| **Cumplimiento RF-03** | | | 100 % |

### RF-04 — Generación automática de ID de paciente

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Genera ID al alta del paciente por primera vez | Sí | `createPatient` genera `PAC-XXXX` | Sí |
| ID único en el sistema | Sí | Secuencia `nextPatientId++` evita colisiones dentro del mismo store | Sí (pero limitado a localStorage local) |
| Reutilización para citas posteriores | Sí | Wizard permite seleccionar paciente existente y usar su `id` | Sí |
| No genera nuevo ID si ya existe | Sí | El flujo de "paciente existente" reutiliza el `id` | Sí |
| **Cumplimiento RF-04** | | | 95 % |

### RF-05 — Guardar datos del paciente e historial de citas

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Manejar paciente nuevo y existente sin duplicar | Sí | Wizard paso 2 distingue ambos casos | Sí |
| Guardar datos básicos del paciente | Sí | `createPatient` los persiste en localStorage | Sí |
| Asociar cita al historial del paciente | Sí | `Appointment.patientId` permite consultar historial | Sí (`getAppointmentsByPatient`) |
| Mostrar mensaje de error si falla | Sí | `try/catch` en el wizard | Sí |
| Regla "doctor de cabecera" actualizable | Sí | No implementado (no existe el concepto en el código) | No |
| Resultado de evaluación inicial | Sí | No implementado | No |
| **Cumplimiento RF-05** | | | 70 % |

### RF-06 — Consultar detalles de una cita

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Selección desde calendario | Sí | Click en `AppointmentBlock` abre `AppointmentDetailModal` | Sí |
| Selección desde listado | Sí | `DashboardView` y `PatientsView` permiten abrir el detalle | Sí |
| Muestra paciente, sala, terapeuta, tipo, duración, estado | Sí | `AppointmentDetailModal` muestra todos esos campos | Sí |
| Mensaje de error si la cita no existe | Sí | `if (!appointment) return null;` (sin mensaje) | Parcial |
| Consulta no modifica la cita | Sí | El modal no muta nada al abrir | Sí |
| **Cumplimiento RF-06** | | | 95 % |

### RF-07 — Identificación visual de citas atrasadas

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Resaltado visual en calendario y listado | Sí | `AppointmentBlock` aplica clase de "atrasada" via `isOverdue` | Sí |
| Atrasada = SCHEDULED + hora inicio pasada | Sí | `isOverdue(statusId, startAt, now)` | Sí |
| Cancelada/reprogramada/finalizada NO se muestra como atrasada | Sí | Condición exige `statusId === 1` | Sí |
| No modifica el estado almacenado | Sí | Es una función pura usada solo en presentación | Sí |
| Consistente en todas las vistas | Sí | Se aplica en calendario y modal de detalle | Sí |
| **Cumplimiento RF-07** | | | 100 % (estructural; `DEMO_NOW` invalida el comportamiento real en producción) |

### RF-08 — Reprogramar una cita

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| No sobrescribe datos originales | Sí | Original cambia `statusId` a 3 (RESCHEDULED) | Sí |
| Genera cita nueva | Sí | `rescheduleAppointment` crea otra con `rescheduledFromId` | Sí |
| Valida disponibilidad antes de guardar | Sí | `RescheduleModal` llama a `runFullValidation` con exclusión | Sí |
| Solo reprogramables si están en SCHEDULED | Sí | Throw si `statusId !== 1` | Sí |
| Atomicidad ante fallo | Sí | localStorage no es transaccional; si falla la 2ª escritura el original ya cambió | Parcial |
| Audit log de la acción | Sí | `auditLogs.push({ action: 'RESCHEDULE' })` | Sí |
| **Cumplimiento RF-08** | | | 90 % |

### RF-09 — Cancelar citas con anticipación

| Aspecto | Diseño | Implementación | Resultado |
|---|---|---|---|
| Solo se cancelan citas antes de su hora | Sí | `cancelAppointment` solo valida `statusId === 1` (no valida fecha actual contra startAt) | Parcial — falta validar que `now < startAt` |
| Cambio de estado a "cancelada" | Sí | `statusId = 2` | Sí |
| Motivo de cancelación obligatorio | Sí | `CancelModal` | Sí |
| Fecha de cancelación registrada | Sí | `cancelledAt = toLocalISO(new Date())` | Sí |
| Usuario responsable registrado | Sí | `auditLogs` con `performedBy` | Sí |
| Horario queda libre tras cancelar | Sí | `validateAvailability` ignora `statusId === 2` | Sí |
| **Cumplimiento RF-09** | | | 90 % |

### Resumen RFs

| RF | % cumplimiento |
|---|---|
| RF-01 Creación | 90 % |
| RF-02 Resumen | 100 % |
| RF-03 Validación disponibilidad | 100 % |
| RF-04 ID paciente | 95 % |
| RF-05 Guardar paciente/historial | 70 % |
| RF-06 Consultar | 95 % |
| RF-07 Atrasadas | 100 % |
| RF-08 Reprogramar | 90 % |
| RF-09 Cancelar | 90 % |
| **Promedio** | **92 %** |

---

## Requisitos no funcionales

### RNF-01 Consistencia e integridad transaccional

| Criterio | Implementación | Resultado |
|---|---|---|
| Operaciones atómicas (todo o nada) | localStorage no es transaccional. `rescheduleAppointment` modifica el original y luego escribe la nueva; un fallo intermedio deja el estado parcial | No |
| No se almacenan resultados parciales tras fallo | Sin protección | No |
| Notificación de error al usuario | Toast en errores capturados | Parcial, solo si el error se lanza |
| **Cumplimiento RNF-01** | | 15 % |

### RNF-02 Control de acceso básico y privacidad UI

| Criterio | Implementación | Resultado |
|---|---|---|
| Login con email + password | `LoginPage` lo cumple | Sí |
| Roles secretaria / coordinador | Existen en seed | Sí (a nivel tipo) |
| Filtrado de vistas por rol | No implementado; ambos roles ven todas las pantallas | No |
| Bloqueo de pantallas sin sesión | `currentUser ? AppShell : LoginPage` | Sí |
| Cierre de sesión y regreso al login | `logout()` en Header | Sí |
| No exponer datos sensibles innecesarios | Listados muestran solo nombre/folio/contacto | Sí |
| Datos sensibles fuera de URL | App es SPA sin rutas; cumple por arquitectura | Sí |
| **Cumplimiento RNF-02** | | 70 % |

### RNF-03 Documentación

| Criterio | Implementación | Resultado |
|---|---|---|
| Documentación general | `README.md` + `docs/01_problem_definition` | Sí |
| Documentación técnica de componentes | `services/`, `context/`, `utils/`, `components/` | Sí |
| Endpoints documentados | No hay endpoints, diseño los menciona pero implementación no | Parcial |
| Instrucciones de uso para personal administrativo | Comentarios en `seed.ts` con credenciales demo, pero no manual de usuario | Parcial |
| Estructura clara y consistente | Sí | Sí |
| **Cumplimiento RNF-03** | | 80 % |

### RNF-04 Observabilidad y logging

| Criterio | Implementación | Resultado |
|---|---|---|
| Logs de acciones críticas | `auditLogs` array dentro del store local | Parcial, existe pero no se consume |
| Capacidad de auditar quién hizo qué | `performedBy + performedAt` registrados | Parcial, sí, pero solo accesibles inspeccionando localStorage manualmente |
| Detección y reporte de errores | `try/catch` con toast | Parcial, reactivo, no centralizado |
| **Cumplimiento RNF-04** | | 30 % |

### RNF-05 Minimización de exposición de datos

| Criterio | Implementación | Resultado |
|---|---|---|
| Listados muestran lo mínimo necesario | Sí | Sí |
| Sin datos sensibles en URL | SPA sin rutas | Sí |
| Datos cifrados en almacenamiento | localStorage en plano | No |
| **Cumplimiento RNF-05** | | 60 % |

### RNF-06 Usabilidad y diseño coherente

| Criterio | Implementación | Resultado |
|---|---|---|
| Componentes consistentes entre vistas | Sí (`Modal`, `Badge`, `Toast` reutilizables) | Sí |
| Navegación clara | Sidebar + Header | Sí |
| Coherencia visual | CSS global en `styles/globals.css` | Manual |
| **Cumplimiento RNF-06** | | aprox 90 % |

### RNF-07 Onboarding operativo

| Criterio | Implementación | Resultado |
|---|---|---|
| Flujos guiados para tareas frecuentes | Wizard de 5 pasos para crear cita | Sí |
| Texto de ayuda contextual | Mínimo (algunos labels descriptivos) | Parcial |
| **Cumplimiento RNF-07** | | 70 % |

### RNF-08 Claridad y organización de formularios

| Criterio | Implementación | Resultado |
|---|---|---|
| Formularios segmentados | Wizard 5 pasos | Sí |
| Validación inline | `ConflictError` mostrado en paso 3 | Sí |
| **Cumplimiento RNF-08** | | 90 % |

### RNF-09 Mensajes y retroalimentación

| Criterio | Implementación | Resultado |
|---|---|---|
| Toast tras operaciones | `useToast` consumido en App | Sí |
| Mensajes de error específicos | `ConflictError.message` con detalle | Sí |
| **Cumplimiento RNF-09** | | 90 % |

### RNF-10 Adaptación a escritorio y zoom

| Criterio | Implementación | Resultado |
|---|---|---|
| Layout responde al tamaño de viewport | Requiere verificación manual | Manual |
| Zoom no rompe el layout | Requiere verificación manual | Manual |
| **Cumplimiento RNF-10** | | No verificado |

### Resumen RNFs

| RNF | % cumplimiento |
|---|---|
| RNF-01 Integridad | 15 % |
| RNF-02 Control de acceso | 70 % |
| RNF-03 Documentación | 80 % |
| RNF-04 Observabilidad | 30 % |
| RNF-05 Minimización de datos | 60 % |
| RNF-06 Usabilidad | 85 % |
| RNF-07 Onboarding | 70 % |
| RNF-08 Formularios | 90 % |
| RNF-09 Mensajes | 90 % |
| RNF-10 Escritorio/zoom | Sin verificar |
| **Promedio (sin no verificados)** | **aprox. 65 %** |
