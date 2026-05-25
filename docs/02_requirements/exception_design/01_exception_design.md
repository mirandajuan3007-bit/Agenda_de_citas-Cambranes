# Diseño de excepciones y caminos NO felices — RF y RNF

> **Qué es este documento.** Los RF del módulo describen el *happy path*: qué hace el sistema cuando todo sale bien. Aquí se modela lo contrario: **qué puede salir mal en cada requisito, cómo se llega a ese fallo y qué solución propone el diseño para resolverlo.**
---

## 1. Marco: las tres preguntas que responde cada caso

Para cada camino no feliz se responde lo mismo que pediste analizar:

| Pregunta | En este documento |
|---|---|
| **¿Qué puede salir mal?** | Columna **Caso de excepción**. |
| **¿Cómo se llega a ese caso?** | Columna **Cómo se llega:** la acción o condición que produce el fallo. |
| **¿Cómo se detecta?** | Columna **Detección (regla / capa):** quién se da cuenta y con qué regla. |
| **¿Qué solución se propone?** | Columna **Solución / manejo propuesto** + **Resultado para el usuario**. |

Modelo mental: cada RF tiene **un flujo principal** (happy path, ya documentado) + **flujos alternos** (decisiones de negocio que devuelven al usuario) + **flujos de excepción** (errores que abortan o revierten la operación). Los RF actuales modelan bien el primero, el segundo (mejor en RF-03/RF-09) y casi nada el tercero. Este documento completa el segundo y el tercero.

---

## 2. Taxonomía de excepciones (anclada al código existente)

El backend ya centraliza el manejo de errores en `api/error/GlobalExceptionHandler.java` (patrón **Global Exception Handler**, ver `PATRONES_DE_DISEÑO.md`). Esa es la **fuente única de verdad** del comportamiento ante fallos, y este diseño se alinea a ella:

| Categoría de excepción | Tipo de dominio (clase real) | Respuesta | ¿Cuándo ocurre? | Quién la detecta |
|---|---|:--:|---|---|
| **Validación de formato/obligatoriedad** | `MethodArgumentNotValidException` (Bean Validation: `@NotNull`, `@Email`, `@Min`…) | **400** Bad Request + lista de errores por campo | Campos faltantes, formato inválido, tipos incorrectos | Capa `api` (DTO de entrada) |
| **Regla de negocio violada** | `BusinessRuleException` (lleva `List<ValidationError>`) | **409** Conflict + detalle | Horario laboral, solape, límite de citas | Capa `domain/validation` (Strategy + Chain) |
| **Transición de estado ilegal** | `IllegalStateTransitionException` | **409** Conflict | Cancelar/reprogramar una cita ya terminal | Capa `domain/state` (patrón State) |
| **Recurso inexistente** | `NotFoundException` | **404** Not Found | Cita/paciente/terapeuta/sala que no existe | Capa `service` |
| **Fallo técnico no controlado** | `Exception` (genérica) | **500** Internal Server Error, **mensaje genérico** | BD caída, timeout, bug, I/O | Capa `api` (handler genérico) |

**Vocabulario de errores de negocio ya usado en código** (campo `type` de `ValidationError`), para que los mensajes sean consistentes:

| `type` | Significado | Validador que lo emite |
|---|---|---|
| `working_hours` | Fin de semana, antes de `app.business.working-hours.start`, después de `…end`, o inicio ≥ fin | `WorkingHoursValidator` (`@Order(10)`) |
| `therapist` | El terapeuta ya tiene cita en ese rango | `OverlapValidator` (`@Order(20)`) |
| `room` | La sala ya está ocupada en ese rango | `OverlapValidator` (`@Order(20)`) |
| `patient` | El paciente ya tiene cita, o superó el máximo de citas activas | `OverlapValidator` / `PatientLimitValidator` (`@Order(30)`) |

> **Principio de seguridad ya presente y que el diseño adopta:** ante el `500` genérico, el sistema **registra el detalle internamente (log) pero devuelve un mensaje genérico al usuario**, para no filtrar nombres de tablas, queries ni rutas. (Comentario explícito en `GlobalExceptionHandler.generic(...)`.)

