# RF-1 Consultar detalles de una cita

## Descripcion
El sistema debe permitir al personal administrativo consultar la informacion detallada de una cita registrada dentro de la agenda. La consulta debe poder realizarse al seleccionar una cita desde el calendario o desde el listado de citas.

Al momento de consultar una cita, el sistema debe mostrar la informacion completa asociada a esa cita para que la secretaria o el personal administrativo pueda revisarla sin necesidad de acceder a otros modulos del sistema.

*La consulta puede realizarse desde el calendario o desde el listado de citas.*

**Informacion que se muestra al consultar una cita**

- paciente asociado
- sala asignada
- terapeuta asignado
- tipo de sesion
- duracion de la cita
- estado actual de la cita

Si la cita existe en el sistema, sus detalles deben visualizarse correctamente en la interfaz.  
Si la cita no existe o no esta disponible, el sistema debe mostrar un mensaje de error.


## Relacion con otros requisitos

- **RF-01 Creacion de cita:**  
para poder consultar los detalles de una cita, primero debe existir una cita registrada en el sistema.

- **RF-02 Mostrar resumen final de la cita antes de confirmar:**  
la informacion que se consulta despues debe corresponder con los datos que fueron revisados en el resumen final antes de guardar la cita.

- **RF-03 Validar disponibilidad de recursos:**  
al consultar una cita se puede revisar la asignacion de terapeuta, sala y horario, informacion que depende de la validacion previa de disponibilidad.

- **RF-04 Generacion automatica de ID de paciente:**  
al consultar una cita, el sistema puede identificar correctamente al paciente asociado mediante su identificador unico.

- **RF-05 Guardar datos del paciente e historial de citas:**  
la consulta de una cita se relaciona con la informacion almacenada del paciente y con su historial dentro del sistema.

- **RF-07 Identificacion visual de citas atrasadas:**  
al consultar una cita, el sistema puede mostrar su estado actual, incluyendo si la cita esta atrasada o requiere una alerta visual.

- **RF-08 Reprogramar una cita:**  
antes de reprogramar una cita, es necesario consultar sus detalles actuales para verificar su informacion registrada.

- **RF-09 Cancelar citas con anticipacion y actualizar la agenda:**  
antes de cancelar una cita, el personal puede consultar sus detalles para confirmar que se trata de la cita correcta y revisar su estado actual.


## Logica de negocio

**La logica de negocio define las reglas que el sistema debe cumplir.**

**Reglas principales**

1️⃣ Solo se pueden consultar citas previamente registradas en el sistema.

2️⃣ La consulta debe realizarse desde un elemento valido de la agenda, ya sea el calendario o el listado de citas.

3️⃣ El sistema debe mostrar como minimo el paciente, sala, terapeuta, tipo de sesion, duracion y estado de la cita.

4️⃣ Si la cita no existe o fue eliminada, el sistema debe mostrar un mensaje de error.

5️⃣ La consulta no debe modificar la informacion de la cita, solo mostrar sus detalles.

## Como se veria en el frontend

El personal administrativo selecciona una cita desde el calendario o desde el listado de citas.  
Despues, el sistema abre una ventana, tarjeta o vista de detalles donde se muestra la informacion completa de la cita seleccionada.

![Flujo del requisito](../consultar-cita.png)