# RNF-07 — Flujo Simplificado y Onboarding Operativo

## Descripción del requisito

El sistema garantizará que las tareas frecuentes del módulo de agenda: crear, consultar y reprogramar citas puedan completarse siguiendo un flujo continuo, predecible y sin pasos redundantes. La navegación entre vistas será consistente y el usuario siempre tendrá claro cómo avanzar, regresar o cancelar una acción sin perder el contexto de su tarea.

Este requisito aplica exclusivamente al personal administrativo (secretaria y coordinador) que opera el módulo desde entorno de escritorio.

---

## Justificación

Un flujo simplificado y autoexplicativo acelera la curva de aprendizaje, el personal administrativo llega a productividad más rápido y con menos supervisión. En el contexto de la clínica esto se traduce en menos tiempo dedicado a tareas administrativas y más tiempo para la atención directa o la gestión de la agenda.

- Un flujo con persistencia de datos al retroceder y confirmaciones claras reduce pérdidas parciales y entradas duplicadas.
- Si una secretaria nueva puede completar tareas críticas en su primer intento siguiendo la interfaz, la organización reduce horas de capacitación y consultas a TI. El resultado es menor coste operativo y mayor escalabilidad del servicio administrativo.
- Contar pasos medibles y reglas de persistencia permite auditar procesos, reproducir errores y garantizar integridad de datos

Implementarlo reduce errores, costos de formación y riesgos, y potencia los RNF de integridad de datos, validaciones y mensajes claros

---

## Criterios de aceptación

**CA-07.1** — Las tareas de crear, consultar y reprogramar una cita se completan en máximo 4 pasos cada una, contados desde que el usuario inicia la acción hasta que recibe confirmación.

Verificación: En diseño se traduce en un conteo explícito de pantallas o estados por flujo. Si en el wireframe del flujo de creación de cita hay más de 4 pantallas o pasos visibles, el diseño ya está fallando el criterio antes de llegar a desarrollo. Se puede documentar con un diagrama de flujo de pantallas que muestre exactamente cuántos pasos tiene cada tarea.

**CA-07.2** — En cualquier punto de un flujo activo, existe un elemento de "Cancelar" o "Regresar" que lleva al usuario al estado anterior sin perder los datos anteriormente ingresados.

Verificación: prueba funcional; iniciar flujo, avanzar N pasos, presionar cancelar/regresar y confirmar que los datos se restauran correctamente. En diseño, a cada pantalla del flujo se agrega una nota visible que diga exactamente qué datos deben persistir al regresar.
Si el prototipo está hecho en Figma o similar, se puede simular con variables o componentes con estado. Una tercera opción es un diagrama de flujo anotado donde cada flecha de "regresar" tiene una etiqueta que lista los campos que deben conservarse.

**CA-07.3** — No existen pantallas intermedias sin propósito funcional claro dentro de los flujos principales.

Verificación: Cada pantalla del diseño necesita justificación funcional. Si hay alguna que solo dice "¿Estás seguro?" sin dar información adicional, esa pantalla es candidata a eliminarse o fusionarse. Esto se audita revisando el mapa de pantallas completo.

**CA-07.4** — Un usuario sin experiencia previa puede completar el registro de una cita nueva en su primer intento siguiendo únicamente los elementos de la interfaz, sin consultar documentación externa.

Verificación: Esto se validará con una prueba de recorrido sobre el prototipo clickeable. Se sienta a alguien que no conoce el sistema, se le pide que registre una cita, y se observa si lo logra sin ayuda.

---

## Escenario de calidad

**Fuente:** Secretaria nueva, primer día de uso del sistema.

**Estímulo:** Intenta registrar una cita de evaluación inicial para un paciente nuevo, sin haber recibido capacitación formal.

**Entorno:** Sistema en producción; acceso desde navegador de escritorio en horario laboral.

**Artefacto:** Módulo de agenda — flujo de creación de cita.

**Respuesta esperada:** La secretaria puede completar el registro en <= 4 pasos siguiendo los controles visibles en pantalla, sin errores de navegación ni pérdida de datos.

**Métrica:** Tarea completada en primer intento; <= 4 pasos contados; 0 datos perdidos; tiempo de finalización registrado como referencia base.

---

## Alcance/Impacto

**Incluye:**

- Flujo de creación de cita (evaluación inicial y sesión terapéutica).
- Flujo de consulta y visualización de citas en calendario.
- Flujo de reprogramación de cita existente.
- Navegación entre vistas del módulo (acciones de volver/cancelar).

---

## Relación con otros RNF

**RNF-06 — Usabilidad y coherencia visual:**

- La guía de estilo y consistencia visual son condición necesaria para que los flujos sean predecibles.

**RNF-08 — Formularios y validaciones claras:**

- Los formularios dentro de los flujos deben respetar la agrupación lógica y el orden natural definidos en RNF-08.

**RNF-09 — Mensajes y retroalimentación al usuario:**

- Los mensajes de confirmación y error forman parte del flujo y deben integrarse sin interrumpirlo.

**RNF-10 — Compatibilidad escritorio y zoom:**

- La visibilidad de acciones principales depende del comportamiento correcto en resoluciones y niveles de zoom definidos en RNF-10.