---

## 3. Catálogo de excepciones por requisito funcional

> Notación: **(N)** = excepción de negocio (esperada, se le habla al usuario). **(T)** = excepción técnica (inesperada, se registra y se da mensaje genérico). **(C)** = concurrencia.

### RF-01 — Creación de citas

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| Campos obligatorios faltantes o con formato inválido **(N)** | La secretaria deja vacío nombre/teléfono/correo/fecha/hora/duración, o escribe un correo malformado | Bean Validation en el DTO → `400` | No se intenta crear nada; se devuelve la lista de campos con error | Formulario marca cada campo en rojo con su mensaje; **no se pierde lo ya capturado** |
| Hora de inicio ≥ hora de fin **(N)** | Duración 0 o negativa, o fin mal calculado | `WorkingHoursValidator` (`working_hours`) → `409` | Se rechaza antes de tocar la BD | Mensaje "La hora de inicio debe ser anterior a la de finalización" |
| Fuera de horario laboral **(N)** | Fecha en sábado/domingo, o antes de 09:00 / fin después de 17:30 | `WorkingHoursValidator` (`working_hours`) → `409` | Se rechaza; se sugiere un horario válido (L–V 09:00–17:30) | Mensaje claro indicando la franja permitida |
| Solape de terapeuta, sala o paciente **(N)** | El horario elegido choca con otra cita activa | `OverlapValidator` (`therapist`/`room`/`patient`) → `409` | Se rechaza; el sistema indica **con cuál recurso** y en qué rango choca | "El terapeuta ya tiene una cita de 10:00 a 11:00", etc. |
| Límite de 3 citas activas por paciente **(N)** | El paciente ya tiene `max-active-appointments-per-patient` citas programadas | `PatientLimitValidator` (`patient`) → `409` | Se rechaza; se pide cancelar/completar una antes | Mensaje con la acción correctiva |
| Recurso seleccionado no existe **(N)** | Se eligió un terapeuta/sala/paciente que fue dado de baja o cuyo ID no existe | `service` → `NotFoundException` → `404` | Se aborta; se pide recargar catálogos | "El recurso seleccionado no está disponible" |
| Fallo de persistencia al guardar **(T)** | BD caída, timeout, restricción de integridad inesperada | Handler genérico → `500` + log interno | **La cita no se crea** (operación transaccional, todo o nada); ver RNF-01 | Mensaje genérico "Ocurrió un error… intente de nuevo"; nada queda a medias |
| Dos secretarias agendan el mismo hueco a la vez **(C)** | Ambas validan disponibilidad con éxito casi al mismo tiempo y luego guardan | TOCTOU | Re-validación dentro de la transacción + restricción de unicidad; la segunda escritura recibe `409` | A la segunda se le informa que el hueco acaba de ocuparse y se le pide elegir otro |

### RF-02 — Mostrar resumen final antes de confirmar

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| El usuario regresa a editar **(flujo alterno, no error)** | Detecta un dato incorrecto en el resumen | UI | Se vuelve al formulario **sin perder datos** (regla de negocio ya existente) y **sin generar ID** | Edita y vuelve al resumen |
| La disponibilidad cambió entre ver el resumen y confirmar **(C)** | Pasaron minutos; otra cita tomó el horario mientras se revisaba el resumen | Re-ejecución de RF-03 **al confirmar**, no solo al abrir el resumen | El sistema **revalida al confirmar**; si ya hay conflicto, no guarda y regresa con el error | "El horario dejó de estar disponible mientras revisabas; elige otro" |
| Doble clic en "Confirmar" **(C)** | El usuario pulsa Confirmar dos veces por lentitud de red | Idempotencia de la confirmación | El ID se genera **una sola vez**; la segunda confirmación no crea una cita duplicada | Se crea una única cita; la segunda acción es ignorada |
| Caída de sesión/red durante el resumen **(T)** | Se pierde conexión antes de confirmar | Capa `api`/sesión | Como el ID se genera **solo al confirmar**, no queda ninguna cita parcial | Al reconectar, los datos siguen en el formulario o se reinicia el flujo sin basura en BD |

