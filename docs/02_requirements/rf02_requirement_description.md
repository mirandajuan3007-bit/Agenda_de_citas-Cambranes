# RF‑02. Mostrar Resumen Final de la Cita Antes de Confirmar

## Descripción del Requisito

### Descripción

El sistema debe mostrar al usuario un resumen final de la cita una vez que se hayan capturado todos los datos necesarios y antes de confirmar o guardar definitivamente la cita.

Este resumen permite al personal administrativo verificar la información ingresada y, en caso necesario, regresar al formulario para realizar correcciones antes de completar la confirmación. La cita no debe almacenarse de forma definitiva hasta que el usuario confirme explícitamente la información mostrada.

### Acciones del Sistema

- Recopilar los datos ingresados en el formulario de registro de cita.
- Mostrar una pantalla de resumen con la información completa de la cita.
- Permitir al usuario confirmar la cita o regresar al formulario para editar los datos.
- Al confirmar la cita:
  - Generar el identificador único de la cita.
  - Guardar la cita con un estado preliminar.

### Acciones del Usuario

- Revisar la información mostrada en el resumen.
- Confirmar la cita o regresar para corregir los datos.

### Información Mínima Mostrada

- Paciente asociado  
- Fecha de la cita  
- Hora de la cita  
- Servicio o tipo de consulta  
- Profesional de salud asignado  
- Observaciones relevantes  
- Estado preliminar de la cita  

---

## Relación con Otros Requisitos Funcionales

### Requisitos Relacionados

- RF‑01. Registrar cita  
- RF‑03. Validar disponibilidad de recursos  
- RF‑04. Generar ID de cita  
- RF‑05. Visualizar citas en calendario  

### Relación

El requisito RF‑02 depende del registro previo de los datos de la cita y actúa como una validación previa antes de la confirmación definitiva. No genera conflictos con otros requisitos funcionales, ya que no modifica estados finales ni guarda información sin confirmación explícita.

---

## Lógica de Negocio Asociada

### Reglas de Negocio

- La cita no puede confirmarse sin que el usuario revise el resumen final.
- El estado inicial de la cita al confirmarse debe ser “Pendiente”.
- El identificador único de la cita se genera únicamente al confirmar la información.
- Si el usuario regresa a editar los datos, la información capturada no debe perderse.
- El resumen debe reflejar exactamente los datos ingresados en el formulario.

### Consistencia con el Sistema

Esta funcionalidad reduce errores de captura, mejora la validación de datos y asegura que la cita quede registrada correctamente, manteniendo la trazabilidad desde el inicio del proceso y alineándose con el uso administrativo del sistema.
