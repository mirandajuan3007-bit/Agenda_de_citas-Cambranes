# Índice de documentación del proyecto

## Propósito

Esta carpeta concentra la documentación oficial del proyecto. Debe funcionar como la fuente única de verdad del módulo de agenda. El contenido final del equipo debe vivir aquí y no en Google Docs u otras herramientas externas.

## Estructura oficial

### `01_problem_definition`

Contiene el contexto del sistema, alcance, actores, limitaciones y reglas generales del módulo.

Ejemplo de archivo clave:

- `system_context.md`

### `02_requirements`

Contiene los requisitos funcionales y, cuando aplique, los entregables documentales asociados a cada RF.

Convención principal:

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

Convención principal:

- `rf##_flow_diagram.ext`

### `04_design`

Contiene decisiones de diseño y diseño de base de datos vinculados a requisitos o procesos del módulo.

Convención principal:

- `rf##_database_design.md`

### `05_final`

Espacio reservado para entregables finales o consolidaciones de cierre del proyecto.

## Stack tecnológico

### Sistema anterior de referencia

El sistema de gestión de la clínica fue desarrollado previamente con:

- **Backend:** Java con Spring Boot.
- **Base de datos:** MySQL.
- **Frontend:** no especificado.

Este sistema funciona como punto de partida del dominio. Sus entidades, reglas de negocio y procesos sirven como base conceptual para el desarrollo del módulo de agenda.

### Módulo actual: prototipo funcional

El prototipo funcional del módulo de agenda fue construido con el siguiente stack:

| Capa | Tecnología | Notas |
|---|---|---|
| Interfaz de usuario | React 18 + TypeScript 5 | SPA, es decir, una aplicación de una sola página |
| Bundler / build | Vite 5 | Reemplazo moderno de Create React App |
| Estado global | React Context API + useReducer | Suficiente para el alcance actual del módulo |
| Persistencia del prototipo | localStorage del navegador | Solo para demostración; no representa persistencia real |
| Estilos | CSS puro en `globals.css` | Sin framework de UI externo |
| Lenguaje | TypeScript en modo estricto | Tipado completo del dominio |

El uso de `localStorage` permite simular la persistencia durante la demostración del prototipo, pero no debe considerarse una solución final para producción.

### Stack recomendado para producción

Tomando como base el sistema anterior y el prototipo actual, el stack recomendado para una versión de producción es el siguiente:

| Capa | Tecnología recomendada | Justificación |
|---|---|---|
| Frontend | React 18 + TypeScript | Ya fue construido en el prototipo; mantenerlo evita retrabajo |
| Backend | Java con Spring Boot | Da continuidad al sistema anterior de la clínica |
| Base de datos | MySQL | Ya fue usado en el sistema anterior y mantiene consistencia tecnológica |
| Autenticación | Spring Security + JWT | Se integra de forma natural con Spring Boot |
| ORM | Hibernate / JPA | Es una opción estándar dentro del ecosistema Spring |
| API | REST con JSON | El frontend puede consumir datos en este formato |
| Contenedor | Docker | Facilita el despliegue y la consistencia entre entornos |

### Consideraciones para migrar el prototipo a producción

La migración del prototipo funcional a una versión de producción implica principalmente:

1. Reemplazar las llamadas a `localStorage` por llamadas HTTP hacia una API REST del backend.
2. Implementar autenticación real con JWT en lugar de un login basado en comparación de texto plano.
3. Migrar la información del prototipo hacia MySQL, siguiendo el diseño definido en `docs/04_design/`.
4. Conectar el frontend actual con los servicios del backend.
5. Validar que las reglas de negocio del módulo de agenda coincidan con las reglas del sistema de gestión de la clínica.

## Regla de uso

- No crear archivos fuera de estas carpetas si ya existe una ruta oficial.
- No duplicar contenido del repositorio en Google Docs como versión principal.
- Todo entregable debe estar vinculado a una issue, una rama y un PR.

## Flujo recomendado

1. Crear o tomar una issue bien definida.
2. Crear una rama desde `develop`.
3. Trabajar el entregable en la carpeta correcta.
4. Abrir PR hacia `develop` usando la plantilla del repositorio.
5. Asignar un solo reviewer principal.
6. Hacer merge y cerrar la issue.

## Criterio de completitud por entregable

### Requisito funcional

Debe incluir como mínimo:

- Descripción clara.
- Relación con otros requisitos.
- Lógica de negocio.
- Diagrama de flujo cuando aplique.
- Evidencia o referencia visual cuando aplique.

### Requisito no funcional

Debe incluir como mínimo:

- Objetivo del atributo de calidad.
- Forma de representación en el sistema.
- Forma de medición o verificación.
- Evidencia esperada.

### Diseño

Debe incluir como mínimo:

- Entidades o elementos de diseño relevantes.
- Consistencia con las reglas del módulo.
- Nomenclatura correcta.
- Relación con el RF correspondiente.

## Artefactos de apoyo fuera de `docs`

- `prototypes/`: prototipos visuales del módulo.
- `scripts/`: automatizaciones de seguimiento y validación.
- `logs/`: reportes generados del proyecto.
- `docker/`: configuración de contenedores (`docker-compose.yml`).

## Documentación complementaria en `docs/`

- `COMO_CORRER.md`: instrucciones para levantar el proyecto localmente.
- `CONTRIBUTING.md`: guía de contribución al repositorio.
- `PATRONES_DE_DISEÑO.md`: patrones de diseño aplicados en el proyecto.

## Gobernanza del repositorio

La organización del trabajo se refuerza con:

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/`
- `.github/CODEOWNERS`
- `docs/CONTRIBUTING.md`

Estos archivos existen para que el repositorio funcione como una herramienta real de trabajo, con trazabilidad, revisión clara y medición del avance.