### RF-03 — Validar disponibilidad de recursos

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| Falta la regla de **horario laboral** en el flujo **(N)** | El diagrama valida terapeuta/sala/paciente pero no horario | `WorkingHoursValidator` ya existe en la cadena (`@Order(10)`) | **Documentar/diagramar** el horario laboral como primer eslabón de la cadena | Coherencia entre diagrama y comportamiento real |
| Falta la regla de **límite de 3 citas** en el flujo **(N)** | Igual que arriba | `PatientLimitValidator` (`@Order(30)`) | Añadir ese eslabón al diagrama | — |
| Datos insuficientes para validar **(N)** | Se intenta validar sin fecha/hora/terapeuta seleccionados | Bean Validation / `ValidationContext` incompleto → `400` | No se ejecuta la validación de disponibilidad; se pide completar | "Selecciona fecha, hora y terapeuta para validar" |
| Fallo al consultar la BD durante la validación **(T)** | La query de solape (`findOverlapping`) falla por BD/timeout | Handler genérico → `500` | **Fail-safe: si no se puede *verificar* la disponibilidad, NO se permite guardar** (nunca asumir "disponible" ante un fallo) | Mensaje genérico; la operación se detiene sin guardar |
| Acumulación de varios errores a la vez **(N)** | El horario choca con terapeuta **y** sala **y** además es sábado | Chain of Responsibility acumula **todos** los `ValidationError` | Se devuelven **todos** los problemas juntos, no de uno en uno | El usuario corrige todo en un solo intento |

### RF-04 — Generación automática de ID de paciente

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| Paciente duplicado (se intenta crear uno que ya existe) **(N)** | La secretaria registra de nuevo a un paciente ya dado de alta | Búsqueda previa por datos clave (regla 5 de RF-04) | **No se genera ID nuevo**: se reutiliza el existente y se asocia la cita a su expediente | Se evita el expediente duplicado de forma transparente |
| Colisión del ID generado **(T)** | El mecanismo de generación produce un ID ya usado | Restricción de **unicidad** en BD | Se aborta y se regenera; si persiste, la operación falla limpiamente sin paciente a medias | El usuario no percibe el reintento; solo ve éxito o error |
| Fallo al persistir el nuevo paciente **(T)** | BD caída justo al crear el expediente | Handler genérico → `500` | **Atomicidad paciente+ID+cita**: si no se puede guardar, no queda un ID "huérfano" sin expediente (ver RNF-01) | Mensaje genérico; nada queda registrado a medias |

### RF-05 — Guardar datos del paciente e historial de citas

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| Datos del paciente inválidos **(N)** | Faltan datos básicos o tienen formato inválido | Bean Validation → `400` | No se crea el registro; se devuelven los campos a corregir | Formulario marca los errores |
| Recurso (consultorio/médico) no disponible **(N)** | El horario elegido choca | Delega en RF-03 → `409` | No se guarda la cita; se reusa el manejo de RF-03 | Mensaje de conflicto de RF-03 |
| **Guardado parcial** (se crea el paciente pero falla la cita, o viceversa) **(T)** | Error a mitad del proceso de dos pasos | Transacción de servicio | **Rollback total**: o se guardan paciente **e** historial+cita, o no se guarda nada (ver RNF-01) | No quedan pacientes sin cita ni citas sin paciente |
| Cambio de doctor de cabecera no disponible **(N)** | Se solicita cambio a un médico sin disponibilidad (regla 6) | RF-03 | Se conserva el doctor anterior y se informa | "El médico solicitado no tiene disponibilidad" |

