# Célula 1 — Integradora del ciclo V

> Documento maestro. Define qué es, qué hace, qué entrega y bajo qué reglas opera la Célula 1 dentro del proceso de validación del módulo de Agenda de Citas.

---

## 1. Identificación

| Campo | Valor |
|---|---|
| Célula | **Célula 1 — Integradora** |
| Ámbito | Validación integral del módulo de agenda |
| Ciclo | Ciclo V (verificación cruzada entre lado izquierdo y lado derecho) |
| Inicio de operaciones | 2026-05-07 |
| Repositorio | `Agenda_de_citas-Cambranes` |
| Carpeta de trabajo | `docs/05_final/celula_01_integradora/` |
| Documentos de apoyo | `docs/05_final/matriz_trazabilidad.md`, `docs/05_final/diseño_base_de_datos.md`, `docs/05_final/implementation_context.md`, `docs/05_final/hallazgo_de_las_celulas.md` |

---

## 2. Descripción

La Célula 1 es responsable de **coordinar la verificación general entre el diseño del proyecto y la implementación actual**. Su función principal es **consolidar la trazabilidad** entre requisitos, diseño, componentes implementados y evidencia de validación, siguiendo la lógica del ciclo V.

Esta célula **no valida sola todo el sistema**. En su lugar:

- Organiza los artefactos producidos por el lado izquierdo del ciclo V (requisitos, modelado, diseño).
- Compara esos artefactos con los productos del lado derecho (implementación, pruebas, evidencia operativa).
- Clasifica las diferencias detectadas por las demás células (Célula 2 funcional, Célula 3 técnica).
- Determina si existe **conformidad** entre lo diseñado y lo implementado.

Funciona como **integradora**: recibe insumos, verifica coherencia, decide y consolida.

---

## 3. Posición en el ciclo V

```
                         CÉLULA 1
                       (integradora)
                            │
            ┌───────────────┴───────────────┐
            │                               │
   Lado izquierdo (diseño)        Lado derecho (validación)
   ─────────────────────          ─────────────────────────
   01_problem_definition          backend/src/...
   02_requirements                backend/test/... (cuando exista)
   03_modeling                    Despliegue actual
   04_design                      Evidencia operativa
            │                               │
        Célula 3 ────────────────────── Célula 2
       (técnica/diseño)              (funcional/UI)
```

La Célula 1 **no opera sola**: depende de que las Células 2 y 3 le entreguen hallazgos verificados. Sin esos insumos, la matriz queda incompleta y el reporte final no puede emitirse con valor.

---

## 4. Responsabilidades

1. **Construir y mantener la matriz de trazabilidad del proyecto.**
   - Documento base: `docs/05_final/matriz_trazabilidad.md`.
   - Documento extendido (entregable 1 de esta célula): `02_matriz_trazabilidad_diseño_vs_implementacion.md`.
2. **Relacionar cada RF y RNF con su evidencia de implementación.**
   - Identificar archivo/clase/endpoint que cubre el requisito.
   - Identificar la evidencia de validación: prueba ejecutada, captura, log, etc.
3. **Consolidar los hallazgos reportados por las demás células.**
   - Recibir hallazgos de Célula 2 (funcional) y Célula 3 (técnica).
   - Normalizarlos en un formato común con ID, severidad, requisito afectado y estado.
4. **Clasificar diferencias entre diseño e implementación.**
   - Aplicar la taxonomía definida en `04_clasificacion_conformidad.md`.
5. **Definir el estado final de cada elemento.**
   - Cumple, cumple parcial o no cumple, con justificación trazable.
6. **Preparar el reporte final de conformidad del proyecto.**
   - Entregable 4: `05_reporte_final_validacion.md`.

---

## 5. Qué valida la Célula 1

| Dimensión | Qué se valida |
|---|---|
| Correspondencia | Cada RF y RNF documentado tiene implementación visible y viceversa. |
| Coherencia ciclo V | Los artefactos del lado izquierdo (req., modelado, diseño) tienen contraparte en el lado derecho (código, prueba, despliegue). |
| Suficiencia de evidencia | Cada afirmación de "implementado" tiene un archivo, endpoint, log o prueba que la respalda. |
| Hallazgos transversales | Discrepancias que afectan a más de un módulo o requisito. |
| Cierre documental | Renombrados, archivos faltantes, referencias cruzadas inconsistentes. |

---

## 6. Qué debe responder la Célula 1

Al final del proceso, esta célula debe poder responder, con evidencia, cada una de estas preguntas:

1. **¿Lo implementado corresponde a lo documentado en requisitos y diseño?**
2. **¿Qué partes cumplen totalmente?**
3. **¿Qué partes cumplen parcialmente?**
4. **¿Qué partes no cumplen?**
5. **¿Qué fue implementado sin estar documentado?** (cambio no documentado)
6. **¿Qué fue diseñado pero no implementado?** (deuda de implementación)

Las respuestas se sintetizan en el reporte final.

---

## 7. Insumos requeridos

La célula no puede operar sin estos insumos:

