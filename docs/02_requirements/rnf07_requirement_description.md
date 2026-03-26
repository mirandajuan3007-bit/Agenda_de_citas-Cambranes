# Entregable RNF-07: Usabilidad y diseño coherente

## 1. Propósito del documento
Este documento describe cómo se interpretará, diseñará y verificará el requisito no funcional **Usabilidad y diseño coherente** para el módulo de citas. Su propósito es convertir el issue del backlog en un entregable concreto y revisable dentro del repositorio.

Este archivo no sustituye al issue del backlog. El issue define **qué se espera**; este documento define **cómo se representará, qué elementos deberá incluir la solución y cómo se verificará su cumplimiento**.

---

## 2. Relación con el backlog
**Issue asociado:** RNF – Usabilidad y diseño coherente

**Objetivo del RNF:**
Garantizar que el módulo de citas ofrezca una experiencia de uso clara, consistente y comprensible para el personal de secretaría o coordinación, permitiendo crear, consultar y reprogramar citas sin confusión ni dependencia del equipo de desarrollo.

---

## 3. Alcance del entregable
Para considerar atendido este RNF, el equipo deberá producir o mejorar los siguientes elementos del módulo de citas:

- Flujo para **crear citas**.
- Flujo para **consultar/ver citas**.
- Flujo para **reprogramar citas**.
- Formularios relacionados con el registro y edición de citas.
- Botones, mensajes, campos y estilos compartidos entre pantallas.
- Reglas visuales mínimas documentadas en una guía de estilo.
- Evidencia de verificación del comportamiento en escritorio.

---

## 4. Representación del RNF en el proyecto
A diferencia de un requisito funcional, este RNF no se representa únicamente con un UML o una historia de flujo. Su cumplimiento se demuestra con una combinación de los siguientes artefactos:

### 4.1 Artefactos mínimos esperados
- Mockups, wireframes o capturas de las vistas principales del módulo.
- Descripción textual del flujo de crear, consultar y reprogramar citas.
- Reglas de diseño visual aplicables al módulo.
- Checklist de verificación del RNF.
- Evidencia de revisión en escritorio.

## 5. Diseño esperado del módulo de citas

### 5.1 Flujo general esperado
El módulo de citas debe permitir que una secretaria o coordinador pueda realizar tareas principales sin capacitación técnica especializada.

El flujo esperado contempla tres procesos principales:

#### Crear cita
1. Acceder al módulo de citas.
2. Seleccionar la opción **Crear cita**.
3. Completar el formulario con campos organizados en orden lógico.
4. Confirmar la información.
5. Visualizar mensaje de éxito o corrección de errores.

#### Consultar cita
1. Acceder al listado o buscador de citas.
2. Identificar la cita deseada.
3. Visualizar sus datos principales de forma clara.
4. Acceder a acciones disponibles, como editar o reprogramar.

#### Reprogramar cita
1. Ubicar la cita existente.
2. Seleccionar la acción **Reprogramar**.
3. Modificar fecha, hora u otros datos permitidos.
4. Confirmar el cambio.
5. Visualizar mensaje de confirmación.

---

## 6. Reglas de usabilidad que debe cumplir la solución

### 6.1 Claridad del flujo
- Las acciones principales deben estar visibles.
- El usuario debe saber en qué parte del proceso se encuentra.
- No deben existir pasos redundantes para completar tareas frecuentes.
- Las rutas para crear, consultar y reprogramar deben ser fáciles de entender.

### 6.2 Organización de formularios
- Los campos deben agruparse por bloques relacionados.
- El orden de captura debe seguir una secuencia natural.
- Las etiquetas deben ser claras y directas.
- Solo deben mostrarse campos necesarios para la tarea.

### 6.3 Consistencia visual
- Los botones equivalentes deben compartir estilo.
- Los mensajes del sistema deben conservar un patrón visual uniforme.
- Inputs, títulos, espaciados y tipografías deben verse consistentes entre vistas.
- No deben existir cambios de estilo sin justificación funcional.