### RF-06 — Consultar detalles de una cita

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| La cita no existe / no está disponible **(N)** | Se abre un enlace viejo, o la cita fue creada en otro entorno | `service` → `NotFoundException` → `404` | No se intenta renderizar nada; mensaje claro (regla 4 de RF-06) | "La cita no existe o no está disponible" |
| Identificador malformado **(N)** | ID con formato incorrecto en la petición | Bean Validation / parseo → `400` | Se rechaza antes de consultar | "Identificador de cita inválido" |
| Sin permiso para ver la cita **(N)** | Un rol sin privilegios intenta abrir el detalle | Control de acceso (ver RNF-02/RNF-05) → `403` | Se niega el acceso sin revelar datos | "No tienes permiso para ver esta información" |
| Fallo de lectura en BD **(T)** | BD caída al consultar | Handler genérico → `500` | La consulta **no modifica nada** (regla 5), así que reintentar es seguro | Mensaje genérico; puede reintentar |

### RF-07 — Identificación visual de citas atrasadas

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| Marca de atraso incorrecta por reloj desfasado **(T)** | Cliente con hora local mal configurada | Capa de presentación | Usar **la hora del servidor** como fuente de verdad para el cálculo de atraso | La alerta es consistente entre equipos |
| Se marca como atrasada una cita en estado terminal **(N)** | Cita cancelada/reprogramada/finalizada que pasó su hora | Regla 4 de RF-07 | El cálculo **excluye** `CANCELLED`/`RESCHEDULED`/`COMPLETED`; solo aplica a `SCHEDULED` | Las terminales nunca aparecen como atrasadas |
| Falla el cálculo de la alerta **(T)** | Error al evaluar la condición visual | Capa de presentación | **Degradación elegante**: si la alerta no se puede calcular, se muestra la agenda **sin** el resaltado, en lugar de romper toda la vista | La agenda sigue siendo usable |

### RF-08 — Reprogramar una cita

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| La cita a reprogramar no existe **(N)** | ID inexistente | `service` → `NotFoundException` → `404` | Se aborta antes de tocar estados | "La cita no existe" |
| La cita está en estado terminal **(N)** | Se intenta reprogramar una cita cancelada/finalizada/ya reprogramada | `domain/state` → `IllegalStateTransitionException` → `409` | El patrón State rechaza la transición; **solo `SCHEDULED` admite reprogramar** | "La cita está finalizada y no puede reprogramarse" |
| El nuevo horario no está disponible / fuera de horario **(N)** | El horario propuesto choca o cae fuera de L–V 09:00–17:30 | Delega en RF-03 → `409` | No se reprograma; se pide otro horario | Mensaje de conflicto de RF-03 |
| **Falla la creación de la nueva cita** (caso crítico de atomicidad) **(T)** | Error técnico justo después de marcar la original | Transacción de servicio | **Rollback**: si falla crear la nueva, la original **NO** cambia de estado (regla 5). Nunca queda una cita "reprogramada" sin sucesora | La cita original sigue intacta y vigente |
| Otro usuario tomó el nuevo horario entre validar y guardar **(C)** | TOCTOU  | Re-validación transaccional + unicidad | Segunda escritura recibe `409`; original intacta | "El horario dejó de estar disponible" |

### RF-09 — Cancelar citas con anticipación y actualizar la agenda

| Caso de excepción | Cómo se llega (disparador) | Detección (regla / capa) | Solución / manejo propuesto | Resultado para el usuario |
|---|---|---|---|---|
| La cita no existe **(N)** | ID inexistente | `service` → `NotFoundException` → `404` | Se aborta | "La cita no existe" |
| La cita ya pasó su hora **(N)** | Se intenta cancelar después de la hora programada (regla 1: solo antes) | Regla de negocio → `409` | No se permite cancelar; se sugiere otra acción (p. ej. marcar finalizada/no asistió) | "Solo puedes cancelar antes de la hora programada" |
| La cita ya está cancelada o finalizada **(N)** | Doble cancelación, o cancelar una terminal | `domain/state` → `IllegalStateTransitionException` → `409` | El patrón State rechaza la transición | "La cita ya está cancelada y no puede cancelarse de nuevo" |
| Falta el motivo de cancelación **(N)** | Se confirma sin escribir motivo (regla 4: el motivo se registra) | Bean Validation → `400` | No se cancela hasta capturar el motivo | "Indica el motivo de la cancelación" |
| Fallo de persistencia al cancelar **(T)** | BD caída al actualizar estado | Handler genérico → `500` | **Atomicidad**: o se cambia estado + se registra motivo/usuario/fecha + se libera el horario, o nada (ver RNF-01) | El horario no queda "medio liberado"; puede reintentar |

