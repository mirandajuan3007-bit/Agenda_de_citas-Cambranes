# Matriz de trazabilidad — Módulo de Agenda

## Propósito

Este documento relaciona cada requisito funcional y no funcional con sus artefactos de diseño y su evidencia de implementación. Sirve como instrumento central para que las células de validación del ciclo V puedan verificar si lo que está implementado corresponde a lo que fue diseñado y documentado.

Última revisión documental: 2026-05-07. La columna **Conformidad** y las columnas de verificación deben actualizarse por las células durante el proceso de validación.

Columnas de la matriz:

- **ID**: identificador del requisito.
- **Descripción**: nombre corto del requisito.
- **Documento de req.**: existe el archivo `rf##_requirement_description.md` en `docs/02_requirements`.
- **Diagrama de flujo**: existe el archivo `rf##_flow_diagram.*` en `docs/03_modeling`.
- **Diseño técnico**: existe el archivo `rf##_database_design.md` en `docs/04_design`.
- **Prototipo visual**: existe el archivo `rf##_*.*` en `prototypes/`.
- **Implementado**: la funcionalidad existe en el sistema actual.
- **Prueba ejecutada**: se ejecutó una prueba que valida el comportamiento.
- **Conformidad**: resultado de comparar diseño vs implementación.
- **Célula responsable**: célula del ciclo V asignada a validar este requisito.
- **Observaciones**: desviaciones, pendientes o notas relevantes.

---

## Estados de conformidad

| Estado | Significado |
|---|---|
| ✅ Cumple | Implementado y corresponde al diseño. |
| ⚠️ Cumple parcial | Implementado pero con diferencias respecto al diseño. |
| ❌ No cumple | No implementado o contradice el diseño. |
| 🔲 Sin verificar | Aún no ha sido validado por ninguna célula. |

---

## Requisitos funcionales

| ID | Descripción | Doc. req. | Diagrama | Diseño técnico | Prototipo | Implementado | Prueba ejecutada | Conformidad | Célula | Observaciones |
|---|---|---|---|---|---|---|---|---|---|---|
| RF-01 | Creación de cita | ✅ | ✅ | ✅ | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Soporta dos flujos: evaluación inicial y cita de terapia. Verificar ambos. Regla de negocio clave: máximo 3 citas pendientes por paciente. Estado inicial debe ser `SCHEDULED`. |
| RF-02 | Mostrar resumen final antes de confirmar | ✅ | ✅ | ❌ Sin diseño | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | ⚠️ DISCREPANCIA: el documento usa el estado `Pendiente`; el diseño de BD usa `SCHEDULED`. Verificar cuál usa la implementación real. Falta archivo en `docs/04_design`. |
| RF-03 | Validar disponibilidad de recursos | ❌ Sin doc. | ❌ Sin diagrama | ❌ Sin diseño | ❌ Sin prototipo | 🔲 | 🔲 | 🔲 Sin verificar | Célula 3 | ❌ Sin ningún artefacto. Es la regla transversal más crítica: valida terapeuta, sala y paciente simultáneamente. RF-01, RF-08 y RF-09 dependen de él. |
| RF-04 | Generación automática de ID de paciente | ❌ Sin doc. | ❌ Sin diagrama | ❌ Sin diseño | ❌ Sin prototipo | 🔲 | 🔲 | 🔲 Sin verificar | Célula 3 | ❌ Sin ningún artefacto. RF-05 menciona que se genera un folio único. Verificar si la implementación ya incluye este comportamiento aunque no esté documentado. |
| RF-05 | Guardar datos del paciente e historial | ✅ | ✅ | ⚠️ Existe mal nombrado | ❌ Sin prototipo | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | ⚠️ El archivo de diseño existe como `rf05.database_desing.md` (nombre incorrecto). ⚠️ El documento tiene referencias internas con numeración incorrecta de RF. Verificar dos flujos: paciente nuevo y paciente existente. |
| RF-06 | Consultar detalles de una cita | ✅ | ✅ | ❌ Sin diseño | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | La consulta debe poder realizarse desde el calendario y desde el listado. Debe mostrar: paciente, sala, terapeuta, tipo de sesión, duración y estado. La consulta no debe modificar datos. |
| RF-07 | Identificación visual de citas atrasadas | ✅ | ✅ | ❌ Sin diseño | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Condición visual derivada del tiempo. No es un estado de BD. La alerta aplica solo a citas en estado `SCHEDULED`. Citas canceladas, reprogramadas o finalizadas no deben mostrarse como atrasadas. |
| RF-08 | Reprogramar una cita | ✅ | ✅ | ✅ | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | No sobrescribe la cita original: la archiva y crea una nueva. Verificar atomicidad: si falla la nueva cita, la original no debe cambiar de estado. Aplica validación de RF-03. |
| RF-09 | Cancelar cita con anticipación | ✅ | ✅ | ❌ Sin diseño | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Solo se puede cancelar antes de la hora programada. Debe registrar motivo, fecha de cancelación y usuario responsable. Al cancelar, el espacio queda disponible para nuevas citas. |
| RF-11 | Confirmación final por correo electrónico | ❌ Sin doc. | ❌ Sin diagrama | ❌ Sin diseño | ❌ Sin prototipo | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | ❌ Sin ningún artefacto. Issue abierta. Si está implementado sin diseño, es un cambio no documentado que debe formalizarse. |