### 6.4 Mensajes y validaciones
- Los errores deben indicar qué ocurrió y cómo corregirlo.
- Las confirmaciones deben ser claras.
- Debe evitarse lenguaje técnico innecesario.
- Los mensajes deben ser comprensibles para personal administrativo.

### 6.5 Uso en escritorio
- La interfaz debe verse correctamente en resolución de escritorio.
- El contenido no debe romperse al aplicar zoom.
- Botones, formularios y mensajes deben permanecer visibles y utilizables.

---

## 7. Guía de estilo mínima requerida
Como parte del cumplimiento de este RNF, deberá existir una guía de estilo mínima del módulo de citas con al menos los siguientes elementos:

- Colores principales y secundarios.
- Tipografías y jerarquía de textos.
- Espaciados entre secciones y componentes.
- Estilo de botones principales, secundarios y de peligro.
- Estilo de inputs, selects y áreas de validación.
- Estilo de mensajes de error, advertencia, información y éxito.

---

## 8. Escenario de calidad del RNF

### Contexto
Una persona de secretaría utiliza el módulo de citas desde una computadora de escritorio.

### Estímulo
Necesita crear, consultar o reprogramar una cita por primera vez, sin apoyo del desarrollador.

### Respuesta esperada
La persona logra completar la tarea con una interfaz clara, navegación entendible, formularios organizados, mensajes comprensibles y consistencia visual entre pantallas.

---

## 9. Evidencia que debe adjuntarse
Para considerar este RNF como atendido, se recomienda adjuntar evidencia como la siguiente:

- Captura del flujo de crear cita.
- Captura del flujo de consultar cita.
- Captura del flujo de reprogramar cita.
- Captura de formularios con campos organizados.
- Captura de mensajes de validación o confirmación.
- Captura o enlace a la guía de estilo.
- Observaciones de prueba en escritorio y con zoom.

---

## 10. Criterios de verificación del entregable

### 10.1 Verificación funcional de experiencia de uso
- [ ] Existe un flujo identificable para crear citas.
- [ ] Existe un flujo identificable para consultar citas.
- [ ] Existe un flujo identificable para reprogramar citas.
- [ ] Un usuario nuevo puede entender las acciones principales sin ayuda técnica.

### 10.2 Verificación visual
- [ ] Los botones equivalentes tienen el mismo estilo.
- [ ] Los formularios mantienen estructura y espaciado uniforme.
- [ ] Los mensajes del sistema siguen un patrón visual consistente.

### 10.3 Verificación de formularios
- [ ] Los campos están agrupados lógicamente.
- [ ] Las etiquetas son claras.
- [ ] No existen campos innecesarios.
- [ ] Los errores explican cómo corregir el problema.

### 10.4 Verificación de escritorio
- [ ] La interfaz es usable en escritorio.
- [ ] La interfaz conserva legibilidad con zoom.
- [ ] No existen traslapes o recortes que impidan usar el módulo.

### 10.5 Verificación documental
- [ ] Existe una guía de estilo mínima en el repositorio.
- [ ] Existe evidencia de revisión del RNF.
- [ ] El contenido entregado es consistente con el issue del backlog.

---

## 11. Resultado esperado al cerrar el issue
El issue **Usabilidad y diseño coherente** podrá considerarse atendido cuando el repositorio contenga evidencia suficiente de que:

1. El módulo de citas presenta flujos claros para crear, consultar y reprogramar.
2. Los formularios son comprensibles y están organizados.
3. La interfaz mantiene consistencia visual.
4. La solución funciona adecuadamente en escritorio.
5. Existe una guía de estilo mínima que documenta la uniformidad del módulo.

---

## 12. Observación final
Este documento funciona como **entregable base** del RNF. A partir de él, el equipo puede agregar implementación, mockups, capturas, componentes o mejoras visuales. Su objetivo es dejar claro **qué debe existir en el proyecto para demostrar que el RNF fue trabajado**, aunque no se represente con un único diagrama UML como sucede en muchos requisitos funcionales.
