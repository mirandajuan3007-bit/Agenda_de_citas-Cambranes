# Guia de trabajo del equipo

## Proposito

Este repositorio es la fuente unica de verdad del proyecto. Toda la informacion oficial del trabajo del equipo debe vivir aqui: documentacion, requisitos, diagramas, decisiones, issues, ramas, pull requests y avance del proyecto.

No se debe usar Google Docs como lugar principal de trabajo. Si se usa una herramienta externa para borradores personales, el contenido final debe pasar al repositorio y mantenerse aqui.

## Alcance de esta guia dentro del proyecto

Esta guia aplica al proyecto **Modulo de Agenda para una clinica psicologica**. En este momento el equipo esta trabajando en **fase de diseño**, no en implementacion. Por lo tanto, el trabajo esperado en el repositorio se centra en:

- definicion del problema y alcance
- requisitos funcionales y no funcionales
- diagramas de flujo
- prototipos de interfaz
- diseño de base de datos
- trazabilidad entre issues, archivos y entregables

Mientras el proyecto siga en fase de diseño, una tarea no se considera completa por tener solo texto. Debe dejar entregables concretos dentro del repositorio.

## Objetivo de esta guia

Esta guia define como trabaja el equipo dentro del repositorio para que:

- el trabajo sea visible
- cada aporte tenga responsable
- las tareas tengan criterios claros
- el avance pueda medirse
- el flujo hacia `develop` y luego hacia `main` sea ordenado

## Estructura real del repositorio

Actualmente este proyecto organiza su trabajo principalmente en estas rutas:

- `README.md`: resumen general del modulo
- `docs/01_problem_definition`: contexto, alcance y limites del modulo
- `docs/02_requirements`: requisitos funcionales del modulo
- `docs/03_modeling`: diagramas de flujo por requisito
- `docs/04_design`: diseño de base de datos y decisiones de diseño
- `prototypes`: prototipos visuales del modulo
- `CONTRIBUTING.md`: reglas de trabajo del equipo dentro del repo

Todo nuevo trabajo debe respetar esta estructura. No se deben crear archivos en rutas aleatorias si ya existe una carpeta oficial para ese tipo de entregable.

## Estado actual del proyecto

Al momento de esta guia, el repositorio ya tiene documentados o parcialmente consolidados estos requisitos funcionales:

- RF-01 Creacion de citas
- RF-05 Guardar datos del paciente e historial de citas
- RF-06 Consultar detalles de una cita
- RF-08 Reprogramar una cita
- RF-09 Cancelar citas con anticipacion y actualizar la agenda

Ademas, del seguimiento del proyecto se desprende que siguen pendientes de consolidacion en el repo tareas relacionadas con:

- RF-02 Mostrar resumen final antes de confirmar
- RF-03 Validar disponibilidad de recursos
- RF-04 Generacion automatica de ID de paciente
- RF-07 Identificacion visual de citas atrasadas
- RNF vinculados a privacidad, documentacion, observabilidad, usabilidad y proteccion contra errores de edicion

La guia de trabajo debe ayudar a que estos elementos pendientes entren al repositorio de forma ordenada y medible.

## Estructura de ramas

El proyecto usa tres niveles de trabajo:

- `main`: contiene solo trabajo consolidado, aprobado y listo como version principal del proyecto
- `develop`: rama de integracion del equipo; aqui llegan los PR de trabajo ya revisado
- ramas de tarea: ramas temporales creadas por integrante para resolver una issue especifica

## Regla principal de ramas

- No se hace trabajo directo en `main`
- No se hace trabajo directo en `develop`
- Todo cambio debe pasar por una rama de tarea y luego por Pull Request
- las ramas deben de cumplir un proposito definido y ser borrado 

## Como crear una rama de trabajo

Cada tarea debe comenzar creando una rama desde `develop`.

Flujo esperado:

1. Actualizar `develop`
2. Crear una rama nueva
3. Trabajar solo en esa rama
4. Abrir PR hacia `develop`

Ejemplo:

```bash
git checkout develop
git pull origin develop
git checkout -b docs/rf03-validacion-disponibilidad
```

## Convencion de nombres para ramas

Usar nombres claros y cortos, relacionados con la issue o el entregable.

Prefijos recomendados:

- `docs/` para documentacion general
- `rf/` para requisitos funcionales
- `rnf/` para requisitos no funcionales
- `design/` para diseño de base de datos, diagramas o arquitectura
- `fix/` para correcciones de contenido existente

