# Entregable RNF-04: Observabilidad, logging y recuperación del sistema

## 1. Propósito del documento

Este documento describe cómo se interpretará, diseñará y verificará el requisito no funcional **Observabilidad, logging y recuperación del sistema** para el módulo de agenda de citas.

Su propósito es convertir el issue del backlog en un entregable concreto, revisable y verificable dentro del repositorio. Este archivo no sustituye al issue del backlog.

El issue define **qué se espera**; este documento define **cómo se representará, qué elementos deberá incluir la solución y cómo se verificará su cumplimiento**.

---

## 2. Relación con el backlog

**Issue asociado:** RNF – Observabilidad, logging y recuperación del sistema

**Objetivo del RNF:** Garantizar que el sistema pueda monitorear su funcionamiento, registrar eventos relevantes, detectar fallos, diagnosticar errores y recuperar la información de la base de datos ante incidentes técnicos o errores humanos.

**Categoría del RNF:** Confiabilidad

Este RNF se clasifica dentro de la categoría de **confiabilidad**, ya que su objetivo principal es asegurar que el sistema pueda mantenerse operativo, detectar fallos y recuperarse adecuadamente ante errores o incidentes.

---

## 3. Alcance del entregable

Para considerar atendido este RNF, el equipo deberá producir, documentar o implementar los siguientes elementos del sistema:

- Registro estructurado de eventos relevantes en formato JSON.
- Endpoint de salud `/health` para verificar el estado de la aplicación y la conexión con la base de datos.
- Métricas básicas de funcionamiento del sistema.
- Mecanismo de respaldo automático de la base de datos.
- Manejo centralizado de errores.
- Evidencia de verificación de cada uno de los elementos anteriores.

---

## 4. Representación del RNF en el proyecto

A diferencia de un requisito funcional, este RNF no se representa únicamente con un flujo de usuario o un diagrama UML. Su cumplimiento se demuestra mediante una combinación de mecanismos técnicos, configuración del sistema, documentación y evidencia de validación.

### 4.1 Artefactos mínimos esperados

- Configuración o evidencia de logs estructurados en formato JSON.
- Definición o implementación del endpoint `/health`.
- Evidencia de métricas básicas de funcionamiento.
- Evidencia del mecanismo de respaldo de base de datos.
- Evidencia del manejo centralizado de errores.
- Checklist de verificación del RNF.
- Evidencia de pruebas o validaciones técnicas.

---

## 5. Diseño esperado de la solución

### 5.1 Registro estructurado de eventos

El sistema deberá generar logs en formato **JSON** para eventos relevantes de operación.

Cada registro deberá incluir como mínimo:

- fecha y hora del evento;
- nivel del evento;
- módulo, componente o servicio que lo genera;
- tipo de evento;
- mensaje descriptivo.

El **100% de los errores internos del servidor detectados por la aplicación** deberá quedar registrado en logs.

### 5.2 Endpoint de salud del sistema

El sistema deberá exponer un endpoint **`/health`** que permita verificar:

- si la aplicación está activa;
- si la conexión con la base de datos está disponible.

El endpoint deberá responder:

- con **HTTP 200** cuando la aplicación y la base de datos estén funcionando correctamente;
- con **HTTP 503** cuando alguno de esos componentes no esté disponible.

El tiempo máximo de respuesta del endpoint deberá ser de **2 segundos** en condiciones normales de operación.

### 5.3 Métricas básicas de funcionamiento

El sistema deberá recopilar al menos las siguientes métricas:

- número total de solicitudes recibidas;
- número de solicitudes exitosas;
- número de errores de servidor;
- tiempo promedio de respuesta;
- estado de conexión con la base de datos.

Estas métricas deberán actualizarse automáticamente durante la ejecución normal del sistema.

### 5.4 Respaldo automático de la base de datos

El sistema deberá realizar un respaldo automático completo de la base de datos al menos **una vez cada 24 horas**.

Cada respaldo deberá:

- almacenarse con fecha y hora de generación;
- conservarse junto con al menos los **últimos 7 respaldos** previos;
- poder utilizarse para restaurar la base de datos en caso de pérdida o corrupción de información.

La restauración de la base de datos a partir del respaldo más reciente válido deberá poder realizarse en un tiempo máximo de **30 minutos** en el entorno del proyecto.

### 5.5 Manejo centralizado de errores

El sistema deberá manejar de forma centralizada las excepciones y errores internos.

El **100% de las excepciones no controladas** deberá:

- pasar por el mecanismo centralizado de manejo de errores;
- registrarse en logs;
- producir una respuesta controlada para el cliente;
- evitar la exposición de detalles internos del sistema al usuario final.

---

## 6. Reglas que debe cumplir la solución

### 6.1 Claridad y medición del RNF

- El RNF no debe depender de términos vagos sin medida.
- Los tiempos, cantidades o porcentajes definidos deben poder comprobarse posteriormente.
- Los mecanismos descritos deben tener una salida verificable.

### 6.2 Monitoreo técnico

