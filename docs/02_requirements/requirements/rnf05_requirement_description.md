# RNF - 05. Minimización de exposición de datos

## Objetivo del requisito

El sistema debe mostrar únicamente la información mínima necesaria para gestionar citas dentro del módulo de agenda, evitando la exposición innecesaria de datos personales o sensibles del paciente en las vistas administrativas.

Este requisito busca que la secretaria y el administrador puedan operar la agenda de forma eficiente, pero con distintos niveles de visualización según su función. La secretaria debe ver únicamente la información mínima indispensable para registrar y gestionar la cita, mientras que el administrador puede acceder a un mayor nivel de detalle cuando el seguimiento operativo del sistema lo requiera.

## Justificación

El módulo de agenda pertenece a un sistema para una clínica psicológica y, por lo tanto, trabaja con información de pacientes que debe tratarse con cuidado. Aunque este módulo requiere algunos datos básicos para identificar a la persona y administrar su cita, no forma parte de su alcance mostrar historial clínico detallado ni información sensible que no esté relacionada directamente con la operación administrativa.

Minimizar la exposición de datos ayuda a:

- reducir el riesgo de visualización innecesaria de información personal
- mantener la interfaz enfocada en la gestión de citas
- respetar el alcance del módulo de agenda dentro del sistema
- mejorar la claridad operativa al mostrar solo la información relevante en cada vista

## Alcance del requisito

Este requisito aplica a las principales vistas del módulo de agenda:

- agenda general o calendario de citas
- listado de citas
- detalle de una cita
- formularios de creación o consulta relacionados con la cita

No aplica a módulos ajenos a la agenda ni autoriza la visualización de historial clínico detallado, expedientes completos u otra información fuera del alcance administrativo definido en el sistema.

Dentro del alcance actual del módulo, este requisito distingue la visualización por actor:

- **Secretaria:** solo puede ver la información mínima indispensable para crear, identificar y gestionar correctamente una cita.
- **administrador:** puede consultar información adicional de seguimiento, incluyendo el historial clinico del paciente cuando la operación administrativa lo requiera, siempre que dicha visualización no convierta la agenda en un expediente clínico completo.

## Medición y verificación

La medición del requisito se realiza mediante un escenario de calidad para evitar interpretaciones ambiguas.

**Contexto:**
La secretaria accede a la vista general de la agenda o al detalle de una cita registrada.

**Estímulo:**
El usuario consulta la información visible de una cita dentro del módulo de agenda.

**Respuesta esperada:**
El sistema muestra únicamente los datos permitidos para esa vista y para el actor que la consulta. En el caso de la secretaria, solo se presentan los datos mínimos necesarios para operar la cita. En el caso del administrador, puede mostrarse información adicional de seguimiento, incluyendo historial del paciente cuando corresponda a sus funciones, sin exponer información clínica detallada innecesaria dentro de la agenda.

**Métrica:**

- número de campos visibles por vista menor o igual al número de campos definidos como permitidos para esa vista
- cero campos sensibles no autorizados visibles en la agenda general
- cero datos clínicos detallados visibles dentro del módulo de agenda

## Traducción del requisito en el sistema

Este requisito se traduce en reglas de presentación y visualización dentro del sistema.

- **Agenda general:** la vista principal de la agenda debe mostrar solo información resumida para identificar y localizar la cita rápidamente.
- **Listado de citas:** debe presentar datos administrativos mínimos que permitan distinguir una cita de otra sin exponer información adicional del paciente.
- **Detalle de la cita:** puede mostrar más contexto que la agenda general, pero únicamente información necesaria para gestionar la cita desde el módulo administrativo.
- **Formulario de creación o registro:** solo debe solicitar y mostrar los campos estrictamente necesarios para registrar la cita de acuerdo con el flujo correspondiente.

## Datos permitidos y no permitidos

### Agenda general

**Sí puede mostrar:**

- nombre del paciente
- nombre del terapeuta
- hora de la cita
- sala asignada
- estado de la cita

**No debe mostrar:**

- dirección del paciente
- CURP
- historial clínico detallado
- notas sensibles del paciente
- información ajena a la operación de la cita

### Detalle de la cita

**Sí puede mostrar:**

