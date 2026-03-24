# RF-09 Cancelar Citas con Anticipación y Actualizar la Agenda  

## Descripción  
El sistema debe permitir a la secretaria cancelar una cita previamente registrada antes de su fecha programada.  
Durante la cancelación, el sistema debe actualizar automáticamente la agenda para reflejar que ese espacio queda disponible nuevamente.

Además, la cancelación debe quedar registrada para mantener trazabilidad sobre la acción realizada, incluyendo la información relevante de la cita y del usuario que realizó la cancelación.

Una vez cancelada, la cita ya no debe mostrarse como activa dentro de la agenda del sistema.

### Información que se registra al cancelar una cita

- Cita cancelada (identificador o folio)  
- Paciente asociado  
- Fecha de la cita  
- Hora de la cita  
- Estado actualizado de la cita (cancelada)  
- Motivo de cancelación  
- Fecha de cancelación  
- Usuario responsable de la acción  

## Relación con otros requisitos  

- **RF-1 Consultar detalles de una cita:**  
  Permite visualizar la información de la cita antes de cancelarla.  

- **RF-2 Reprogramar una cita:**  
  Si la cita no se cancela, puede ser reprogramada en lugar de eliminarse.  

- **RF-3 Validar disponibilidad:**  
  Al cancelar una cita, se libera el espacio para futuras reservas.  

- **RF-5 Visualización de citas atrasadas:**  
  Una cita cancelada no debe aparecer como atrasada.  

## Lógica de negocio  

### Reglas principales  

1. Solo se pueden cancelar citas antes de su hora programada.  
2. Al cancelar una cita, su estado debe cambiar a **"cancelada"**.  
3. La cita cancelada no debe mostrarse como activa en la agenda.  
4. El sistema debe registrar el motivo de la cancelación.  
5. Se debe guardar la fecha y el usuario que realizó la cancelación.  
6. Al cancelarse una cita, el horario debe quedar disponible para nuevas citas.  

## Cómo se vería en el frontend  

El usuario (secretaria) selecciona una cita desde la agenda y accede a sus detalles.  
Posteriormente, selecciona la opción de **cancelar cita**, ingresa el motivo de la cancelación y confirma la acción.  

El sistema actualiza el estado de la cita a "cancelada", la elimina de la agenda activa y libera el espacio correspondiente.
