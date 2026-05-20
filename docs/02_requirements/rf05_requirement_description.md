# RF-05 Guardar datos del paciente e historial de citas

## Descripcion
El sistema debe permitir registrar o recuperar la informacion basica del paciente, guardar la cita y asociarla a su historial dentro del sistema. Este proceso contempla dos escenarios: paciente de primera vez y paciente ya existente.

Si el paciente es de primera vez, el sistema debe realizar la evaluacion inicial si aplica, recopilar y validar sus datos, generar su registro y posteriormente permitir agendar una cita.  
Si el paciente ya existe, el sistema debe permitir buscar su registro, reutilizar su informacion sin duplicarla y registrar una nueva cita dentro de su historial.

*El sistema debe manejar correctamente pacientes nuevos y existentes sin duplicar informacion.*

**Informacion que se registra**

- identificacion del paciente (ID unico)
- datos basicos del paciente
- condicion de paciente (nuevo o existente)
- fecha de la cita
- hora de la cita
- consultorio asignado
- medico asignado
- estado de la cita
- relacion de la cita con el historial del paciente
- resultado de evaluacion inicial (si aplica)
- observaciones administrativas

Si el registro del paciente y la cita se realiza correctamente, la informacion debe almacenarse en el historial del paciente.  
Si ocurre algun error en el proceso, el sistema debe mostrar un mensaje de error.

---

## Relacion con otros requisitos

- **RF-03 Validar disponibilidad de recursos:**  
  antes de guardar la cita, el sistema debe verificar disponibilidad de horario, consultorio y medico.

- **RF-06 Generacion automatica de ID de paciente:**  
  cuando el paciente es nuevo, el sistema debe generar un identificador unico.

- **RF-07 Creacion de citas:**  
  una vez identificado o registrado el paciente, el sistema crea y guarda la cita.

- **RF-09 Mostrar resumen final de la cita antes de confirmar:**  
  antes de guardar, el sistema puede mostrar un resumen para validacion.

- **RF-11 Confirmacion final de la cita por correo electronico:**  
  despues de guardar la cita, el sistema puede enviar una confirmacion al paciente.

- **RF-01 Consultar detalles de una cita:**  
  la consulta de citas depende de que estas hayan sido registradas correctamente.

- **RF-02 Reprogramar una cita:**  
  para reprogramar una cita, esta debe existir previamente en el historial.

- **RF-10 Cancelar citas con anticipacion y actualizar la agenda:**  
  la cancelacion depende de que la cita haya sido registrada previamente.

- **RF-05 Identificacion visual de citas atrasadas:**  
  una cita solo puede marcarse como atrasada si ya fue guardada en el sistema.

---

## Logica de negocio

**La logica de negocio define las reglas que el sistema debe cumplir.**

**Reglas principales**

1️⃣ El sistema debe identificar si el paciente es de primera vez o existente.

2️⃣ Si el paciente es nuevo, debe realizar evaluacion inicial si aplica, capturar y validar sus datos y generar un ID unico.

3️⃣ Si el paciente ya existe, debe recuperar su informacion sin duplicarla.

4️⃣ El sistema debe permitir registrar una cita con fecha, hora, consultorio y medico asignado.

5️⃣ La cita debe quedar asociada al historial medico del paciente.

6️⃣ El paciente conserva su doctor de cabecera, salvo que solicite cambio o el medico no este disponible.

7️⃣ El sistema debe permitir actualizar el doctor de cabecera si corresponde.

---

## Como se veria en el frontend

El personal administrativo registra o busca a un paciente dentro del sistema.  
Si es un paciente nuevo, completa sus datos y crea su registro. Si ya existe, selecciona su informacion previamente almacenada.

Posteriormente, el sistema permite asignar fecha, hora, consultorio y medico para la cita. Al confirmar, la cita queda guardada y asociada al historial del paciente.