Ejemplos:

- `docs/team-workflow`
- `rf/rf03-validar-disponibilidad`
- `rnf/rnf02-privacidad-ui`
- `design/rf08-db-design`

## Como tomar una issue

Antes de empezar a trabajar, cada integrante debe tomar una issue bien definida.

Una issue valida debe incluir como minimo:

- titulo claro
- descripcion del trabajo
- entregable esperado
- responsable asignado
- criterios de aceptacion
- relacion con un RF, RNF o archivo del repo

En este proyecto, ademas, la issue debe indicar explicitamente si corresponde a:

- `problem_definition`
- `requirement`
- `modeling`
- `design`
- `process`

Si la issue no tiene eso, no debe iniciarse todavia. Primero debe corregirse.

## Regla para iniciar trabajo

Una tarea solo pasa a `In Progress` cuando cumple estas condiciones:

- ya existe la issue
- tiene responsable
- tiene descripcion clara
- tiene criterios de aceptacion
- la rama ya fue creada
- ya se sabe en que carpeta del repo se entregara el trabajo

## Regla de asignacion obligatoria

Ninguna issue puede quedar sin asignado por mas de 24 horas desde su creacion.

Aplicacion practica:

- si una issue se crea y aun no tiene responsable, debe asignarse dentro de las siguientes 24 horas
- si nadie la puede tomar todavia, debe marcarse explicitamente en backlog y discutirse en la siguiente revision del equipo
- una issue sin responsable no debe pasar a `To Do` ni a `In Progress`
- el tablero y el reporte de estado del proyecto deben mostrar estas issues como incumplimiento de gestion

## Uso del board

El board debe reflejar el estado real del trabajo. No se usa como decoracion.

Flujo oficial:

`Backlog -> To Do -> In Progress -> Review -> Done`

Definicion de cada columna:

- `Backlog`: ideas o tareas identificadas, pero aun no listas para comenzar
- `To Do`: tareas listas para trabajarse, con descripcion y responsable
- `In Progress`: tareas que ya estan siendo trabajadas en una rama activa
- `Review`: tareas con PR abierto, listas para revision
- `Done`: tareas revisadas, aprobadas y mergeadas en `develop`

En este proyecto, la columna `Review` es obligatoria para separar claramente el trabajo terminado por quien lo hizo del trabajo ya validado por otra persona.

## Regla para mover tarjetas

- una tarjeta pasa a `To Do` cuando ya esta clara y asignada
- pasa a `In Progress` cuando el responsable ya esta trabajando en su rama
- pasa a `Review` cuando el PR ya esta abierto y cumple el checklist minimo
- pasa a `Done` cuando el PR ya fue aprobado, mergeado y la issue vinculada fue cerrada

No se debe mover una tarjeta a `Done` solo porque el archivo ya existe. En este proyecto, `Done` significa entregable revisado y consolidado en `develop`.

## Pull Requests

Un Pull Request representa trabajo listo para revisarse, no trabajo a medio hacer.

El PR no debe usarse para preguntar si la idea esta bien. Esa validacion debe ocurrir antes, en la issue o durante la preparacion del trabajo.

Cada PR debe:

- salir de una rama de tarea
- apuntar a `develop`
- estar vinculado a una issue
- usar la plantilla oficial del repositorio
- tener descripcion clara
- tener un solo reviewer principal
- cumplir los criterios de aceptacion antes de pedirse revision

Si el PR modifica un requisito o un diseño ya existente, debe indicar claramente:

- que archivo se actualizo
- que inconsistencia se corrigio
- que entregable adicional se agrego o quedo pendiente

## Cuando abrir un PR

Se abre un PR solo cuando:

- el trabajo de la issue esta completo
- el archivo o entregable ya esta en el repo
- el contenido ya fue revisado por quien lo hizo
- el checklist de aceptacion ya se cumple
- el cambio esta listo para ser validado por otra persona

En este proyecto, abrir PR sin diagrama, sin ruta correcta o sin coherencia con los demas RF se considera trabajo incompleto.

## Plantillas obligatorias del repositorio