- El sistema debe permitir identificar si está funcionando correctamente.
- Debe ser posible detectar fallos de aplicación o de conexión a base de datos.
- Debe existir evidencia técnica del estado del sistema.

### 6.3 Diagnóstico de incidentes

- Los errores deben quedar registrados.
- Debe ser posible rastrear eventos importantes del sistema.
- Los registros deben facilitar análisis posterior.

### 6.4 Recuperación de información

- Debe existir un respaldo automático periódico.
- Debe poder recuperarse información ante pérdida o corrupción de datos.
- La recuperación debe realizarse dentro del tiempo establecido.

### 6.5 Protección de información sensible

- Los logs no deben exponer datos sensibles innecesarios en texto visible para usuarios finales.
- Las respuestas de error no deben mostrar trazas internas, consultas SQL ni detalles técnicos sensibles.
- Los respaldos deben manejarse como información protegida del sistema.

---

## 7. Escenario de calidad del RNF

### Contexto

El sistema de agenda de citas se encuentra en operación y es utilizado por personal administrativo para registrar, consultar, reprogramar y gestionar citas.

### Estímulo

Ocurre una falla de aplicación, un error no controlado, una desconexión con la base de datos o una pérdida de información.

### Respuesta esperada

El sistema registra el incidente en logs estructurados, refleja el problema mediante el endpoint `/health`, actualiza las métricas de funcionamiento, maneja el error de forma centralizada y permite recuperar la información mediante un respaldo válido dentro del tiempo definido.

---

## 8. Evidencia que debe adjuntarse

Para considerar este RNF como atendido, se recomienda adjuntar evidencia como la siguiente:

- Captura o ejemplo de logs en formato JSON.
- Captura o evidencia de respuesta del endpoint `/health` en estado correcto.
- Captura o evidencia de respuesta del endpoint `/health` ante falla de base de datos.
- Evidencia de métricas básicas de funcionamiento.
- Evidencia de ejecución de respaldos automáticos.
- Evidencia de restauración en ambiente de prueba.
- Evidencia de respuestas controladas ante errores.
- Observaciones técnicas de validación del RNF.

---

## 9. Criterios de verificación del entregable

### 9.1 Verificación de logs

- [ ] Los eventos relevantes del sistema se registran en formato JSON.
- [ ] Cada log contiene fecha, nivel, componente, tipo de evento y mensaje.
- [ ] Los errores internos del servidor quedan registrados.

### 9.2 Verificación del endpoint de salud

- [ ] Existe un endpoint `/health`.
- [ ] El endpoint responde con HTTP 200 cuando la aplicación y la base de datos están disponibles.
- [ ] El endpoint responde con HTTP 503 cuando alguno de los componentes no está disponible.
- [ ] El tiempo de respuesta es menor o igual a 2 segundos en condiciones normales.

### 9.3 Verificación de métricas

- [ ] Se recopila el total de solicitudes recibidas.
- [ ] Se recopila el total de solicitudes exitosas.
- [ ] Se recopila el total de errores de servidor.
- [ ] Se registra el tiempo promedio de respuesta.
- [ ] Se refleja el estado de conexión con la base de datos.

### 9.4 Verificación de respaldo y recuperación

- [ ] Se ejecuta al menos un respaldo automático cada 24 horas.
- [ ] Se conservan al menos los últimos 7 respaldos.
- [ ] Los respaldos tienen fecha y hora de generación.
- [ ] Se puede restaurar la base de datos a partir de un respaldo válido.
- [ ] La restauración puede completarse en un máximo de 30 minutos en el entorno del proyecto.

### 9.5 Verificación del manejo de errores

- [ ] Las excepciones no controladas son interceptadas por un mecanismo centralizado.
- [ ] Los errores quedan registrados en logs.
- [ ] El usuario recibe una respuesta controlada.
- [ ] No se exponen detalles internos del sistema al usuario final.

### 9.6 Verificación de consistencia

- [ ] El RNF no contradice otros requisitos del sistema.
- [ ] El RNF es consistente con la privacidad y minimización de exposición de datos.
- [ ] El contenido entregado es consistente con el issue del backlog.

---

## 10. Resultado esperado al cerrar el issue

El issue **Observabilidad, logging y recuperación del sistema** podrá considerarse atendido cuando el repositorio contenga evidencia suficiente de que:

1. El sistema registra eventos relevantes en formato JSON.
2. El sistema puede reportar su estado mediante el endpoint `/health`.
3. El sistema recopila métricas básicas de funcionamiento.
4. El sistema genera respaldos automáticos de la base de datos.
5. El sistema puede restaurar la información a partir de un respaldo válido.
6. El sistema maneja los errores de forma centralizada.
7. La solución es verificable y consistente con los demás requisitos del proyecto.

---

## 11. Observación final

Este documento funciona como **entregable base** del RNF.

Su objetivo es dejar claro **qué debe existir en el proyecto para demostrar que el RNF fue trabajado**, cómo se medirá su cumplimiento y qué evidencia permitirá validarlo en etapas posteriores.