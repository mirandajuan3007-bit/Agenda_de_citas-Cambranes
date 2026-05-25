# Entregable RNF-08: Claridad y organización de formularios

## 1. Propósito del documento

Este documento describe cómo se interpretará, diseñará y verificará el requisito no funcional **RNF-08: Claridad y organización de formularios** para el módulo de agenda de citas.

Su propósito es convertir el issue del backlog en un entregable concreto, revisable y verificable dentro del repositorio. Este archivo no sustituye al issue del backlog.

El issue define **qué se espera**; este documento define **cómo debe reflejarse en el diseño de formularios, qué elementos mínimos debe incluir la solución y cómo se verificará su cumplimiento**.

---

## 2. Relación con el backlog

**Issue asociado:** RNF-08. Claridad y organización de formularios

**Objetivo del RNF:** Garantizar que los formularios del módulo de citas presenten la información de forma ordenada, lógica y fácil de completar, ayudando al usuario a capturar datos correctamente desde el primer intento.

**Categoría del RNF:** Usabilidad

Este RNF pertenece a la categoría de **Usabilidad**, ya que su finalidad es mejorar la comprensión, captura y corrección de información dentro de los formularios del sistema, sin mezclar directamente otros atributos de calidad ajenos a la interacción con formularios.

### Requisitos relacionados del backlog

#### Requisitos funcionales relacionados

- **RF-03. Validar disponibilidad de recursos**
- **RF-04. Generación automática de ID de paciente**
- **RF-06. Consultar detalles de una cita**
- **RF-08. Reprogramar una cita**
- **RF-09. Cancelar citas con anticipación y actualizar la agenda**

#### Requisitos no funcionales relacionados

- **RNF-06. Usabilidad y diseño coherente**
- **RNF-01. Consistencia e integridad transaccional**
- **RNF-02. Control de acceso básico y privacidad en UI**
- **RNF-05. Minimización de exposición de datos**

Este RNF complementa especialmente a **RNF-06**, ya que aterriza la usabilidad al caso específico de los formularios del módulo de citas.

---

## 3. Alcance del entregable

Para considerar atendido este RNF, el equipo deberá producir, documentar o reflejar en el diseño del sistema los siguientes elementos:

- Organización de campos en bloques o secciones lógicas.
- Etiquetas claras, directas y comprensibles para usuarios no técnicos.
- Orden natural de captura de información dentro del formulario.
- Eliminación de campos innecesarios para completar la tarea.
- Validaciones y mensajes de error fáciles de entender.
- Evidencia de revisión del formulario con base en criterios de usabilidad.
- Relación del formulario con el flujo general del módulo de citas.

---

## 4. Representación del RNF en el proyecto

A diferencia de un requisito funcional, este RNF no se representa únicamente mediante una acción específica del sistema, sino a través del diseño, estructura y comportamiento esperado de los formularios utilizados en el módulo de citas.

Su cumplimiento se demuestra mediante decisiones de interfaz, organización de información, mensajes de validación y evidencia de revisión o prueba del formulario.

### 4.1 Artefactos mínimos esperados

- Diseño o evidencia del formulario de captura y edición de citas.
- Definición de secciones o bloques lógicos dentro del formulario.
- Evidencia de etiquetas comprensibles y directas.
- Evidencia de mensajes de validación y error claros.
- Checklist de verificación del RNF.
- Observaciones o resultados de revisión funcional o de usabilidad.

---

## 5. Diseño esperado de la solución

### 5.1 Organización lógica de campos

El formulario deberá agrupar los campos relacionados en bloques o secciones lógicas, de modo que el usuario pueda identificar fácilmente qué información pertenece a cada parte del proceso de captura.

Como mínimo, la información deberá presentarse de forma agrupada en categorías similares a las siguientes, cuando aplique:

- datos del paciente;
- datos de la cita;
- recursos asignados;
- observaciones o comentarios.

No deberán presentarse campos sin relación aparente dentro del mismo bloque.

### 5.2 Etiquetas claras y directas

Todas las etiquetas de los campos deberán estar redactadas en un lenguaje comprensible para personal administrativo no técnico.

Las etiquetas deberán:

- describir claramente el dato solicitado;
- evitar abreviaturas ambiguas;
- evitar términos técnicos innecesarios;
- mantener consistencia con el resto de la interfaz del sistema.

### 5.3 Orden natural de captura

El formulario deberá seguir un orden lógico de captura que facilite completar la información sin retrocesos innecesarios.

Como criterio general, la secuencia de captura deberá avanzar desde la identificación del paciente o cita, hacia la programación de fecha y hora, la asignación de recursos y los datos complementarios.

### 5.4 Eliminación de campos innecesarios

El formulario no deberá solicitar información irrelevante para completar la tarea correspondiente.

Cada campo incluido deberá tener relación directa con el registro, consulta o edición de una cita dentro del módulo.

No deberán incluirse campos redundantes, repetidos o que no aporten valor al flujo de trabajo del usuario.

### 5.5 Validaciones y ayudas comprensibles