- nombre del paciente
- fecha y hora de inicio
- duración
- terapeuta asignado
- sala asignada
- tipo de sesión
- estado de la cita
- comentarios administrativos relacionados con la gestión de la cita

**No debe mostrar:**

- historial clínico detallado
- información clínica no necesaria para la agenda
- datos personales no relacionados con la operación administrativa de la cita

**Diferencia por actor en esta vista:**

- la secretaria visualiza únicamente la información mínima para identificar y operar la cita
- el administrador puede acceder al historial del paciente cuando su función de seguimiento lo requiera

### Formulario de creación o registro

**Sí puede mostrar o solicitar:**

- tipo de cita
- nombre del paciente cuando aplique
- terapeuta
- fecha
- hora de inicio
- duración
- sala
- comentarios administrativos

**No debe mostrar o solicitar innecesariamente:**

- información clínica detallada
- datos no utilizados por el flujo de agenda
- campos personales que no sean necesarios para identificar y registrar la cita

**Nota:** La minimización de exposición no impide capturar datos básicos del paciente cuando el tipo de cita lo requiere, pero limita la visualización y solicitud de información a lo estrictamente necesario para completar el flujo administrativo.

## Relación con otros requisitos

- **RF-01 Creación de citas:** este RNF influye en la información que el formulario debe mostrar o solicitar al momento de registrar una cita.
- **RF-05 Guardar datos del paciente e historial de citas:** este RNF limita qué parte de la información almacenada del paciente puede visualizarse dentro del módulo de agenda.
- **RF-06 Consultar detalles de una cita:** la consulta de detalle debe respetar la regla de mostrar solo los datos administrativos necesarios.
- **RF-07 Identificación visual de citas atrasadas:** la agenda puede resaltar citas que requieren atención, pero sin exponer información adicional no necesaria para esa vista.

## Criterios de cumplimiento

Se considera que este requisito se cumple cuando:

- la agenda general muestra únicamente datos resumidos y relevantes de cada cita
- la vista de detalle no expone historial clínico detallado ni información sensible innecesaria
- los formularios solicitan únicamente los campos necesarios para gestionar la cita
- la secretaria no puede visualizar más información de la necesaria para registrar y administrar la cita
- el administrador solo accede a información adicional cuando su función de seguimiento lo justifica
- cada vista del módulo respeta una lista clara de datos permitidos y no permitidos
- la evidencia visual del repo permite verificar que la información visible es consistente con este requisito

## Evidencia de cumplimiento

Las siguientes referencias visuales pueden utilizarse como evidencia de que la interfaz del módulo debe limitar la información visible según la vista y según el actor que consulta la información. Aunque estas imágenes provienen de prototipos asociados a otros flujos del módulo, sirven como respaldo visual del criterio de exposición mínima dentro de la agenda.

| Evidencia | Qué respalda dentro del RNF-05 |
| --- | --- |
| Detalle de la cita | Permite verificar que la vista de detalle muestra información administrativa de la cita y no un expediente clínico completo. |
| Agenda general | Permite verificar que la agenda muestra información resumida para localizar citas rápidamente sin exponer datos sensibles. |
| Formulario o captura de la cita | Permite verificar que la captura de datos se concentra en los campos necesarios para registrar la cita. |

### Detalle de la cita

La vista de detalle debe mostrar información administrativa de la cita. En la visualización de la secretaria esto implica datos mínimos de gestión; en la del administrador puede existir mayor profundidad de consulta cuando sea necesaria para seguimiento, sin convertir esta vista en un expediente clínico completo.

![Detalle de la cita](../../prototypes/rf06_frontend_consultar_citas.jpg)

### Agenda general

La agenda general debe permitir localizar citas rápidamente con información resumida y operativa. Esta evidencia respalda especialmente la restricción de visualización mínima para la secretaria.

![Agenda general](../../prototypes/rf07_flow_diagram.png)

### Formulario o captura de la cita

La captura de información debe concentrarse en los datos mínimos necesarios para registrar o continuar el flujo de agenda. Esto respalda que la creación de la cita no solicite información ajena al flujo administrativo activo.

![Formulario de captura relacionado con la cita](../../prototypes/rf01_frontend_prototype.png)


