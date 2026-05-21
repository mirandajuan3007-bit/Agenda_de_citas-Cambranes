# Diagramas de Casos de Uso

Esta carpeta contiene los diagramas de casos de uso del modulo de agenda de la Clinica Psicologica Cambranes. Hay un **diagrama general** que da la vision completa y un **diagrama especifico por modulo** para profundizar en cada area funcional.

## Indice

| # | Diagrama | Proposito |
|---|---|---|
| 00 | [Diagrama general](./00_diagrama_general.md) | Vista completa: todos los actores y todos los casos de uso agrupados por modulo. |
| 01 | [Modulo Autenticacion](./01_modulo_autenticacion.md) | Inicio de sesion, cierre, restauracion. |
| 02 | [Modulo Pacientes](./02_modulo_pacientes.md) | Alta de pacientes, busqueda, consulta de historial. |
| 03 | [Modulo Citas](./03_modulo_citas.md) | Agendar, consultar, reprogramar, cancelar, finalizar y alerta de atraso. |
| 04 | [Modulo Catalogos](./04_modulo_catalogos.md) | Consulta de terapeutas, salas, tipos de sesion y estados. |

## Convenciones

- **Casos de uso nombrados como acciones** (verbo + objeto), no como referencias literales a los RF.
- **«include»** — el caso base siempre invoca al incluido.
- **«extend»** — el caso extensor se aplica solo bajo cierta condicion.
- **Generalizacion** (flecha de herencia) — un caso especializa a otro.

## Como ver los diagramas

- Los archivos `.md` incluyen un bloque Mermaid que GitHub renderiza automaticamente.
- Los archivos `.puml` son la fuente PlantUML; pueden renderizarse con:
  - VS Code + extension *PlantUML* → `Alt+D`.
  - CLI: `plantuml archivo.puml`.
  - Online: https://www.plantuml.com/plantuml/uml/.

## Trazabilidad con los requisitos

| Modulo | RF asociados |
|---|---|
| Autenticacion | (transversal, no asociado a un RF especifico) |
| Pacientes | RF-04, RF-05 |
| Citas | RF-01, RF-02, RF-03, RF-06, RF-07, RF-08, RF-09 |
| Catalogos | (transversal, apoya RF-01, RF-03, RF-08) |
