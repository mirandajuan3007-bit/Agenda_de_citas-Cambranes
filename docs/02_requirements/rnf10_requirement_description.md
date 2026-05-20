# RNF-10 — Adaptación a escritorio y zoom

## Descripción del requisito

El sistema garantizará que la interfaz del módulo de agenda conserve su estructura visual, legibilidad y accesibilidad a controles cuando se opere desde un entorno de escritorio y al aplicar distintos niveles de zoom en el navegador. Los elementos interactivos, formularios y mensajes permanecerán visibles y utilizables sin desbordamientos, recortes ni traslapes que interrumpan la ejecución de tareas.

Este requisito aplica exclusivamente al personal administrativo (secretaria y coordinador) que opera el módulo desde navegador de escritorio en condiciones reales de trabajo.

---

## Criterios de aceptación

**CA-10.1** — La interfaz se renderiza correctamente en las resoluciones de escritorio representativas: 1366×768, 1440×900 y 1920×1080, sin elementos ocultos, superpuestos ni inaccesibles.
Verificación: En diseño, los wireframes deben especificar el ancho base del layout. Si una vista fue diseñada solo para 1920px y colapsa en 1366px, el diseño falla el criterio antes de llegar a desarrollo. Se documenta con capturas anotadas en cada resolución objetivo.

**CA-10.2** — Al aplicar zoom del navegador en niveles de 100%, 125% y 150%, todos los elementos interactivos permanecen visibles y operables sin necesidad de desplazamiento horizontal.
Verificación: En diseño, se valida que el layout no dependa de anchos fijos en píxeles absolutos que rompan al escalar. Si en el wireframe un formulario tiene un ancho fijo que ya ocupa el 90% del viewport al 100%, a 150% desbordará.

**CA-10.3** — No se presentan traslapes entre elementos de interfaz en ninguna combinación de resolución y nivel de zoom contemplados.
Verificación: se recorren las vistas principales del módulo en cada combinación de resolución y zoom definida, registrando cualquier traslape con captura de pantalla. En diseño, cada componente debe tener márgenes definidos explícitamente en la guía.

**CA-10.4** — Los mensajes de error, advertencia y confirmación mantienen legibilidad completa y no quedan cortados ni fuera del viewport en ninguna de las condiciones de zoom definidas.
Verificación: Se revisa que los contenedores de mensajes usen unidades relativas o tengan un ancho máximo adaptable.

**CA-10.5** — La vista de calendario mantiene la visibilidad de citas registradas y los controles de navegación de fechas en todas las condiciones de resolución y zoom definidas.
Verificación: El calendario se prueba específicamente en 1366×768 al 150% de zoom. Si en esas condiciones los controles de semana/mes o las celdas de citas quedan inaccesibles, el componente requiere ajuste de diseño.

---

## Escenario de calidad

**Fuente:** Secretaria en uso habitual del sistema.

**Estímulo:** Aumenta el zoom del navegador a 125% mientras registra una cita en el formulario de creación; posteriormente navega al calendario y consulta citas del día.

**Entorno:** Sistema en producción, navegador de escritorio en resolución 1366×768, horario laboral.

**Artefacto:** Módulo de agenda — formulario de creación de cita y vista de calendario.

**Respuesta esperada:** La interfaz conserva su estructura, todos los campos del formulario, botones de acción y controles del calendario permanecen visibles y operables.

**Medida de respuesta:** 0 elementos cortados o superpuestos, 0 acciones principales inaccesibles, tarea completable sin cambiar el nivel de zoom durante su ejecución.

---

## Traducción al diseño

Este RNF se verifica y se cumple principalmente en la fase de diseño. Las decisiones que toma el equipo de diseño determinan si el requisito es alcanzable antes de escribir una sola línea de código.

**Layout y estructura:**
El diseño debe definir un ancho base de trabajo y construir todas las vistas sobre ese ancho. Ningún componente debe asumir un viewport más amplio como condición de funcionamiento.

**Unidades y escalado:**
Los wireframes y prototipos deben especificar que los anchos de contenedores, formularios y columnas usen proporciones relativas al viewport, no valores fijos en píxeles. Esto es lo que permite que el layout se mantenga al aplicar zoom.

**Componentes críticos:**
El calendario es el componente que más riesgo tiene de romperse con zoom por su densidad visual. El diseño debe definir explícitamente cómo se comportan las celdas y los controles de navegación de fechas cuando el espacio disponible se reduce.

**Mensajes y modales:**
Los contenedores de mensajes de error, advertencia y confirmación deben diseñarse con ancho máximo adaptable y posicionamiento que no dependa de coordenadas fijas.

**Guía de estilos:**
La guía debe incluir la especificación de márgenes, paddings y z-index de cada componente principal. Sin esta documentación, la compatibilidad de zoom no puede auditarse ni garantizarse de forma consistente.z

**Entregable de verificación en diseño:**
Un mapa de pantallas anotado donde cada vista principal del módulo (calendario, formulario de creación, vista de consulta, flujo de reprogramación) tenga una nota que indique el ancho mínimo soportado y el comportamiento esperado a 125% y 150% de zoom.

---

## Traducción al sistema

Este RNF no introduce lógica de negocio nueva ni modifica el comportamiento funcional del módulo. Su cumplimiento en implementación depende de las decisiones de construcción del frontend y de que el desarrollo respete fielmente las especificaciones de diseño.

**Estructura del frontend:**
El layout del módulo debe implementarse con un sistema de grillas o contenedores fluidos que no dependan de anchos fijos en píxeles absolutos.

**Componente de calendario:**
Si se utiliza una librería de calendario de terceros, debe validarse desde su selección que el componente mantiene funcionalidad en las resoluciones y niveles de zoom definidos. Un componente que no soporte esto obligaría a reemplazarlo o extenderlo.

**Sin lógica adicional en backend:**
Este RNF no genera endpoints, reglas de negocio ni cambios en la base de datos. Es enteramente responsabilidad del frontend.

**Verificación en implementación:**
Una vez desarrollado, se ejecuta una ronda de pruebas visuales manuales recorriendo las vistas principales del módulo en las tres resoluciones y los tres niveles de zoom definidos. Cualquier traslape, recorte o elemento inaccesible encontrado en esa ronda se registra como defecto de implementación y debe corregirse antes de considerar el RNF cumplido.

---

## Alcance e impacto

**Incluye:**

- Vistas del módulo de agenda: calendario, formulario de creación, vista de consulta y flujo de reprogramación.
- Niveles de zoom: 100%, 125% y 150%.
- Resoluciones de escritorio: 1366×768, 1440×900 y 1920×1080.
- Comportamiento de mensajes y modales en todas las condiciones anteriores.

**Excluye:**

- Dispositivos móviles o tablets.
- Módulos externos al de agenda.

---

## Relación con otros RNF

**RNF-06 — Usabilidad y coherencia visual**
La guía de estilo define las unidades, márgenes y especificaciones de componentes que hacen posible cumplir este RNF. Sin guía de estilos consolidada, la compatibilidad de zoom no puede garantizarse de forma sistemática.

**RNF-08 — Formularios y validaciones claras**
La agrupación lógica de campos definida en RNF-08 debe mantenerse íntegra al escalar, si un bloque de campos se fragmenta o colapsa con zoom, se rompe simultáneamente RNF-08 y RNF-10.

**RNF-09 — Mensajes y retroalimentación al usuario**
Los mensajes deben conservar legibilidad y diferenciación visua bajo todas las condiciones de zoom.