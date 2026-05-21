# Diagrama General de Casos de Uso

Vision completa del modulo: actores, modulos y casos de uso de alto nivel. Para el detalle de cada modulo ver los diagramas especificos:

- [Modulo Autenticacion](./01_modulo_autenticacion.md)
- [Modulo Pacientes](./02_modulo_pacientes.md)
- [Modulo Citas](./03_modulo_citas.md)
- [Modulo Catalogos](./04_modulo_catalogos.md)

## Actores

| Actor | Descripcion |
|---|---|
| **Secretaria** | Personal administrativo. Unico actor con capacidad de escritura: registra, reprograma, cancela y consulta citas y pacientes. |
| **Coordinador de la clinica** | Supervisa la operacion. Consulta agenda y catalogos con fines de control y seguimiento. |

> El paciente y el terapeuta **no son actores del sistema** — el modulo es de uso exclusivamente administrativo.

## Diagrama (Mermaid)

```mermaid
flowchart LR
    Sec(["Secretaria"])
    Coord(["Coordinador<br/>de la clinica"])

    subgraph SUT["Sistema de Agenda"]
        subgraph M_Auth["Modulo Autenticacion"]
            UC_Login(("Iniciar<br/>sesion"))
            UC_Logout(("Cerrar<br/>sesion"))
        end

        subgraph M_Pac["Modulo Pacientes"]
            UC_AltaP(("«RF-05»<br/>Dar de alta<br/>paciente"))
            UC_BuscarP(("Buscar<br/>paciente"))
            UC_HistP(("«RF-05»<br/>Consultar<br/>historial<br/>de paciente"))
        end

        subgraph M_Cit["Modulo Citas"]
            UC_Agendar(("«RF-01»<br/>Agendar cita"))
            UC_Consultar(("«RF-06»<br/>Consultar<br/>agenda"))
            UC_Reprog(("«RF-08»<br/>Reprogramar<br/>cita"))
            UC_Cancel(("«RF-09»<br/>Cancelar<br/>cita"))
            UC_Final(("Marcar como<br/>finalizada"))
            UC_Atras(("«RF-07»<br/>Resaltar citas<br/>atrasadas"))
        end

        subgraph M_Cat["Modulo Catalogos"]
            UC_Cat(("Consultar<br/>catalogos"))
        end
    end

    Sec --- UC_Login
    Sec --- UC_Logout
    Sec --- UC_AltaP
    Sec --- UC_BuscarP
    Sec --- UC_HistP
    Sec --- UC_Agendar
    Sec --- UC_Consultar
    Sec --- UC_Reprog
    Sec --- UC_Cancel
    Sec --- UC_Final
    Sec --- UC_Cat

    Coord --- UC_Login
    Coord --- UC_Logout
    Coord --- UC_Consultar
    Coord --- UC_HistP
    Coord --- UC_Cat

    UC_Atras -.->|"«extend»"| UC_Consultar
    UC_Agendar -.->|"«include»"| UC_Cat
    UC_Reprog -.->|"«include»"| UC_Consultar

    classDef actorStyle fill:#D6EAF8,stroke:#1F618D,stroke-width:2px
    classDef ucStyle fill:#FEF9E7,stroke:#B7950B,stroke-width:1px
    class Sec,Coord actorStyle
    class UC_Login,UC_Logout,UC_AltaP,UC_BuscarP,UC_HistP,UC_Agendar,UC_Consultar,UC_Reprog,UC_Cancel,UC_Final,UC_Atras,UC_Cat ucStyle
```

## Resumen de casos de uso por modulo

### Modulo Autenticacion
- **Iniciar sesion** — Acceder al sistema con credenciales validas.
- **Cerrar sesion** — Terminar la sesion activa.

### Modulo Pacientes
- **Dar de alta paciente** — Crear el expediente y asignar un identificador unico.
- **Buscar paciente** — Localizar pacientes por nombre o folio.
- **Consultar historial de paciente** — Ver las citas asociadas al expediente.

### Modulo Citas
- **Agendar cita** — Registrar una cita (evaluacion inicial o sesion terapeutica).
- **Consultar agenda** — Visualizar las citas en formato calendario o listado.
- **Reprogramar cita** — Cambiar fecha u hora preservando trazabilidad.
- **Cancelar cita** — Marcar como cancelada y liberar recursos.
- **Marcar como finalizada** — Cerrar la cita una vez atendida.
- **Resaltar citas atrasadas** *(extension visual)* — Alerta cuando la hora actual supero el inicio de una cita programada.

### Modulo Catalogos
- **Consultar catalogos** — Obtener terapeutas, salas, tipos de sesion y estados disponibles para los demas modulos.

## Reglas transversales

1. **Trazabilidad:** ninguna cita se elimina; los cambios siempre quedan reflejados como nuevos estados.
2. **Horario laboral fijo:** lunes a viernes, 09:00 a 17:30.
3. **Validacion centralizada:** toda operacion de escritura sobre citas pasa por la cadena de validacion del backend.
4. **Acceso administrativo:** solo personal administrativo interactua con el sistema.
