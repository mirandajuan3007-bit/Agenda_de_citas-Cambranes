# Resumen consolidado de avances del proyecto

Este documento concentra, por rango de fechas, las tareas realizadas en cada semana y la contribución que dichas tareas aportaron al avance global del proyecto **Agenda de Citas - Cambranes**. La información se obtuvo a partir de las bitácoras semanales (`weekly_report_*.md`) disponibles en la carpeta `logs/`.

---

## 1. Semana del 2026-03-16 al 2026-03-24

### Tareas realizadas

- **#25 — Definir problema, alcance y limitaciones del sistema** (Cesar Dzul)
- **#2 — RF-08. Reprogramar una cita** (Cesar Dzul)
- **#1 — RF-06. Consultar detalles de una cita** (Jorge Del Apa)
- **#12 — RNF-01. Usabilidad y Diseño Coherente** (sin asignado)
- **#10 — RF-09. Cancelar Citas con Anticipación y Actualizar la Agenda** (danicauich3)
- **#8 — RF-05. Guardar Datos del Paciente e Historial de Citas** (Fredi Abio)
- **#7 — RF-01. Creación de cita** (Juan Hernández Miranda)

### Pull Requests fusionados

- #26 Definición del contexto + alcance
- #24 Agrega RF-09 cancelar citas con flujo y prototipo
- #23 Requisito funcional número 06 - consultar cita
- #19 Feature/reprogramar una cita
- #18 Documentación/reprogramar una cita
- #17 Creación de citas, documentación

### Contribución al avance del proyecto

- Se estableció el **contexto, alcance y limitaciones** del sistema, sentando la base conceptual del proyecto.
- Se cerraron **7 issues** y se fusionaron **6 PRs**, llevando al proyecto de 0 a **24.1 % de issues cerradas (7/29)**.
- Se documentaron los primeros 5 requisitos funcionales (RF-01, RF-05, RF-06, RF-08, RF-09), alcanzando **45.5 % de RF cerrados** y **63.6 % de RF con documento y diagrama**.
- Se generaron los primeros prototipos en la carpeta `/prototypes` (6 prototipos detectados al cierre del rango).

---

## 2. Semana del 2026-04-13 al 2026-04-16

### Tareas realizadas

- No se cerraron issues directamente, pero se completó documentación de varios RNF mediante PRs.

### Pull Requests fusionados

- #54 feat(rf-04): documentar generación automática de ID de paciente (Fredi Abio)
- #53 Se agregó el RNF-08 Claridad y organización de formularios (Jorge Del Apa)
- #52 Documentación del requisito no funcional (Juan Hernández Miranda)
- #51 Agrega documentación del RNF-03 (danicauich3)
- #50 Agrega documentación del RNF-01 (danicauich3)
- #49 Feature/flujo simplificado onboarding operativo (Cesar Dzul)

### Contribución al avance del proyecto

- Semana enfocada en **documentación de Requisitos No Funcionales (RNF)**: RNF-01, RNF-03, RNF-07 (onboarding operativo) y RNF-08.
- Se cerraron RF-02 y RF-07, elevando los **RF cerrados a 7/11 (63.6 %)** y los **RNF cerrados a 5/12 (41.7 %)**.
- El total de issues cerradas pasó a **13/29 (44.8 %)**, prácticamente duplicando el porcentaje anterior.
- Se consolidó el avance documental antes de iniciar etapas de diseño técnico y modelado.

---

## 3. Semana del 2026-04-17 al 2026-04-23

### Tareas realizadas

- **#58 — Diseño de Base de Datos** (Juan Hernández Miranda) — 932 líneas cambiadas, 2 commits útiles.
- **#40 — RNF-10. Adaptación a escritorio y zoom** (Cesar Dzul) — 110 líneas cambiadas, 2 commits útiles.

### Pull Requests fusionados

- #60 Contexto IA (Juan Hernández Miranda)
- #59 Feature/adaptación a escritorio y zoom (Cesar Dzul)

### Ponderación semanal por integrante