---

## 4. Excepciones técnicas transversales (no atadas a un solo RF)

Estas excepciones aplican a **cualquier** operación.

### 4.1. Fallo de persistencia / infraestructura

- **Cómo se llega:** BD caída, timeout, pérdida de red entre capas, restricción inesperada.
- **Solución de diseño:** toda operación de escritura es **transaccional** (todo o nada). El `GlobalExceptionHandler` captura cualquier `Exception` no prevista, la **registra con detalle en el log** y responde `500` con **mensaje genérico** (sin filtrar internals). Ver RNF-01 (atomicidad) y RNF-04 (logging/recuperación).

### 4.2. Concurrencia y TOCTOU (*Time Of Check To Time Of Use*)

- **Cómo se llega:** entre el momento en que el sistema **valida** disponibilidad (RF-03) y el momento en que **escribe** la cita, otra operación puede tomar el mismo hueco. La validación pasó para ambas, pero solo una debería ganar. 
- **Solución de diseño (defensa en profundidad):**
  1. **Restricción de unicidad / índice** a nivel de BD sobre `(terapeuta, rango)` y `(sala, rango)` para que la segunda escritura **falle a nivel de datos** aunque la validación haya pasado.
  2. **Re-validar dentro de la misma transacción** que escribe (no solo al abrir el formulario ni al mostrar el resumen de RF-02).
  3. Traducir el choque de escritura a `409` con el mismo mensaje de negocio ("el horario acaba de ocuparse").
- **Resultado:** nunca se crean dos citas para el mismo recurso/rango; el "perdedor" recibe un conflicto claro y reintenta.

### 4.3. Excepción no controlada / bug

- **Cómo se llega:** un caso no previsto (NPE, estado imposible, dato corrupto).
- **Solución:** el handler genérico evita que el stacktrace llegue al usuario; se registra para diagnóstico (RNF-04) y se responde `500` genérico. El sistema **falla de forma segura**: no deja datos a medias por la transacción.

### 4.4. Doble envío / idempotencia

- **Cómo se llega:** doble clic, reintento del navegador, red lenta.
- **Solución:** la confirmación que **genera el ID** (RF-02/RF-01) debe ser idempotente para no duplicar citas; las consultas (RF-06) son seguras por naturaleza (no modifican).

---

## 5. ¿También los RNF necesitan modelado de excepciones?

**Respuesta corta:** los RNF **no se modelan con "happy path vs. excepción"** como los RF, porque **no son flujos de uso** sino atributos de calidad. Pero **tres de ellos son, precisamente, los que definen cómo el sistema debe comportarse ante las excepciones de los RF.** Es decir: no hay que "agregarles excepciones", hay que reconocer que **son la política de excepciones**. Los demás RNF no requieren tratamiento de error de negocio (a lo sumo, degradación visual).

| RNF | ¿Requiere relación con excepciones? | Papel respecto a los caminos no felices |
|---|:--:|---|
| **RNF-01** Consistencia e integridad transaccional | **Sí** | **Garantiza el "todo o nada"** que invocan RF-04, RF-05, RF-08 y RF-09 ante un fallo técnico: rollback, sin estados parciales. |
| **RNF-04** Observabilidad, logging y recuperación | **Sí** | Define **qué se hace cuando algo falla a nivel sistema**: registrar el error (el `log.error` del handler genérico), poder diagnosticarlo y recuperarse tras una caída. |
| **RNF-09** Mensajes y retroalimentación | **Sí** | Define la **calidad del mensaje de error** que el usuario ve en cada caso `(N)` (claro, breve, diferenciado). Cada solución produce un mensaje que debe cumplir RNF-09. |

---

