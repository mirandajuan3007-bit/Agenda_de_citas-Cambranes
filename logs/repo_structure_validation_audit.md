# Validacion automatica de estructura del repositorio

## Resumen

| Indicador | Valor |
| --- | --- |
| RF documentados | 7 |
| Diagramas detectados | 7 |
| Diseños detectados | 2 |
| RF con prototipo | 6 |
| Errores | 2 |
| Warnings | 13 |
| Info | 1 |

## Cobertura por RF

| RF | Documento | Diagrama | Diseño | Prototipo |
| --- | --- | --- | --- | --- |
| RF-01 | si | si | si | si |
| RF-02 | si | si | no | si |
| RF-05 | si | si | no | no |
| RF-06 | si | si | no | si |
| RF-07 | si | si | no | si |
| RF-08 | si | si | si | si |
| RF-09 | si | si | no | si |

## Hallazgos

| Nivel | Codigo | Ruta | Mensaje |
| --- | --- | --- | --- |
| WARNING | missing-referenced-rf | docs\02_requirements\rf01_requirement_description.md | Se referencia RF-03, pero no existe su archivo en docs/02_requirements. |
| ERROR | missing-rf-title | docs\02_requirements\rf02_requirement_description.md | No se encontro un titulo principal con formato RF-##. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf05_requirement_description.md | Se referencia RF-03, pero no existe su archivo en docs/02_requirements. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf05_requirement_description.md | Se referencia RF-10, pero no existe su archivo en docs/02_requirements. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf05_requirement_description.md | Se referencia RF-11, pero no existe su archivo en docs/02_requirements. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf06_requirement_description.md | Se referencia RF-03, pero no existe su archivo en docs/02_requirements. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf06_requirement_description.md | Se referencia RF-04, pero no existe su archivo en docs/02_requirements. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf08_requirement_description.md | Se referencia RF-03, pero no existe su archivo en docs/02_requirements. |
| WARNING | missing-referenced-rf | docs\02_requirements\rf09_requirement_description.md | Se referencia RF-03, pero no existe su archivo en docs/02_requirements. |
| ERROR | bad-design-filename | docs\04_design\rf05.database_desing.md | El archivo no sigue el patron rf##_database_design.md. |
| WARNING | missing-design | docs\02_requirements\rf02_requirement_description.md | RF-02 no tiene diseño en docs/04_design. |
| INFO | missing-prototype | docs\02_requirements\rf05_requirement_description.md | RF-05 no tiene prototipo en /prototypes. |
| WARNING | missing-design | docs\02_requirements\rf05_requirement_description.md | RF-05 no tiene diseño en docs/04_design. |
| WARNING | missing-design | docs\02_requirements\rf06_requirement_description.md | RF-06 no tiene diseño en docs/04_design. |
| WARNING | missing-design | docs\02_requirements\rf07_requirement_description.md | RF-07 no tiene diseño en docs/04_design. |
| WARNING | missing-design | docs\02_requirements\rf09_requirement_description.md | RF-09 no tiene diseño en docs/04_design. |

## Reglas validadas

- Estructura base de carpetas del repositorio.
- Patron de nombres para requisitos: rf##_requirement_description.md.
- Patron de nombres para diagramas: rf##_flow_diagram.ext.
- Patron de nombres para diseños: rf##_database_design.md.
- Patron de nombres para prototipos: rf##_*.ext.
- Coincidencia entre el numero del archivo y el titulo RF del documento.
- Existencia de enlaces locales a diagramas y prototipos dentro de los requisitos.
- Cobertura minima entre requisito documentado, diagrama, diseño y prototipo.