| Insumo | Origen | Estado actual (2026-05-07) |
|---|---|---|
| Matriz de trazabilidad base | `docs/05_final/matriz_trazabilidad.md` | ✅ Existe |
| Documentos de requisitos | `docs/02_requirements/` | ✅ 12 archivos (faltan RF-03, RF-04, RF-11, RNF-10, RNF-11) |
| Diagramas de modelado | `docs/03_modeling/` | ✅ 7 imágenes (faltan RF-03, RF-04, RF-11) |
| Diseños técnicos | `docs/04_design/` | ⚠️ 3 archivos (RF-05 mal nombrado) |
| Prototipos | `prototypes/` | ⚠️ 6 imágenes (faltan RF-03, RF-04, RF-05, RF-11) |
| Diseño BD final | `docs/05_final/diseño_base_de_datos.md` | ✅ Existe |
| Contexto de implementación | `docs/05_final/implementation_context.md` | ✅ Existe |
| Código backend | `backend/src/main/java/com/clinica/agenda/` | ✅ Existe |
| Migraciones BD | `backend/src/main/resources/db/migration/` | ✅ V1__schema.sql, V2__seed.sql |
| Hallazgos Célula 2 | `docs/05_final/hallazgo_de_las_celulas.md` | ❌ Vacío — pendiente |
| Hallazgos Célula 3 | `docs/05_final/hallazgo_de_las_celulas.md` | ❌ Vacío — pendiente |

> **Nota:** mientras los hallazgos de Células 2 y 3 estén pendientes, la Célula 1 puede avanzar en la matriz extendida y en la verificación documental, pero **no puede cerrar** la clasificación de conformidad.

---

## 8. Productos / Entregables

| # | Entregable | Archivo |
|---|---|---|
| 1 | Matriz de trazabilidad diseño vs implementación | `02_matriz_trazabilidad_diseño_vs_implementacion.md` |
| 2 | Lista consolidada de hallazgos | `03_lista_consolidada_hallazgos.md` |
| 3 | Clasificación de conformidad por requisito | `04_clasificacion_conformidad.md` |
| 4 | Reporte final de validación integral | `05_reporte_final_validacion.md` |

Documentos de apoyo (no entregables formales pero parte del proceso):

- `00_descripcion_celula_01.md` — este documento.
- `01_paso_a_paso.md` — guía operativa con el procedimiento detallado.
- `README.md` — índice navegable de la carpeta.

---

## 9. Reglas de operación

1. **No inferir lo que no está escrito.** Si un comportamiento no aparece en código *y* en documento, se reporta como hallazgo, no se asume.
2. **Toda afirmación de conformidad lleva evidencia.** Ruta de archivo + línea, captura, log o ID de prueba. Sin evidencia, el estado es 🔲 *Sin verificar*.
3. **No reescribir hallazgos de otras células.** La Célula 1 normaliza y consolida; no reinterpreta. Si necesita aclaración, la solicita formalmente a la célula origen.
4. **Estado por defecto: pesimista.** Si la evidencia es ambigua, el estado es ⚠️ *Cumple parcial* o ❌ *No cumple*, nunca ✅ *Cumple*.
5. **Trazabilidad bidireccional.** Cada hallazgo debe vincularse a uno o más requisitos y a uno o más artefactos de código.
6. **Versiones congeladas.** Cada entregable indica la fecha de corte (commit y rama) usado para validar. Si el código cambia después, se anota como nueva versión, no se silencia el cambio.
7. **El reporte final es el único que firma la célula.** Los entregables 1–3 son trabajo intermedio.

---

## 10. Criterios de aceptación de la célula (definition of done)

La Célula 1 considera su trabajo cerrado cuando:

- [ ] La matriz extendida (`02_matriz_trazabilidad_diseño_vs_implementacion.md`) tiene **0 filas** en estado 🔲 *Sin verificar*.
- [ ] Todas las discrepancias D-01 a D-04 (declaradas en `matriz_trazabilidad.md`) están resueltas o explícitamente aceptadas como deuda con justificación.
- [ ] Cada RF y RNF tiene un estado final: ✅ / ⚠️ / ❌ con evidencia.
- [ ] La lista consolidada de hallazgos está cerrada: cada hallazgo tiene severidad, dueño, y decisión (corregir / aceptar / postergar).
- [ ] El reporte final está firmado y fechado, con la rama y commit de referencia.
- [ ] El índice del directorio (`README.md`) está actualizado.

---

## 11. Glosario rápido

| Término | Significado dentro de este proyecto |
|---|---|
| RF | Requisito funcional. Comportamiento observable del sistema. |
| RNF | Requisito no funcional. Atributo de calidad del sistema. |
| Trazabilidad | Cadena de evidencia que une un requisito con su diseño, implementación y prueba. |
| Conformidad | Grado en que la implementación corresponde a lo diseñado/documentado. |
| Discrepancia | Diferencia detectada entre dos artefactos que deberían coincidir. |
| Hallazgo | Observación documentada por una célula durante su validación. |
| Cambio no documentado | Funcionalidad implementada que no aparece en requisitos/diseño. |
| Deuda de implementación | Funcionalidad diseñada que no aparece implementada. |

---

## 12. Referencias

- `docs/05_final/matriz_trazabilidad.md` — matriz base de trazabilidad.
- `docs/05_final/diseño_base_de_datos.md` — diseño técnico de BD.
- `docs/05_final/implementation_context.md` — contexto del módulo y reglas críticas.
- `docs/02_requirements/` — documentos de requisitos.
- `docs/03_modeling/` — diagramas de flujo.
- `docs/04_design/` — diseños técnicos por RF.
- `prototypes/` — prototipos visuales.
- `backend/src/main/java/com/clinica/agenda/` — implementación.
- `backend/src/main/resources/db/migration/V1__schema.sql` — esquema vigente.

---

> Este documento define el alcance y reglas. La operación detallada se describe en `01_paso_a_paso.md`.