Para que el trabajo sea trazable y revisable, el repositorio incluye estos artefactos de apoyo:

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/functional-requirement.md`
- `.github/ISSUE_TEMPLATE/non-functional-requirement.md`
- `.github/ISSUE_TEMPLATE/documentation-task.md`
- `.github/CODEOWNERS`
- `docs/README.md`

Reglas de uso:

- toda issue nueva debe crearse con una plantilla adecuada
- todo PR nuevo debe completar la plantilla del repositorio
- el reviewer principal debe quedar definido en la issue o en el PR
- si una tarea no encaja en ninguna plantilla, primero debe aclararse antes de iniciarse

## Proteccion recomendada de ramas en GitHub

Ademas de las reglas escritas en el repo, este proyecto debe configurar proteccion de ramas directamente en GitHub.

### Para `main`

- bloquear pushes directos
- permitir cambios solo por PR
- requerir al menos 1 aprobacion
- requerir que las conversaciones esten resueltas antes de merge
- requerir estado exitoso del workflow de calidad documental

### Para `develop`

- bloquear pushes directos del equipo cuando sea posible
- permitir cambios por PR
- requerir al menos 1 aprobacion
- requerir que el PR este vinculado a una issue
- requerir estado exitoso del workflow de calidad documental cuando el repo ya este mas estable

### Criterio practico

`main` debe ser la rama mas protegida.

`develop` puede ser un poco mas flexible al inicio, pero no debe convertirse en una rama donde cualquiera sube trabajo sin revision.

## Quien revisa

No todo el equipo revisa todo.

Cada PR debe tener un reviewer principal. Ese reviewer es responsable de verificar:

- que el trabajo corresponde a la issue
- que los criterios de aceptacion se cumplen
- que el cambio es coherente con el resto del repo
- que no hay inconsistencias de nombres, numeracion o estructura
- que la ruta del archivo es correcta dentro de `docs/` o `prototypes/`
- que los nombres del RF, los titulos y las referencias cruzadas coinciden

Si hace falta opinion adicional, se puede pedir, pero la revision formal debe recaer en una sola persona.

## Que significa Done

Una tarea no esta terminada solo porque alguien la empezo o subio archivos. Una tarea esta `Done` cuando:

- la issue estaba bien definida
- se trabajo en una rama propia
- se abrio PR hacia `develop`
- un reviewer la valido
- el cambio fue mergeado
- la issue vinculada fue cerrada
- la tarjeta del board fue movida a `Done`

Para este proyecto de agenda, `Done` tambien implica que el trabajo ya puede ser usado como referencia oficial por el resto del equipo.

## Checklist de aceptacion para documentacion

Un documento de requisitos, contexto o proceso se considera listo cuando:

- tiene titulo claro
- tiene objetivo o proposito definido
- esta redactado de forma entendible
- no contradice otros documentos del repo
- usa nombres consistentes con el resto del proyecto
- incluye relaciones con otros requisitos cuando aplica
- incluye diagrama o referencia visual cuando aplica
- esta guardado en la carpeta correcta
- esta alineado con el modulo de agenda y no describe funciones fuera del alcance actual

## Checklist de aceptacion para requisitos funcionales

Un RF se considera listo cuando:

- define actor principal
- describe el objetivo del requisito
- explica el flujo general
- incluye reglas de negocio
- indica relacion con otros RF o RNF
- tiene diagrama de flujo
- tiene prototipo o referencia visual si corresponde
- esta conectado con su issue de trabajo

Para este proyecto, un RF debe quedar ubicado en `docs/02_requirements` y su entregable debe revisarse contra:

- `README.md`
- `docs/01_problem_definition/system_context.md`
- los demas RF existentes

Si el RF afecta datos o persistencia, debe evaluarse si tambien necesita actualizar un archivo en `docs/04_design`.

## Checklist de aceptacion para diseño de base de datos

Un documento de diseño se considera listo cuando:

- identifica entidades necesarias
- muestra relaciones entre entidades
- define llaves primarias y foraneas
- refleja reglas de negocio del modulo
- usa nombres claros y consistentes
- no tiene errores obvios de escritura o estructura
- esta alineado con el RF correspondiente

En el caso particular de este proyecto, el diseño debe respetar reglas ya definidas como:

- no borrar citas fisicamente
- mantener trazabilidad
- evitar conflictos de horario entre paciente, terapeuta y sala
- reflejar estados como `programada`, `cancelada`, `reprogramada` y `finalizada`

El archivo de diseño tambien debe corresponder al RF correcto y ubicarse en `docs/04_design`.

## Checklist de aceptacion para diagramas y prototipos

Si una tarea incluye modelado o apoyo visual, se considera completa solo cuando:

- el diagrama esta en `docs/03_modeling`
- el nombre del archivo coincide con el RF o la tarea
- el diagrama representa el flujo descrito en el requisito
- el prototipo esta en `prototypes` cuando aplica
- las referencias desde el documento del requisito apuntan al archivo correcto

## Como cerrar una issue

La issue se cierra solo al final del proceso, no al empezar el trabajo.

Secuencia correcta:

1. Se completa el trabajo en la rama
2. Se abre PR
3. Se realiza revision
4. Se aprueba y mergea en `develop`
5. Se cierra la issue vinculada
6. Se mueve la tarjeta a `Done`

Si al mergear queda trabajo faltante, no se debe cerrar la issue original sin antes crear una nueva issue de seguimiento.

## Merge hacia main

`main` no recibe PR de tareas individuales. `main` recibe integraciones consolidadas desde `develop`.

Flujo esperado:

1. integrantes trabajan en ramas propias
2. hacen PR a `develop`
3. `develop` integra trabajo revisado del equipo
4. cuando hay un bloque estable, se hace PR de `develop` a `main`

En este proyecto, un bloque estable puede ser por ejemplo:

- un conjunto coherente de RF consolidados
- una entrega completa de diseño de base de datos
- una actualizacion de proceso del equipo
- un cierre parcial de la fase de analisis y diseño

## Medicion de avance

El repo debe permitir ver el avance del equipo de forma objetiva.

Minimo esperado por semana:

- total de issues planificadas
- total de issues cerradas
- issues en `In Progress`
- issues en `Review`
- issues completadas por integrante

Para este proyecto conviene medir tambien:

- cuantos RF ya estan documentados en `docs/02_requirements`
- cuantos RF tienen diagrama en `docs/03_modeling`
- cuantos RF ya tienen diseño asociado en `docs/04_design`
- cuantos RNF ya fueron consolidados dentro del repo

Ejemplo de medicion simple:

- integrante A: 3 issues cerradas de 5 asignadas
- integrante B: 2 issues cerradas de 4 asignadas
- avance general: 7 tareas completadas de 12 planificadas

## Visibilidad de contribuciones

Cada integrante debe dejar rastro claro de su trabajo mediante:

- issues asignadas
- ramas propias
- commits propios
- PR abiertos
- revisiones realizadas

Como el profesor quiere ver aportes individuales, no se deben hacer entregas grupales por fuera del repo ni combinar trabajo de varias personas sin trazabilidad clara.

Esto permite ver quien hizo que y cuanto aporto cada integrante.

## Reglas practicas del equipo

- no crear ramas sin una tarea clara
- no abrir PR sin checklist cumplido
- no mover tarjetas manualmente a `Done` sin merge real
- no dejar issues sin descripcion ni criterios de aceptacion
- no trabajar fuera del repo como version oficial
- no usar `develop` como rama de trabajo personal
- no dejar RF en el board si todavia no tienen su archivo o ruta definida en el repo
- no duplicar contenido entre archivos que describen lo mismo
- no usar nombres de RF, titulos y archivos que se contradigan entre si

## Criterio de calidad especifico para este repositorio

Antes de pedir revision, cada integrante debe comprobar que su trabajo no introduce alguno de estos problemas, que ya afectaron al proyecto anteriormente:

- numeracion incorrecta de RF
- nombres de archivos inconsistentes
- referencias cruzadas equivocadas entre requisitos
- enlaces rotos a diagramas o prototipos
- terminos distintos para el mismo estado o la misma entidad
- diseños de base de datos con nombres mal escritos o columnas contradictorias

La revision de calidad no solo es gramatical; tambien debe validar coherencia documental.

## Resumen operativo

El flujo correcto del equipo es este:

1. crear o tomar una issue bien definida
2. asignar responsable
3. crear rama desde `develop`
4. trabajar en la rama
5. verificar checklist
6. abrir PR hacia `develop`
7. asignar un reviewer
8. mover tarjeta a `Review`
9. corregir observaciones si existen
10. hacer merge en `develop`
11. cerrar la issue vinculada
12. mover tarjeta a `Done`
13. integrar `develop` en `main` cuando corresponda

## Regla final

Si una decision, avance o correccion no quedo reflejada en el repositorio, para efectos del proyecto esa decision no existe oficialmente.
