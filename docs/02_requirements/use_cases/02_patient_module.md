# Modulo Pacientes - Casos de Uso

Casos de uso relacionados con la gestion del expediente del paciente. Cubre los requisitos **RF-04** (generacion de ID unico) y **RF-05** (guardar datos y vincular historial).

## Actores

| Actor | Descripcion |
|---|---|
| **Secretaria** | Crea pacientes, los busca y revisa sus expedientes. |
| **Coordinador de la clinica** | Consulta historial de pacientes para seguimiento. |

## Casos de uso

- **Dar de alta paciente** — Captura datos basicos y genera el expediente. Aplica solo si el paciente no existe aun en el sistema.
  - *Asignar identificador unico* — Genera un folio inequivoco (`PAC-####`) al crear el paciente.
- **Buscar paciente** — Localiza pacientes por nombre completo o por folio.
- **Consultar historial de paciente** — Recupera todas las citas asociadas al expediente, en orden cronologico.
- **Listar pacientes** — Vista paginada o completa del directorio de pacientes.

## Diagrama (Mermaid)

```mermaid
flowchart LR
    Sec(["Secretaria"])
    Coord(["Coordinador<br/>de la clinica"])

    subgraph M_Pac["Modulo Pacientes"]
        UC_Alta(("«RF-05»<br/>Dar de alta<br/>paciente"))
        UC_Folio(("«RF-04»<br/>Asignar<br/>identificador<br/>unico"))
        UC_Buscar(("Buscar<br/>paciente"))
        UC_Hist(("«RF-05»<br/>Consultar<br/>historial"))
        UC_Listar(("Listar<br/>pacientes"))
    end

    Sec --- UC_Alta
    Sec --- UC_Buscar
    Sec --- UC_Hist
    Sec --- UC_Listar

    Coord --- UC_Hist
    Coord --- UC_Listar
    Coord --- UC_Buscar

    UC_Alta -.->|"«include»"| UC_Folio

    classDef actorStyle fill:#D6EAF8,stroke:#1F618D,stroke-width:2px
    classDef ucStyle fill:#FEF9E7,stroke:#B7950B,stroke-width:1px
    class Sec,Coord actorStyle
    class UC_Alta,UC_Folio,UC_Buscar,UC_Hist,UC_Listar ucStyle
```

## Reglas

1. **Identidad unica:** el folio se asigna una sola vez. En las citas subsecuentes se reutiliza siempre el mismo.
2. **Nombre normalizado:** se eliminan espacios al inicio y al final antes de guardar.
3. **Trazabilidad:** la creacion de un paciente queda registrada en el audit log automaticamente (via Observer).
4. **Sin duplicados:** el modulo Citas exige seleccionar al paciente desde la lista existente para citas de seguimiento.

## Trazabilidad con requisitos

| Caso de uso | RF | Endpoint backend |
|---|---|---|
| Dar de alta paciente | RF-05 | `POST /api/patients` |
| Asignar identificador unico | RF-04 | (interno en `PatientService.create`) |
| Buscar paciente | (apoyo a RF-01) | `GET /api/patients/search?q=...` |
| Consultar historial | RF-05 | `GET /api/patients/{id}/appointments` |
| Listar pacientes | (apoyo a RF-01) | `GET /api/patients` |
