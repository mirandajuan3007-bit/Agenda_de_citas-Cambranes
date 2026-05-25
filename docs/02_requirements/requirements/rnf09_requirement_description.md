# Entregable RNF-09: Mensajes y retroalimentacion al usuario

## 1. Proposito del documento

Este documento describe como se interpretara, diseniara y verificara el requisito no funcional **Mensajes y retroalimentacion al usuario** para el modulo de agenda de citas.

Su proposito es convertir el issue del backlog en un entregable concreto, revisable y verificable dentro del repositorio. Este archivo no sustituye al issue del backlog.

El issue define **que se espera**; este documento define **como se representara, que elementos debera incluir la solucion y como se verificara su cumplimiento**.

---

## 2. Relacion con el backlog

**Issue asociado:** RNF - 09. Mensajes y retroalimentacion al usuario

**Objetivo del RNF:**
Garantizar que los mensajes del sistema y las validaciones mostradas al usuario sean claras, breves y comprensibles, facilitando la correccion de errores y la comprension del estado de cada accion.

El sistema debe comunicar errores, advertencias, confirmaciones e indicaciones de ayuda usando lenguaje directo, sin tecnicismos innecesarios ni mensajes ambiguos.

**Categoria del RNF:** Usabilidad

Este RNF se clasifica dentro de la categoria de **usabilidad**, ya que su objetivo principal es mejorar la comprension del sistema por parte del personal administrativo y reducir errores de operacion causados por mensajes poco claros o inconsistentes.

Este requisito no mezcla multiples categorias de calidad en un solo enunciado, ya que se concentra en la claridad del lenguaje, la utilidad de la retroalimentacion y la diferenciacion visual de los mensajes mostrados al usuario.

---

## 3. Alcance del entregable

Para considerar atendido este RNF, el equipo debera producir, documentar o mejorar los siguientes elementos del modulo de agenda:

- mensajes de error en formularios de creacion, consulta, reprogramacion y cancelacion de citas
- mensajes de advertencia ante acciones incompletas o datos faltantes
- mensajes de confirmacion para acciones exitosas
- indicaciones de correccion cuando un dato sea invalido o insuficiente
- reglas visuales para diferenciar error, advertencia, informacion y exito
- evidencia de verificacion de claridad y consistencia de los mensajes

---

## 4. Representacion del RNF en el proyecto

A diferencia de un requisito funcional, este RNF no se representa unicamente con un flujo de usuario o con un diagrama UML. Su cumplimiento se demuestra mediante una combinacion de mensajes documentados, reglas de interfaz, evidencia visual y criterios de verificacion.

### 4.1 Artefactos minimos esperados

- ejemplos documentados de mensajes de error, advertencia, informacion y exito
- capturas, mockups o referencias visuales donde dichos mensajes aparezcan en contexto
- reglas visuales minimas para diferenciar tipos de retroalimentacion
- checklist de verificacion del RNF
- evidencia de revision de claridad y consistencia del lenguaje

---

## 5. Disenio esperado de la solucion

### 5.1 Principio general del requisito

El modulo de agenda debe comunicar al usuario lo que esta ocurriendo en cada accion relevante del sistema, permitiendole entender si una operacion fallo, quedo incompleta, requiere atencion o se ejecuto correctamente.

Los mensajes deben estar orientados a personal administrativo no tecnico, por lo que deben evitar codigos internos, mensajes ambiguos o explicaciones propias del sistema de desarrollo.

### 5.2 Mensajes de error

Cuando una accion no pueda completarse, el sistema debera mostrar mensajes de error comprensibles.

Los mensajes de error deberan:

- indicar que ocurrio el problema
- senialar que dato o accion lo ocasiono
- explicar como corregirlo cuando sea posible
- evitar tecnicismos innecesarios

Ejemplos esperados:

- "La fecha seleccionada no esta disponible. Elija otro horario."
- "Debe seleccionar un terapeuta antes de guardar la cita."
- "No fue posible guardar la cita. Verifique los campos obligatorios."

### 5.3 Mensajes de advertencia

Cuando una accion aun pueda corregirse antes de fallar completamente, el sistema debera mostrar advertencias claras.

Las advertencias deberan:

- alertar al usuario sin bloquear innecesariamente el flujo
- indicar que informacion falta o que situacion requiere revision
- distinguirse visualmente de errores y confirmaciones

Ejemplos esperados:

- "Aun no ha seleccionado una sala."
- "La cita esta proxima a iniciar; verifique los datos antes de continuar."

### 5.4 Mensajes de confirmacion

Cuando una accion se complete correctamente, el sistema debera informar el resultado de forma breve y clara.

Las confirmaciones deberan:

- indicar que la accion se completo
- evitar mensajes excesivamente largos
- mantener un lenguaje directo y consistente

Ejemplos esperados:

- "La cita fue registrada correctamente."
- "La cita se reprogramo con exito."
- "La cancelacion se realizo correctamente."

### 5.5 Indicaciones de correccion

Cuando el usuario introduzca informacion invalida o incompleta, el sistema debera orientar la correccion de forma especifica.

Las indicaciones deberan:

- aparecer cerca del campo o zona relacionada cuando aplique
- explicar que debe corregirse
- reducir la necesidad de prueba y error por parte del usuario

Ejemplos esperados:

- "Ingrese una hora dentro del horario laboral."
- "Complete el nombre del paciente para continuar."
- "Seleccione una fecha valida antes de confirmar la cita."

### 5.6 Diferenciacion visual

El sistema debera diferenciar visualmente, de manera consistente, al menos los siguientes tipos de mensajes:

- error
- advertencia
- informacion
- exito

La diferenciacion podra apoyarse en color, iconografia, estilo de contenedor o jerarquia visual, siempre que se mantenga comprensible y consistente entre pantallas.

---

## 6. Reglas que debe cumplir la solucion

### 6.1 Claridad del lenguaje

- Los mensajes deben ser breves y comprensibles.
- Deben evitar abreviaturas tecnicas, codigos internos o vocabulario de desarrollo.
- Deben estar orientados a personal administrativo no tecnico.

### 6.2 Utilidad de la retroalimentacion

- Cada mensaje debe ayudar al usuario a entender el estado de la accion.
- En caso de error o advertencia, debe indicar como corregir o revisar la situacion.
- El sistema no debe mostrar mensajes genericos que no ayuden a tomar una accion.

### 6.3 Consistencia visual

- Los mensajes equivalentes deben compartir estilo visual.
- Los errores no deben verse igual que los mensajes de exito.
- La diferenciacion visual debe mantenerse entre vistas y formularios.

### 6.4 Consistencia semantica

- Un mismo tipo de situacion debe expresarse con lenguaje similar en todas las pantallas.
- No deben existir mensajes contradictorios para el mismo evento.
- Las respuestas del sistema deben ser coherentes con los requisitos funcionales relacionados.
- Los mensajes no deben prometer acciones o resultados que el sistema no haya ejecutado realmente.

---

## 7. Escenario de calidad del RNF

### Contexto

La secretaria o el coordinador utiliza el modulo de agenda para crear, consultar, reprogramar o cancelar citas dentro de una computadora de escritorio.

### Estimulo

El usuario interactua con formularios, botones, validaciones o acciones del sistema y ocurre un error, una advertencia, una confirmacion o una respuesta informativa.

### Respuesta esperada

El sistema presenta un mensaje claro, breve y comprensible, diferenciado visualmente segun su tipo, permitiendo que el usuario entienda el resultado de la accion y sepa como continuar o corregir el problema.

---

## 8. Evidencia que debe adjuntarse

Para considerar este RNF como atendido, se recomienda adjuntar evidencia como la siguiente:

- capturas de mensajes de error en formularios
- capturas de mensajes de advertencia
- capturas de mensajes de confirmacion de acciones exitosas
- capturas o mockups con mensajes de ayuda o correccion
- referencia visual donde se distinga error, advertencia, informacion y exito
- checklist de revision de claridad del lenguaje

---

## 9. Criterios de verificacion del entregable

### 9.1 Verificacion del lenguaje

- [ ] Los mensajes usan lenguaje claro y directo.
- [ ] Los mensajes no contienen tecnicismos innecesarios.
- [ ] Los mensajes pueden entenderse por personal administrativo no tecnico.

### 9.2 Verificacion de errores y advertencias

- [ ] Los errores indican que ocurrio y como corregirlo cuando sea posible.
- [ ] Las advertencias alertan al usuario sin ambiguedad.
- [ ] Existen mensajes especificos para datos faltantes o invalidos.

### 9.3 Verificacion de confirmaciones

- [ ] Las acciones exitosas generan mensajes de confirmacion claros.
- [ ] Las confirmaciones usan lenguaje breve y consistente.
- [ ] El usuario puede identificar facilmente cuando una accion se completo correctamente.

### 9.4 Verificacion visual

- [ ] Los mensajes de error, advertencia, informacion y exito son distinguibles entre si.
- [ ] Los mensajes equivalentes mantienen un patron visual consistente.
- [ ] No existen pantallas con estilos contradictorios para el mismo tipo de mensaje.

### 9.5 Verificacion de consistencia

- [ ] El RNF es compatible con los requisitos funcionales del modulo de agenda.
- [ ] El RNF es consistente con la guia de estilo y con otros RNF de usabilidad.
- [ ] El contenido entregado es consistente con el issue del backlog.

---

## 10. Resultado esperado al cerrar el issue

El issue **Mensajes y retroalimentacion al usuario** podra considerarse atendido cuando el repositorio contenga evidencia suficiente de que:

1. El sistema comunica errores, advertencias, confirmaciones e informacion con lenguaje claro.
2. Los mensajes ayudan al usuario a entender el estado de cada accion.
3. La retroalimentacion visual es consistente entre vistas.
4. Los usuarios administrativos pueden reaccionar correctamente ante errores o eventos del sistema.
5. El requisito puede verificarse mediante capturas, checklist y revision visual.

---

## 11. Observacion final

Este documento funciona como **entregable base** del RNF.

Su objetivo es dejar claro **que debe existir en el proyecto para demostrar que el RNF fue trabajado**, como se medira su cumplimiento y que evidencia permitira validarlo en etapas posteriores.