| Integrante | % de avance semanal | Commits útiles | Líneas cambiadas | Issues cerradas | PRs fusionados |
| --- | --- | --- | --- | --- | --- |
| Juan Hernández Miranda | 69.7% | 2 | 932 | 1 | 1 |
| Cesar Dzul | 30.3% | 2 | 110 | 1 | 1 |

### Contribución al avance del proyecto

- Se incorporó el **diseño de la Base de Datos**, un hito clave que habilita la etapa de implementación.
- Se añadió el **contexto IA** del proyecto para apoyar la generación y trazabilidad asistida.
- Se cerró el **RNF-10 (Adaptación a escritorio y zoom)**, mejorando la usabilidad del sistema en distintos entornos visuales.
- El proyecto alcanzó **100 % de issues cerradas (36/36)** y **100 % de RF/RNF cerrados** según la bitácora, lo que marca el fin de la fase de definición y documentación.
- Aparecen nuevas carpetas de evidencia: `docs/06_pruebas_funcionales` (6 pruebas) y `docs/06_validation` (4 validaciones).

---

## 4. Semana del 2026-04-24 al 2026-04-30

### Tareas realizadas

- **#3 — RF-03. Validar disponibilidad de recursos** (isaias-0608)
- Apertura de 3 nuevas issues orientadas a validación:
  - #69 Validación técnica, componentes y pruebas unitarias (Cesar Dzul, danicauich3)
  - #68 Validación funcional y pruebas de sistema/aceptación (isaias-0608, Jorge Del Apa)
  - #67 Trazabilidad y validación integral diseño vs implementación (Juan Hernández Miranda)

### Pull Requests fusionados

- #66 Feature/RF-03 validar disponibilidad de recursos (isaias-0608)

### Contribución al avance del proyecto

