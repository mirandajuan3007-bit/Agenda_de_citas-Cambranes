# RF-03 Validar disponibilidad de recursos

## Descripcion
El sistema debe validar automaticamente la disponibilidad de los recursos necesarios antes de registrar una nueva cita o reprogramar una cita existente dentro del modulo de agenda.

La validacion debe realizarse sobre los siguientes recursos:

- terapeuta
- sala
- paciente

Al momento de intentar registrar o modificar una cita, el sistema debe revisar si existe un conflicto de horario con cualquiera de estos recursos.  
Si no existe conflicto, el sistema debe permitir continuar con el registro o actualizacion de la cita.  
Si existe conflicto, el sistema debe impedir la operacion y mostrar un mensaje de error indicando que el horario seleccionado no esta disponible.

*La validacion debe ejecutarse tanto en el flujo de creacion de cita como en el flujo de reprogramacion.*

**Acciones que realiza el sistema al validar disponibilidad**

- recibe los datos de la cita o de la reprogramacion
- verifica disponibilidad del terapeuta en el horario seleccionado
- verifica disponibilidad de la sala en el horario seleccionado
- verifica disponibilidad del paciente en el horario seleccionado
- determina si existe o no conflicto de agenda
- permite guardar si no hay conflicto
- bloquea la operacion y muestra un error si hay conflicto

## Relacion con otros requisitos

- **RF-01 Creacion de cita:**  
antes de guardar una nueva cita, el sistema debe validar que terapeuta, sala y paciente esten disponibles en el horario seleccionado.

- **RF-02 Mostrar resumen final de la cita antes de confirmar:**  
la validacion de disponibilidad debe ocurrir antes de la confirmacion final, para evitar que se muestre como valida una cita con conflicto.

- **RF-04 Generacion automatica de ID de paciente:**  
la validacion requiere identificar correctamente al paciente asociado a la cita para revisar si ya tiene otra cita en el mismo horario.

- **RF-05 Guardar datos del paciente e historial de citas:**  
la disponibilidad del paciente se determina a partir de la informacion previamente registrada en el sistema y del historial de citas existentes.

- **RF-06 Consultar detalles de una cita:**  
la asignacion de terapeuta, sala y horario que se consulta en una cita depende de que previamente se haya validado la disponibilidad de esos recursos.

- **RF-08 Reprogramar una cita:**  
al modificar fecha, hora, terapeuta o sala de una cita existente, el sistema debe volver a validar disponibilidad antes de guardar los cambios.

- **RF-09 Cancelar citas con anticipacion y actualizar la agenda:**  
cuando una cita se cancela, los recursos asociados vuelven a quedar disponibles para nuevas citas en ese horario.

## Logica de negocio

**La logica de negocio define las reglas que el sistema debe cumplir.**

**Reglas principales**

1.-Antes de registrar una cita nueva, el sistema debe validar la disponibilidad del terapeuta, la sala y el paciente.

2.- Antes de reprogramar una cita existente, el sistema debe volver a validar la disponibilidad de los recursos involucrados en el nuevo horario.

3.- Un terapeuta no puede tener dos citas asignadas en el mismo horario.

4.- Una sala no puede estar asignada a dos citas en el mismo horario.

5.- Un paciente no puede tener dos citas registradas en el mismo horario.

6.- Si existe conflicto con al menos uno de los recursos, el sistema debe impedir el registro o la reprogramacion de la cita.

7.- Si existe conflicto, el sistema debe mostrar un mensaje claro indicando que el horario seleccionado no esta disponible.

8️.- Solo si no existe conflicto con ninguno de los recursos, el sistema debe permitir guardar la cita o los cambios realizados.

9️.- La validacion de disponibilidad no debe modificar informacion por si sola; su funcion es decidir si la operacion puede continuar o no.

## Como se veria en el frontend

El personal administrativo captura o modifica los datos de una cita desde el formulario del modulo de agenda.  
Al seleccionar fecha, hora, terapeuta, sala y paciente, y al intentar confirmar la operacion, el sistema ejecuta la validacion de disponibilidad.

Si no existe conflicto, el sistema permite continuar con el registro o actualizacion de la cita.  
Si existe conflicto, el sistema muestra un mensaje de error visible en la interfaz indicando que el horario seleccionado no esta disponible y no permite guardar la operacion.

El mensaje puede presentarse cerca del formulario, en una alerta o en un cuadro de validacion, dependiendo del diseno de la interfaz.

<img width="2232" height="2847" alt="Diagrama de flujo" src="https://github.com/user-attachments/assets/156ff282-49ff-4373-a1e5-8bb0cf4420c1" />

