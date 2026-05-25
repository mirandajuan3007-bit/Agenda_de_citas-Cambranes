# RF-07 Identificacion visual de citas atrasadas

## Descripcion

El sistema debe permitir que la secretaria identifique visualmente, dentro de la agenda, aquellas citas que ya sobrepasaron su hora de inicio y que aun no han sido atendidas, finalizadas, canceladas o reprogramadas.

La finalidad de este requisito es facilitar la supervision operativa de la agenda, permitiendo detectar de forma inmediata citas que requieren atencion administrativa. En lugar de obligar al usuario a abrir cada registro para revisar su situacion, la interfaz debe resaltar visualmente las citas atrasadas mediante un cambio de color, icono, etiqueta o indicador equivalente.

Este requisito representa una condicion visual derivada del tiempo y del estado actual de la cita. Es decir, "atrasada" no reemplaza los estados funcionales del sistema como programada, cancelada, reprogramada o finalizada; solamente agrega una alerta visual para ayudar a la toma de decisiones.

### Informacion visible que debe reflejar la alerta

- cita resaltada directamente en el calendario o listado de agenda
- indicador visual de atraso, por ejemplo color rojo o icono de alerta
- hora programada de la cita
- paciente asociado
- terapeuta o sala asignada
- estado actual de la cita

## Relacion con otros requisitos

- **RF-01 Creacion de cita:**
	la alerta visual solo puede existir si previamente la cita fue registrada en la agenda.

- **RF-06 Consultar detalles de una cita:**
	al detectar una cita atrasada, la secretaria puede abrir sus detalles para verificar su informacion y decidir la accion correspondiente.

- **RF-08 Reprogramar una cita:**
	si una cita ya no puede atenderse en su horario original, el indicador visual ayuda a identificar que debe reprogramarse.

- **RF-09 Cancelar citas con anticipacion y actualizar la agenda:**
	si una cita ya no sera atendida, la alerta visual facilita detectar que debe cancelarse o actualizarse antes de seguir afectando la agenda.

## Justificacion dentro del sistema

Este requisito mejora el control visual de la agenda y reduce el tiempo que el personal administrativo dedica a revisar manualmente cada cita. Tambien ayuda a detectar incidencias operativas, como pacientes ausentes, retrasos en la atencion o registros que no fueron actualizados a tiempo.

En un entorno administrativo con multiples terapeutas, salas y citas en curso, esta identificacion visual permite priorizar acciones de seguimiento sin depender exclusivamente de una revision detallada de cada registro.

## Criterios de cumplimiento

Se considera que este requisito esta correctamente implementado cuando:

- una cita programada cambia a una presentacion visual de alerta al superar su hora de inicio sin haber sido actualizada a un estado final
- la alerta se muestra directamente en la agenda sin necesidad de abrir el detalle de la cita
- una cita cancelada, reprogramada o finalizada deja de mostrarse como atrasada
- la alerta visual es consistente en todos los puntos donde se muestre la agenda o el listado principal de citas
- la secretaria puede distinguir facilmente entre una cita programada normal y una cita que requiere atencion inmediata

## Traduccion funcional dentro del sistema

Dentro del sistema, este requisito se traduce como una regla de presentacion que evalua dos elementos:

1. El tiempo actual en relacion con la hora programada de inicio de la cita.
2. El estado registrado de la cita dentro de la agenda.

Si la fecha y hora actual ya superaron el inicio de la cita, y la cita continua registrada como programada, el sistema debe mostrarla como atrasada mediante una alerta visual.

Esto permite que el usuario interprete rapidamente que la cita requiere revision administrativa, sin alterar automaticamente el estado de negocio de la cita.

## Logica de negocio

**La logica de negocio define las reglas que el sistema debe cumplir.**

**Reglas principales:**

1. Solo puede marcarse visualmente como atrasada una cita existente y previamente registrada en la agenda.

2. La condicion de atraso debe calcularse cuando la fecha y hora actual superen la hora de inicio programada de la cita.

3. La alerta visual solo aplica a citas cuyo estado aun requiera seguimiento operativo, principalmente aquellas que siguen programadas.

4. Una cita cancelada, reprogramada o finalizada no debe mostrarse como atrasada.

5. La identificacion visual de atraso no debe modificar automaticamente el estado funcional de la cita en la base de datos.

6. La alerta visual debe mantenerse visible hasta que la cita sea atendida administrativamente o se actualice su estado.

7. El mecanismo visual utilizado debe ser claro y consistente para evitar confusion con otras categorias o estados de la agenda.

## Casos en los que aplica la alerta

- cuando ya paso la hora de inicio de la cita y sigue apareciendo como programada
- cuando la secretaria detecta una cita vencida en el calendario durante la jornada
- cuando una cita no fue actualizada oportunamente y necesita revision inmediata

## Casos en los que no debe aplicar la alerta

- cuando la cita aun no llega a su hora de inicio
- cuando la cita ya fue cancelada
- cuando la cita ya fue reprogramada
- cuando la cita ya fue finalizada

## Como se veria en el frontend

En el calendario o en el listado principal de citas, aquellas que ya sobrepasaron su hora de inicio y siguen pendientes de atencion deben mostrarse con un estilo visual distinto, por ejemplo color rojo, borde resaltado o icono de advertencia.

Al seleccionar una de estas citas, la secretaria puede revisar el detalle y decidir si debe consultarla, reprogramarla o cancelarla segun corresponda.
