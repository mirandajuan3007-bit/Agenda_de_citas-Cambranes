# ADR-001 — Arquitectura objetivo del módulo de agenda

---

## Contexto

La documentación del proyecto describía **dos arquitecturas distintas sin reconciliarlas**, lo que generaba incoherencia para cualquier lector:

- **Artefactos de diseño** (`docs/01_problem_definition/system_context.md`, `docs/05_final/database_design.md`, `docs/05_final/module_architecture.md`) describen un sistema **web cliente-servidor**: frontend, **API de backend** y **base de datos relacional** (8 tablas, FKs, índices, `audit_logs`).
- **Documentos de validación** (`docs/06_technical_validation/`, `docs/05_final/traceability matrix.md`) reportan que lo evaluado fue un **prototipo *frontend-only* con `localStorage`, sin backend ni base de datos** (hallazgo H-01, severidad crítica).

Esta ambigüedad impedía saber cuál es "el diseño de referencia".

## Decisión

La **arquitectura objetivo de diseño** del módulo de agenda es **cliente-servidor de pila completa**:

1. **Frontend web** para el personal administrativo (secretaría / coordinador).
2. **API de backend** que concentra la lógica de negocio y la validación de disponibilidad (fuente de verdad).
3. **Base de datos relacional** con el modelo descrito en `database_design.md` y el modelo entidad-relación (`description_entity-relationship_model.md`), incluyendo trazabilidad vía `audit_logs` y la regla de **no borrado físico**.

El **prototipo con `localStorage`** se considera una **implementación interina** (demo de cliente) usada para validación funcional temprana; **no representa la arquitectura de diseño** y no debe tomarse como referencia de diseño.

## Consecuencias

- Al leer la documentación, **el diseño de referencia es la arquitectura de pila completa**. Los reportes de validación técnica/funcional deben leerse como evaluación de una **implementación interina**, no del diseño.
- Los atributos de calidad que dependen de backend/BD (RNF-01 integridad transaccional, RNF-04 observabilidad y respaldo) **solo son satisfacibles** sobre la arquitectura objetivo; sobre el prototipo `localStorage` quedan como deuda, según ya señala la validación.
- Cualquier documento futuro debe alinearse a esta arquitectura objetivo o declarar explícitamente que describe la implementación interina.

## Alternativas consideradas

- **Declarar el `localStorage` como arquitectura oficial:** descartada; contradice `system_context`, el diseño de BD y los RNF de integridad/observabilidad, y no escala a multiusuario.
- **Dejar ambas sin decisión:** descartada; es justamente la incoherencia que este ADR resuelve.
