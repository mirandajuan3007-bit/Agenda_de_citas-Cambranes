# RF-04 Generación automática de ID de paciente

## Descripción

El sistema debe generar automáticamente un ID único para cada paciente en el momento en que sea dado de alta por primera vez durante el registro de su primera cita. Este identificador debe quedar asociado de forma permanente al expediente del paciente junto con sus datos generales, para permitir su localización, consulta y seguimiento dentro del sistema. A partir de ese momento, el mismo ID debe utilizarse en las futuras citas registradas para relacionarlas correctamente con el expediente correspondiente. Si el paciente ya se encuentra registrado en el sistema, no debe generarse un nuevo ID, sino utilizar el que ya tenga asociado.

## Relación con otros requisitos

- **RF-01 Creación de citas:**  
  La generación automática del ID de paciente ocurre cuando se registra por primera vez al paciente dentro del proceso de creación de una cita inicial.

- **RF-05 Guardar datos del paciente e historial de citas:**  
  El ID generado se vincula con el expediente del paciente y permite asociar correctamente sus datos y futuras citas dentro del historial.

## Lógica de negocio

**La lógica de negocio define las reglas que el sistema debe cumplir.**

### Reglas principales

1️⃣ El sistema debe generar un ID de paciente únicamente cuando el paciente sea dado de alta por primera vez.

2️⃣ El ID generado debe ser único dentro del sistema y no puede repetirse para otro paciente.

3️⃣ El ID debe quedar asociado al expediente del paciente junto con sus datos generales.

4️⃣ Todas las citas futuras del paciente deben vincularse al mismo ID previamente generado.

5️⃣ Si el paciente ya existe en el sistema, no debe crearse un nuevo ID; debe reutilizarse el ya asociado a su expediente.

6️⃣ El ID generado debe permitir la localización, consulta y seguimiento del paciente dentro de la clínica.

![Diagrama de flujo RF04 ](../03_modeling/rf04_flow_diagram.jpg)