## RF - Guardar Datos del Paciente e Historial de Cita (Freddie)

## Descripción

Este requisito funcional permite registrar o recuperar la información básica del paciente, guardar la cita y asociarla a su historial médico dentro del sistema. El proceso contempla dos escenarios: paciente de primera vez y paciente ya existente.

Si el paciente es de primera vez, se realiza la encuesta socioeconómica o evaluación inicial si aplica, se recopilan y validan sus datos básicos, se genera su registro en el sistema y posteriormente se agenda la cita. Entre los datos almacenados se incluyen, como mínimo, el nombre del paciente, teléfono o medio de contacto, correo electrónico, dirección registrada y los datos necesarios para identificarlo dentro del sistema. Después, se acuerdan la fecha y hora, se asigna el consultorio, se define el médico de la cita y finalmente la cita queda registrada como parte del historial médico del paciente. En este caso, el médico asignado puede quedar como doctor de cabecera inicial del paciente.

Si el paciente ya existe, el sistema permite buscar y seleccionar su registro, reutilizar su información sin duplicarla y guardar una nueva cita asociada al mismo historial. De esta manera, el sistema conserva la información de contacto, direcciones registradas y citas previas del paciente para reutilizarla en futuras atenciones y facilitar el seguimiento administrativo dentro de la clínica. Como regla general, el paciente conserva su doctor de cabecera actual; sin embargo, si el paciente lo solicita o el médico no está disponible, se puede asignar un médico distinto para la cita. Posteriormente, el sistema debe permitir decidir si se mantiene el doctor de cabecera anterior o si se actualiza el nuevo médico como doctor de cabecera del paciente.

En esta etapa, el sistema puede registrar:

- Confirmación de que es paciente de primera vez.
- Resultado de la encuesta socioeconómica.
- Observaciones iniciales administrativas o de algún otro tipo.
- Información base necesaria para apertura de expediente.

## Información que se registra

Dentro de este requisito, el sistema registra información del paciente y de la cita.

### Datos del paciente

- ID del paciente.
- Datos básicos de identificación.
- Condición de paciente nuevo o existente.
- Registro vinculado a su expediente o historial.

### Datos de la cita

- Fecha de la cita.
- Hora de la cita.
- Consultorio asignado.
- Médico de la cita.
- Estado de la cita dentro del sistema.

### Datos asociados al historial

- Relación de la cita con el historial médico del paciente.
- Continuidad del expediente del mismo paciente, si es su segunda vez.
- Actualización del doctor de cabecera cuando corresponda.

## Relación con otros requisitos funcionales

### RF-3. Validar disponibilidad de recursos

Antes de guardar la cita, el sistema debe verificar que exista disponibilidad de horario, consultorio y médico. Por ello, este requisito depende de la validación previa de recursos.

### RF-6. Generación automática de ID de paciente

Cuando el paciente es de primera vez, el sistema debe generar un identificador único que permita registrar correctamente su información y asociar todas sus citas futuras al mismo historial.

### RF-7. Creación de citas

Se relaciona de forma directa porque, una vez identificado o registrado el paciente, el sistema debe crear la cita y dejarla almacenada junto con sus datos.

### RF-9. Mostrar resumen final de la cita antes de confirmar

Antes del guardado definitivo, puede mostrarse un resumen con los datos del paciente y de la cita para confirmar que todo sea correcto.

### RF-11. Confirmación final de la cita por correo electrónico

Después de guardar correctamente la información del paciente y la cita, el sistema puede enviar la confirmación final por correo electrónico.

### RF-1. Consultar detalles de una cita

Solo es posible consultar los detalles de una cita si previamente fue registrada y asociada correctamente al paciente.

### RF-2. Reprogramar cita

Para reprogramar una cita primero debe existir una cita almacenada dentro del historial del paciente.

### RF-10. Cancelar citas con anticipación y actualizar la agenda

La cancelación de una cita depende de que dicha cita haya sido registrada previamente en el sistema.

### RF-5. Identificación visual de citas atrasadas

Una cita solo puede marcarse como atrasada si ya fue guardada con fecha, hora y estado dentro de la agenda.

### Lógica de negocio

El sistema debe identificar si el paciente es de primera vez o existente. Si es nuevo, debe realizar evaluación inicial si aplica, capturar y validar sus datos, generar su ID y guardar su registro. Si ya existe, debe recuperar su información sin duplicarla. Después, debe guardar la cita con fecha, hora, consultorio y médico asignado, y asociarla al historial médico. Como regla general, el paciente conserva su doctor de cabecera, salvo que solicite cambio o el médico no esté disponible.
### Diagrama
