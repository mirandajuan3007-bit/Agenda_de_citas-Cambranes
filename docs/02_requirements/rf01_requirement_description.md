# RF-7 Creacion de citas

## Descripcion
El sistema debe permitir a la secretaria registrar una nueva cita para un paciente dentro de la agenda. Durante la creacion, el sistema debe verificar que los recursos necesarios esten disponibles (paciente, terapeuta y sala) para evitar conflictos de horario. El sistema debe permitir dos tipos de registro: "Cita de terapia" o "Evaluacion inicial". Dependiendo del tipo, los pasos y la informacion requerida cambian ligeramente.

*La cita tiene dos tipos de registro.*

**Informacion que se registra en Evaluacion inicial**

- nombre(s) 
- apellidos  
- telefono
- correo 
- terapeuta 
- fecha 
- hora de inicio
- duracion
- sala 
- comentarios (detalles especificos del paciente, de la cita o del terapeuta)


**Informacion que se registra en Cita de terapia**

- paciente (dado que ya se registro con anterioridad, se elige de una lista, ya que esta en la base de datos)
- folio (se genera automaticamente)
- terapeuta
- fecha 
- hora de inicio
- duracion
- sala 
- comprobante de pago (se cobra despues de la primera sesion)
- cuota
- comentarios (detalles especificos del paciente, de la cita o del terapeuta)

Una vez creada, la cita aparecerá automáticamente en la agenda del sistema. 

## Relacion con otros requisitos

- **RF-1 Consultar detalles de una cita:**
si no se crea la cita, no se pueden ver los detalles de dicha cita.
- **RF-2 Reprogramar una cita:**
si no se crea la cita, no se puede reprogramar.
- **RF-3 Validar disponibilidad:**
al registrar una cita se valida la disponibilidad de horarios, terapeutas y salas.
- **RF-4 Recordatorio automatico de citas:**
al crear la cita, el sistema envia recordatorios antes del inicio.
- **RF-5 Visualizacion de citas atrasadas:**
si el paciente no llega a tiempo, se muestra una alerta visual.
- **RF-8 Guardar datos del paciente en el historial medico:**
al crear la primera cita, la informacion del paciente se guarda en el expediente.

## Lógica de negocio

**La lógica de negocio define las reglas que el sistema debe cumplir.**

**Reglas principales**

1️⃣ Un terapeuta no puede tener dos citas al mismo tiempo.

2️⃣ Una sala no puede usarse en dos citas simultaneamente.

3️⃣ Un paciente no puede tener dos citas al mismo tiempo.

4️⃣ La hora de inicio debe ser menor que la hora de finalizacion.

5️⃣ La cita debe crearse con estado: programado.

## Como se veria en el frontend

![Flujo del requisito](../frontend.png)