- Se cerró el **RF-03 (Validar disponibilidad de recursos)**, el cual venía pendiente de implementación desde semanas anteriores.
- Se **organizó la fase de validación integral** del sistema mediante la apertura de 3 issues troncales (#67, #68, #69) que dividen el trabajo en validación técnica, funcional y de trazabilidad.
- La semana funcionó como **transición** entre la documentación y el inicio formal de pruebas/validación del sistema.

---

## 5. Semana del 2026-05-01 al 2026-05-09

### Tareas realizadas

- **#71 / #70 — Diagrama de Clases** (Fredi Abio)
- Validación técnica, componentes y pruebas unitarias (Cesar Dzul)
- Validación funcional y pruebas de sistema/aceptación (Jorge Del Apa)
- Documentación de trazabilidad y validación (Juan Hernández Miranda)
- Diagrama MER (Modelo Entidad-Relación) (Cesar Dzul)

### Pull Requests fusionados

- #76 Documentación de trazabilidad y validación (Juan Hernández Miranda)
- #75 Feature/validación técnica (Cesar Dzul)
- #74 Validación funcional y pruebas de sistema y aceptación (Jorge Del Apa)
- #73 Diagrama MER y descripción correspondiente (Cesar Dzul)
- #72 feat: agregar diagrama de clases, fuente PUML y documentación (Fredi Abio)

### Contribución al avance del proyecto

- Semana de **cierre de modelado y validación**: se entregaron los artefactos finales de ingeniería del software:
  - **Diagrama de Clases** (con fuente PUML).
  - **Diagrama MER (Modelo Entidad-Relación)**.
  - **Validación técnica** con pruebas unitarias y de componentes.
  - **Validación funcional** con pruebas de sistema y aceptación.
  - **Trazabilidad** diseño-vs-implementación.
- El proyecto alcanzó la cobertura máxima en sus indicadores:
  - **RF con documento: 11/11 (100 %)**
  - **RF con diagrama: 11/11 (100 %)**
  - **RF con diseño: 11/11 (100 %)**
- Con esto, todos los Requisitos Funcionales cuentan con documento, diagrama y diseño asociado, dejando al proyecto en condiciones de pasar a la fase final de entrega e implementación operativa.

---

## 6. Semana del 2026-05-10 al 2026-05-14

### Tareas realizadas (Pull Requests fusionados en la semana)

- **PR #83 — Feature/diseño verificación** (danicauich3): mejoras de diseño y verificación visual integradas a la rama principal.
- **PR #81 — Feat/weekly report** (Cesar Dzul): script `generate_weekly_report` y generación de los reportes semanales y del resumen consolidado de avances.
- **PR #78 — Reorganización/estructura archivos y actualización del README** (Fredi Abio): nueva estructura de carpetas del repositorio y README actualizado.
- **PR #77 — La versión última del proyecto, con código listo para correr** (Juan Hernández Miranda): integración del código ejecutable del proyecto.

### Ponderación semanal por integrante

| Integrante | % de avance semanal | Commits útiles | Líneas cambiadas | PRs fusionados | Actividad destacada |
| --- | --- | --- | --- | --- | --- |
| Juan Hernández Miranda | 41.4 % | 1 | 4238 | 1 | PR #77 La versión última del proyecto, con código listo para correr |
| Cesar Dzul | 24.7 % | 2 | 472 | 1 | PR #81 Feat/weekly report (script de bitácora semanal y resumen consolidado) |
| Fredi Abio | 8.4 % | 2 | 128 | 1 | PR #78 Reorganización/estructura archivos y actualización del README |
| danicauich3 | 6.2 % | 0 | 0 | 1 | PR #83 Feature/diseño verificación |

> Nota: solo se consideran como actividad de la semana los pull requests fusionados en el rango. Los cierres de issues que arrastraban trabajo de semanas anteriores quedan reflejados en sus respectivos resúmenes previos.

### Contribución al avance del proyecto

- Semana de **integración final del código y reorganización del repositorio**:
  - Juan Hernández Miranda integró la **versión última del proyecto lista para correr** (PR #77), aportando el grueso de líneas cambiadas en la semana.
  - Fredi Abio reorganizó la **estructura de carpetas** y actualizó el README para reflejar el nuevo orden del repositorio (PR #78).
  - Cesar Dzul incorporó el script `generate_weekly_report` y generó los **reportes semanales** y este **resumen consolidado** (PR #81).
  - danicauich3 sumó mejoras de **diseño y verificación** (PR #83).
- El proyecto cierra la semana en **100 % de cobertura**:
  - **Issues cerradas: 39/39 (100 %)**.
  - **RF con documento, diagrama y diseño: 11/11 (100 %)** cada uno.
  - **RNF cerrados: 12/12 (100 %)**.
- La semana cierra con el proyecto en estado **operativo, ejecutable y completamente documentado**, con código integrado, estructura del repositorio reorganizada y un sistema de bitácoras semanales automatizado.

---

## Visión general del progreso acumulado

| Periodo | Issues cerradas (acumulado) | RF cerrados | RNF cerrados | RF con diseño | Hito principal |
| --- | --- | --- | --- | --- | --- |
| 16 – 24 mar 2026 | 7/29 (24.1 %) | 5/11 | 1/12 | 3/11 | Definición de alcance y primeros RF documentados |
| 13 – 16 abr 2026 | 13/29 (44.8 %) | 7/11 | 5/12 | 3/11 | Cierre documental de RNF |
| 17 – 23 abr 2026 | 36/36 (100 %) | 11/11 | 12/12 | 3/11 | Diseño de Base de Datos y contexto IA |
| 24 – 30 abr 2026 | 36/36 (100 %) | 11/11 | 12/12 | 3/11 | Apertura del frente de validación integral |
| 01 – 09 may 2026 | 36/36 (100 %) | 11/11 | 12/12 | 11/11 | Diagrama de clases, MER y validación completa |
| 10 – 14 may 2026 | 39/39 (100 %) | 11/11 | 12/12 | 11/11 | Integración de la versión ejecutable, reorganización del repo y bitácoras automatizadas |

El proyecto evolucionó de manera ordenada desde la **definición conceptual** (marzo), pasó por la **documentación funcional y no funcional** (abril temprano), continuó con el **modelado de datos y diseño técnico** (abril medio), abrió el **frente de validación** (abril final), cerró con la **entrega de todos los artefactos de diseño y validación** (inicios de mayo) y culminó la primera quincena de mayo con la **integración del código ejecutable, la reorganización del repositorio y la automatización de los reportes semanales**, alcanzando el 100 % de cobertura en todos los indicadores del proyecto.
