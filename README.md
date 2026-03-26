# Modulo de Agenda

## Descripción

Este módulo forma parte de un sistema para la gestión de una clínica psicológica. Su responsabilidad es administrar la programación de citas entre pacientes y terapeutas.

## Objetivo

Gestionar las citas de manera eficiente, evitando conflictos de horario y garantizando la trazabilidad de cada sesión.

## Actores del sistema

* Secretaria
* Coordinador de la clínica

## Funcionalidades principales

* Registro de citas
* Visualización de agenda (calendario)
* Reagendamiento de citas
* Cancelación de citas

## Reglas de negocio clave

* Horario laboral: lunes a viernes, de 9:00 a 17:30
* No se permiten conflictos de horario entre terapeuta, sala o paciente
* Las citas no se eliminan, solo cambian de estado
* Cada terapeuta tiene una sala asignada
* Las citas se gestionan en estados trazables: programada, cancelada, reprogramada y finalizada

## Alcance del módulo

Este módulo gestiona únicamente la agenda de citas.
Otros aspectos como pagos, evaluación socioeconómica o expedientes no forman parte de este módulo.

## Documentación detallada

La documentación completa del módulo se encuentra en:
* `/docs/01_problem_definition`
* `/docs/02_requirements`
* `/docs/03_modeling`
* `/docs/04_design`

## Diagramas

Los diagramas del sistema (UML, flujos, etc.) se encuentran en el repositorio dentro de la carpeta `/docs/03_modeling`.

Los prototipos de interfaz del modulo se encuentran en la carpeta `/prototypes`.

## Automatizacion

El repositorio cuenta con un workflow de GitHub Actions en `.github/workflows/documentation-quality.yml`.

Este pipeline revisa automaticamente dos cosas en cada push o pull request hacia `develop` y `main`:

* sintaxis de los scripts Python del repositorio
* estructura documental del proyecto mediante `scripts/validate_repo_structure.py`

El workflow genera un reporte como artefacto para apoyar la revision del equipo. Actualmente funciona como validacion informativa, no como bloqueo estricto, para permitir corregir gradualmente la deuda documental existente.