Cuando ocurra un error de captura o falte información obligatoria, el formulario deberá mostrar mensajes claros que indiquen:

- qué campo requiere corrección;
- cuál es el problema detectado;
- qué acción debe realizar el usuario para corregirlo.

Los mensajes de error no deberán depender únicamente del color para ser comprendidos y no deberán usar redacción técnica innecesaria.

---

## 6. Reglas que debe cumplir la solución

### 6.1 Claridad del formulario

- Los campos deben estar organizados en bloques o secciones lógicas.
- Las etiquetas deben ser comprensibles para un usuario no técnico.
- El orden visual del formulario debe coincidir con el orden esperado de captura.

### 6.2 Pertinencia de la información

- El formulario no debe solicitar datos irrelevantes para completar la tarea.
- No deben existir campos redundantes o duplicados.
- La información mostrada debe estar alineada con el flujo real del módulo de citas.

### 6.3 Corrección de errores

- Los errores deben indicar con claridad qué campo debe corregirse.
- Los mensajes deben orientar la corrección sin generar confusión.
- Las validaciones deben ayudar al usuario a completar correctamente el formulario desde el primer intento o, en su defecto, a corregirlo fácilmente.

### 6.4 Compatibilidad con el módulo

- La organización del formulario debe ser compatible con el flujo de crear, consultar y reprogramar citas.
- El diseño del formulario debe ser coherente con la interfaz general del sistema.
- La solución no debe contradecir otros RNF relacionados con privacidad, consistencia visual o protección de datos.

---

## 7. Escenario de calidad del RNF

### Contexto

Una secretaria utiliza el módulo de citas para registrar una nueva cita en el sistema mediante un formulario.

### Estímulo

Captura los datos del paciente, la fecha, la hora y los demás campos requeridos para completar el registro.

### Respuesta esperada

La usuaria comprende qué datos ingresar, en qué orden hacerlo y cómo corregir errores sin confusión, gracias a la organización lógica de los campos, etiquetas claras, validaciones comprensibles y ausencia de información innecesaria.

---

## 8. Evidencia que debe adjuntarse

Para considerar este RNF como atendido, se recomienda adjuntar evidencia como la siguiente:

- Capturas del formulario de registro o edición de citas.
- Evidencia de agrupación visual o estructural de campos por bloques.
- Evidencia de etiquetas utilizadas en los campos.
- Evidencia de mensajes de validación o error.
- Observaciones de revisión funcional del formulario.
- Evidencia de prueba de usabilidad básica o revisión del flujo de captura.

---

## 9. Criterios de verificación del entregable

### 9.1 Verificación de organización

- [ ] Los campos están organizados en bloques o secciones lógicas.
- [ ] Cada bloque agrupa información relacionada.
- [ ] El formulario presenta la información en un orden natural de captura.

### 9.2 Verificación de claridad

- [ ] Las etiquetas son comprensibles para usuarios no técnicos.
- [ ] No se utilizan abreviaturas ambiguas o términos innecesariamente técnicos.
- [ ] El formulario puede leerse sin confusión sobre qué dato se espera en cada campo.

### 9.3 Verificación de pertinencia

- [ ] El formulario no solicita información irrelevante para completar la tarea.
- [ ] No existen campos repetidos o innecesarios.
- [ ] La información solicitada está alineada con el objetivo del flujo.

### 9.4 Verificación de validaciones

- [ ] Los errores indican con claridad qué campo debe corregirse.
- [ ] Los mensajes explican de forma comprensible el problema detectado.
- [ ] Las validaciones ayudan a completar la tarea sin generar confusión.

### 9.5 Verificación de usabilidad

- [ ] Una revisión del formulario permite identificar que la captura puede realizarse de forma ordenada y comprensible.
- [ ] El formulario es compatible con pruebas funcionales y pruebas básicas de usabilidad.
- [ ] La organización general favorece la captura correcta desde el primer intento.

### 9.6 Verificación de consistencia

- [ ] El RNF es compatible con el flujo general del módulo de citas.
- [ ] El RNF es consistente con la interfaz y diseño visual esperados.
- [ ] El RNF no contradice otros requisitos funcionales o no funcionales del backlog.

---

## 10. Resultado esperado al cerrar el issue

El issue **RNF-08. Claridad y organización de formularios** podrá considerarse atendido cuando el repositorio contenga evidencia suficiente de que:

1. Los formularios del módulo de citas están estructurados en bloques lógicos.
2. Las etiquetas de los campos son claras y comprensibles.
3. El orden de captura sigue una secuencia natural para el usuario.
4. No se solicita información irrelevante para completar la tarea.
5. Los errores y validaciones orientan claramente la corrección.
6. La solución es consistente con el flujo general del módulo y con los demás requisitos del proyecto.

---

## 11. Observación final

Este documento funciona como **entregable base** del RNF.

Su objetivo es dejar claro **qué debe existir en el proyecto para demostrar que este requisito fue trabajado**, cómo se verificará su cumplimiento y qué evidencias permitirán validarlo en etapas posteriores
