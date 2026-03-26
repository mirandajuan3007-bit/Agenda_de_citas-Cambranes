# Indice de documentacion del proyecto

## Proposito

Esta carpeta concentra la documentacion oficial del proyecto. Debe funcionar como la fuente unica de verdad del modulo de agenda. El contenido final del equipo debe vivir aqui y no en Google Docs u otras herramientas externas.

## Estructura oficial

### `01_problem_definition`

Contiene el contexto del sistema, alcance, actores, limitaciones y reglas generales del modulo.

Ejemplo de archivo clave:

- `system_context.md`

### `02_requirements`

Contiene los requisitos funcionales y, cuando aplique, los entregables documentales asociados a cada RF.

Convencion principal:

- `rf##_requirement_description.md`

Ejemplos actuales:

- `rf01_requirement_description.md`
- `rf02_requirement_description.md`
- `rf05_requirement_description.md`
- `rf06_requirement_description.md`
- `rf07_requirement_description.md`
- `rf08_requirement_description.md`
- `rf09_requirement_description.md`

### `03_modeling`

Contiene diagramas de flujo y artefactos de modelado vinculados a cada RF.

Convencion principal:

- `rf##_flow_diagram.ext`

### `04_design`

Contiene decisiones de diseño y diseño de base de datos vinculados a requisitos o procesos del modulo.

Convencion principal:

- `rf##_database_design.md`

### `05_final`

Espacio reservado para entregables finales o consolidaciones de cierre del proyecto.

## Regla de uso

- No crear archivos fuera de estas carpetas si ya existe una ruta oficial.
- No duplicar contenido del repo en Google Docs como version principal.
- Todo entregable debe estar vinculado a una issue, una rama y un PR.

## Flujo recomendado

1. Crear o tomar una issue bien definida.
2. Crear una rama desde `develop`.
3. Trabajar el entregable en la carpeta correcta.
4. Abrir PR hacia `develop` usando la plantilla del repo.
5. Asignar un solo reviewer principal.
6. Hacer merge y cerrar la issue.

## Criterio de completitud por entregable

### Requisito funcional

Debe incluir como minimo:

- descripcion clara
- relacion con otros requisitos
- logica de negocio
- diagrama de flujo cuando aplique
- evidencia o referencia visual cuando aplique

### Requisito no funcional

Debe incluir como minimo:

- objetivo del atributo de calidad
- forma de representacion en el sistema
- forma de medicion o verificacion
- evidencia esperada

### Diseño

Debe incluir como minimo:

- entidades o elementos de diseño relevantes
- consistencia con reglas del modulo
- nomenclatura correcta
- relacion con el RF correspondiente

## Artefactos de apoyo fuera de `docs`

- `prototypes/`: prototipos visuales del modulo
- `scripts/`: automatizaciones de seguimiento y validacion
- `logs/`: reportes generados del proyecto

## Gobernanza del repo

La organizacion del trabajo se refuerza con:

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/`
- `.github/CODEOWNERS`
- `CONTRIBUTING.md`

Estos archivos existen para que el repo sea una herramienta real de trabajo, con trazabilidad, revision clara y medicion del avance.