---

## Requisitos no funcionales

| ID | Descripción | Doc. req. | Implementado | Prueba ejecutada | Conformidad | Célula | Observaciones |
|---|---|---|---|---|---|---|---|
| RNF-02 | Control de acceso básico y privacidad en UI | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 3 | Verificar: login con correo/contraseña, roles (secretaria/coordinador), bloqueo de pantallas sin sesión, cierre de sesión, y que no se expongan datos sensibles en URL ni en listados. |
| RNF-04 | Observabilidad, logging y recuperación | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 3 | Verificar: logs en formato JSON, endpoint `/health`, métricas básicas, respaldo de BD, manejo centralizado de errores. Son artefactos técnicos, no visuales. |
| RNF-06 | Minimización de exposición de datos | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 3 | Validar control de acceso y visibilidad diferenciada por rol: secretaria vs. administrador/coordinador. |
| RNF-07 | Usabilidad y diseño coherente | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Verificar flujos de crear, consultar y reprogramar citas sin capacitación técnica. Validar consistencia visual y de mensajes entre pantallas. |
| RNF-09 | Mensajes y retroalimentación al usuario | ✅ | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Validar mensajes de error, éxito, advertencia y corrección. Los mensajes no deben prometer resultados que no se ejecutaron. |
| RNF-10 | Adaptación a escritorio y zoom | ❌ Sin doc. | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Issue abierta sin documento. Si está implementado, es un cambio sin respaldo documental. |
| RNF-11 | Facilidad de aprendizaje para usuarios nuevos | ❌ Sin doc. | 🔲 | 🔲 | 🔲 Sin verificar | Célula 2 | Issue abierta sin asignado. Sin documentación ni criterio de verificación definido. |

---

## Artefactos transversales del diseño

Estos artefactos afectan al sistema en general y no pertenecen a un solo RF. Son responsabilidad de la Célula 3 y deben validarse como parte del diseño técnico integral.

