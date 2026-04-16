# RNF-01. Consistencia e integridad transaccional

## Descripción
El sistema deberá garantizar que las operaciones de registro, edición, actualización y almacenamiento de información se ejecuten de forma completa y controlada.

Cuando una operación involucre cambios en los datos, el sistema deberá evitar que se guarden resultados parciales, incompletos o inconsistentes en caso de error durante el proceso.

Asimismo, el sistema deberá manejar adecuadamente los fallos que ocurran durante la edición o persistencia de datos, asegurando que la información permanezca en un estado válido y coherente.

Este requisito busca preservar la integridad de la información y la estabilidad técnica del sistema, incluso ante errores en operaciones críticas de almacenamiento.

El alcance de este requisito se centra en la consistencia de los datos durante operaciones de modificación y guardado dentro del sistema.

---

## Categoría
Confiabilidad e integridad de datos

---

## Objetivo del requisito
Garantizar que las operaciones de modificación y almacenamiento de datos se realicen de forma completa, evitando estados intermedios, registros parciales o inconsistencias en la información del sistema.

---

## Escenario de calidad

**Contexto:**  
Usuario realiza una operación de registro, edición o actualización de información en el sistema web de la clínica  

**Estímulo:**  
Ocurre un error durante el guardado o modificación de los datos  

**Respuesta esperada:**  
- El sistema evita almacenar información parcial o incompleta  
- Los datos permanecen en un estado consistente después del fallo  
- La operación fallida no deja registros corruptos ni relaciones incompletas  
- El sistema informa que ocurrió un error y evita continuar con datos inválidos  

---

## Criterios de aceptación

- Toda operación de guardado o modificación de datos se ejecuta de forma completa o no se aplica  
- El sistema evita registrar información parcial cuando ocurre un fallo durante el proceso  
- No existen estados intermedios persistidos después de una operación fallida  
- Los datos relacionados conservan su coherencia después de errores en edición o almacenamiento  
- El sistema maneja los errores de persistencia sin corromper la información existente  
- Ante un fallo, el sistema notifica que la operación no fue completada correctamente  
- Las operaciones críticas de actualización mantienen consistencia entre los datos involucrados  
- La información almacenada después de cada operación válida coincide con lo que el usuario confirmó  

---

## Verificación

El cumplimiento del requisito se verificará mediante:

- Pruebas de guardado y edición exitosas sobre registros del sistema  
- Simulación de fallos durante operaciones de almacenamiento  
- Validación de que no se generan registros parciales tras errores  
- Revisión de consistencia entre datos relacionados después de operaciones fallidas  
- Pruebas de manejo de errores en procesos de actualización de información  
- Comprobación de mensajes del sistema ante fallos de persistencia  

---

## Consistencia

Este requisito es consistente con los requisitos funcionales de registro, consulta, modificación y cancelación de citas, ya que asegura que la información gestionada por dichos procesos permanezca íntegra y confiable.

También se relaciona con los requisitos no funcionales de disponibilidad, mantenibilidad y privacidad de la información, al contribuir a la estabilidad técnica del sistema y al correcto manejo de los datos.

No presenta contradicciones con otros requisitos del sistema.

---

## Métricas de cumplimiento

- El 100% de las operaciones fallidas no debe dejar registros parciales almacenados  
- El 100% de las operaciones críticas mantiene consistencia entre los datos relacionados  
- El 100% de los errores de persistencia debe impedir que se confirmen cambios incompletos  
- El sistema conserva información válida y coherente después de cada fallo simulado en guardado o edición