| Artefacto | Existe en repo | Estado de verificación | Célula | Observaciones |
|---|---|---|---|---|
| Diseño de base de datos (general) | ✅ `docs/05_final/diseño_base_de_datos.md` | 🔲 Sin verificar | Célula 3 | Validar tablas, columnas, tipos y relaciones contra BD real implementada. |
| Contexto de implementación | ✅ `docs/05_final/implementation_context.md` | 🔲 Sin verificar | Célula 3 | Verificar que los estados (`SCHEDULED`, `CANCELLED`, `RESCHEDULED`, `COMPLETED`) correspondan a los usados en la implementación. |
| Diseño de BD de RF-05 mal nombrado | ⚠️ `docs/04_design/rf05.database_desing.md` | 🔲 Sin verificar | Célula 3 | Existe pero viola la convención `rf##_database_design.md`. Debe renombrarse a `rf05_database_design.md`. |
| Diagrama entidad-relación | ❌ No existe | 🔲 Sin verificar | Célula 3 | Issue abierta sin asignado (#30). Sin este artefacto no se puede validar integridad del modelo completo. |
| Diagrama de arquitectura | ❌ No existe | 🔲 Sin verificar | Célula 3 | Issues abiertas sin asignado (#31, #32). Impide verificar separación de capas en implementación. |
| Diagrama de casos de uso | ❌ No existe | 🔲 Sin verificar | Célula 3 | Issue abierta sin asignado (#29). |

---

## Discrepancias críticas detectadas en revisión documental

Estas discrepancias fueron identificadas al comparar los documentos de requisitos entre sí y contra el diseño de base de datos. Deben ser verificadas con prioridad por las células antes de emitir cualquier resultado de conformidad.

| # | Origen | Descripción del problema | Impacto | Célula |
|---|---|---|---|---|
| D-01 | RF-02 vs diseño de BD | RF-02 usa el estado `Pendiente` como estado inicial de la cita al confirmarla. El diseño de BD define `SCHEDULED` como estado inicial. | Alto. Si la implementación usa un nombre distinto, las validaciones de estado fallarán. | Células 2 y 3 |
| D-02 | RF-05 (referencias internas) | El documento RF-05 hace referencias internas con números de RF incorrectos. Menciona "RF-06" como generación de ID y "RF-07" como creación de citas, pero en el proyecto esos números corresponden a consultar detalles y a identificación visual respectivamente. | Medio. Genera confusión al leer las dependencias del requisito. | Célula 1 |
| D-03 | `docs/04_design/rf05.database_desing.md` | El archivo de diseño de RF-05 existe pero está mal nombrado. No sigue la convención `rf##_database_design.md`. El validador lo reporta como error. | Bajo. No afecta funcionalidad pero rompe trazabilidad automática. | Célula 3 |
| D-04 | RF-03, RF-04, RF-11 | Tres requisitos no tienen ningún artefacto de diseño. Si ya están implementados, la implementación existe sin respaldo documental. | Alto. Sin diseño previo no se puede verificar si lo implementado es correcto. | Células 2 y 3 |

---

## Instrucciones para las células

### Célula 1 — Integradora
1. Usar este documento como base de trabajo.
2. Resolver o escalar las discrepancias críticas D-01 a D-04 antes de finalizar la validación.
3. Actualizar la columna **Conformidad** y **Observaciones** conforme lleguen los hallazgos de Célula 2 y Célula 3.
4. Marcar cada fila con el estado final: ✅ Cumple, ⚠️ Cumple parcial o ❌ No cumple.
5. Generar el reporte final con el resumen de conformidad del proyecto.

### Célula 2 — Funcional
1. Tomar todas las filas marcadas como **Célula 2** en la tabla de RF y RNF.
2. Para cada RF: revisar el documento de requisito y verificar que la implementación cubra todos los campos, flujos y reglas de negocio descritos.
3. Prestar atención especial a:
   - RF-01: probar ambos flujos (evaluación inicial y cita de terapia) y la regla de máximo 3 citas pendientes.
   - RF-02: verificar qué nombre de estado usa la implementación y reportarlo a Célula 1 (discrepancia D-01).
   - RF-07: confirmar que la alerta visual no cambia el estado en la BD.
   - RF-08: verificar que la cita original no se sobrescriba y que el proceso sea atómico.
   - RF-09: verificar que no se pueda cancelar una cita ya pasada y que el motivo quede registrado.
4. Actualizar la columna **Implementado** y **Prueba ejecutada**.
5. Reportar desviaciones con evidencia a Célula 1.

### Célula 3 — Técnica
1. Tomar todas las filas marcadas como **Célula 3** y los artefactos transversales.
2. Para RF-03 y RF-04: verificar si la implementación tiene lógica para validar disponibilidad y generar ID aunque no exista documento. Reportar el hallazgo.
3. Para artefactos transversales:
   - Comparar esquema de BD real (tablas, columnas, tipos de datos) contra `docs/05_final/diseño_base_de_datos.md`.
   - Verificar los estados reales usados en la tabla `appointment_statuses` (discrepancia D-01).
   - Renombrar `rf05.database_desing.md` a `rf05_database_design.md` o proponer la corrección formal.
4. Para RNF-02: probar acceso con roles distintos y verificar que no se exponen datos sensibles.
5. Para RNF-04: verificar si existen logs estructurados, endpoint `/health` y mecanismo de respaldo.
6. Actualizar columnas correspondientes.
7. Reportar desviaciones con evidencia a Célula 1.

---

## Resumen de estado actual

| Indicador | Valor | Notas |
|---|---|---|
| RF con documentación completa | 3 de 10 | RF-01, RF-08 y RF-05 (diseño mal nombrado) |
| RF con diseño técnico correcto | 2 de 10 | RF-01 y RF-08. RF-05 tiene diseño mal nombrado. |
| RF con prototipo visual | 6 de 10 | RF-01, RF-02, RF-06, RF-07, RF-08, RF-09 |
| RF verificados contra implementación | 0 de 10 | Pendiente de ejecución por las células |
| RNF documentados | 5 de 7 | RNF-10 y RNF-11 sin documento |
| RNF verificados contra implementación | 0 de 7 | Pendiente de ejecución por las células |
| Artefactos transversales completos | 2 de 6 | Falta ER, arquitectura y casos de uso |
| Discrepancias críticas detectadas | 4 | Ver tabla de discrepancias D-01 a D-04 |

> Este documento debe actualizarse conforme cada célula avance en su validación. La Célula 1 es responsable de mantenerlo al día.
