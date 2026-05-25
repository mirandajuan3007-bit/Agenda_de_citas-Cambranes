# Diagramas de Secuencia — Crear y Cancelar cita

---

## Explicación del modelo

### ¿Qué representa un diagrama de secuencia?

Mientras el **BPMN** muestra el **proceso** (qué actividades y decisiones ocurren), el diagrama de **secuencia** muestra la **interacción en el tiempo**: qué **participantes** colaboran, **qué mensajes** se envían entre ellos y **en qué orden**. Se lee de **arriba hacia abajo** (avance del tiempo) y de **izquierda a derecha** (participantes); el `autonumber` numera cada mensaje en su orden de ejecución.

### Participantes (componentes conceptuales del dominio)

No son clases ni capas de un framework, sino **responsabilidades del dominio**:

- **Secretaría** — actor que inicia la interacción.
- **Interfaz de Agenda** — la pantalla que captura datos y muestra resultados.
- **Gestión de Citas** — orquesta el caso de uso (coordina a los demás).
- **Validación de Disponibilidad** — aplica las reglas (Strategy + Cadena).
- **Cita / Estado de la Cita** — la entidad y su ciclo de vida (patrón State).
- **Historial del Paciente** — registro de citas del paciente.
- **Auditoría** — traza de la acción (patrón Observer).

### Cómo leer los mensajes

| Símbolo | Significado |
|---|---|
| `->>` flecha sólida | Solicitud / invocación de una operación de negocio |
| `-->>` flecha punteada | Respuesta / retorno de información |
| `break` | **Camino de excepción**: corta el intento actual e informa al usuario |
| `opt` | Paso opcional / condicional |
| `Note` | Aclaración de diseño (regla de negocio o patrón aplicado) |

### Relación con el BPMN

Es el **mismo comportamiento** visto con otra lente. El BPMN modela el **bucle de corrección** (reintento) como vista de proceso; la secuencia modela **un intento**: cada error es un `break` que detiene ese intento y se lo informa al usuario (quien luego puede reintentar). Las reglas (horario, solape, límite de 3, ciclo de vida, anticipación) y los patrones (Strategy/Cadena, State, Observer) son los mismos en ambas vistas.

---

## 1. Secuencia: Agendar cita (RF-01 · RF-02 · RF-03 · RF-05)

```mermaid
sequenceDiagram
    autonumber
    actor Sec as Secretaría
    participant UI as Interfaz de Agenda
    participant GC as Gestión de Citas
    participant VAL as Validación de Disponibilidad
    participant CITA as Cita
    participant EST as Estado de la Cita
    participant HIST as Historial del Paciente
    participant AUD as Auditoría

    Sec->>UI: Captura la cita y revisa el resumen previo (RF-02)
    UI->>GC: Solicitar registro de la cita

    break Datos requeridos incompletos o inválidos
        GC-->>UI: Indicar datos faltantes / a corregir
        UI-->>Sec: Resaltar campos a corregir
    end

    GC->>GC: Verificar recursos y regla de sala fija
    break La sala no corresponde al terapeuta
        GC-->>UI: Rechazo: sala no válida para ese terapeuta
        UI-->>Sec: Mostrar mensaje
    end

    GC->>VAL: Validar disponibilidad
    Note over VAL: Strategy + Cadena → 1) horario laboral · 2) solape<br/>terapeuta/sala/paciente · 3) máx. 3 citas activas (RF-03)
    VAL-->>GC: Resultado (conflictos encontrados)

    break Conflicto de disponibilidad
        GC-->>UI: Rechazo con detalle del conflicto
        UI-->>Sec: Mostrar horario/solape/límite en conflicto
    end

    GC->>CITA: Crear cita
    CITA->>EST: Fijar estado inicial 'Programada'
    Note over CITA,EST: Patrón State: 'Programada' es el único estado<br/>de partida; las citas no se borran
    GC->>HIST: Registrar la cita en el historial del paciente (RF-05)
    GC->>AUD: Registrar acción 'crear cita'
    Note over AUD: Patrón Observer: la auditoría reacciona al evento,<br/>la gestión de citas no la invoca directamente
    GC-->>UI: Cita registrada
    UI-->>Sec: "Cita registrada correctamente"
```

> **Consistencia (RNF-01):** el diseño exige que el registro sea **íntegro** — si alguna regla falla, no debe quedar una cita registrada a medias ni reflejada en la agenda.

### Lectura paso a paso (Agendar)

1. La secretaría **captura la cita y revisa el resumen** (RF-02); la interfaz **solicita el registro** a Gestión de Citas.
2. Si los **datos están incompletos o son inválidos** → `break`: se devuelven los campos a corregir y se resaltan en pantalla.
3. Gestión de Citas **verifica los recursos y la regla de sala fija**; si la **sala no corresponde** al terapeuta → `break`.
4. Pide a **Validación de Disponibilidad** evaluar las reglas (horario laboral, solape de terapeuta/sala/paciente, máximo 3 citas); si hay **conflicto** → `break` con el detalle del conflicto.
5. **Camino feliz:** crea la **Cita**, **fija su estado inicial "Programada"** (State), la **registra en el Historial** (RF-05) y la **Auditoría** reacciona al evento (Observer); finalmente la interfaz **confirma** a la secretaría.

---

## 2. Secuencia: Cancelar cita (RF-09)

```mermaid
sequenceDiagram
    autonumber
    actor Sec as Secretaría
    participant UI as Interfaz de Agenda
    participant GC as Gestión de Citas
    participant CITA as Cita
    participant EST as Estado de la Cita
    participant AUD as Auditoría

    Sec->>UI: Selecciona la cita, ingresa el motivo y confirma
    UI->>GC: Solicitar cancelación de la cita
    GC->>CITA: Localizar la cita

    break La cita no existe
        GC-->>UI: Rechazo: cita no encontrada
        UI-->>Sec: Mostrar mensaje
    end

    GC->>EST: ¿El estado permite cancelar?
    Note over EST: Patrón State: solo 'Programada' admite cancelación;<br/>'Cancelada' / 'Finalizada' / 'Reprogramada' la rechazan
    break Estado actual no permite cancelar
        EST-->>GC: Transición no permitida
        GC-->>UI: Rechazo: el estado no permite cancelación
        UI-->>Sec: Mostrar mensaje
    end

    GC->>GC: ¿Se cancela antes de la hora de inicio?
    break Cancelación tardía (la cita ya inició) — RF-09 regla 1
        GC-->>UI: Rechazo: no se puede cancelar una cita que ya inició
        UI-->>Sec: Mostrar mensaje
    end

    GC->>CITA: Cambiar estado a 'Cancelada'; registrar motivo, fecha y usuario
    GC->>GC: Liberar el horario (queda disponible)
    GC->>AUD: Registrar acción 'cancelar cita'
    GC-->>UI: Cita cancelada
    UI-->>Sec: "La cancelación se realizó correctamente"
```

> **Trazabilidad (diseño):** cancelar **no borra** la cita; solo cambia su estado a *Cancelada* y registra motivo, fecha y usuario responsable (RF-09 + regla de trazabilidad).

### Lectura paso a paso (Cancelar)

1. La secretaría **selecciona la cita, ingresa el motivo y confirma**; Gestión de Citas **localiza la cita**.
2. Si la **cita no existe** → `break`.
3. Consulta el **Estado de la Cita**: solo *"Programada"* admite cancelación; si está en estado **terminal** (Cancelada/Finalizada/Reprogramada) → `break`.
4. Verifica la **anticipación**: si la cita **ya inició** → `break` (RF-09 regla 1).
5. **Camino feliz:** cambia el estado a **"Cancelada"** con **motivo, fecha y usuario**, **libera el horario**, **registra en Auditoría** y **confirma** la cancelación a la secretaría.

---

## 3. Notas de coherencia con el diseño

- **Operaciones del dominio** usadas (diagrama de clases): `Appointment.schedule()` (crear como *Programada*), `Appointment.cancel(motivo, usuario)`, `Appointment.validateNoOverlap()`; `Patient.canScheduleNewAppointment()` (regla de las 3 citas).
- **Patrones de diseño** representados conceptualmente: *Strategy + Cadena de responsabilidad* en la validación de disponibilidad (orden horario → solape → límite), *State* en el ciclo de vida de la cita, *Observer* en la auditoría.
- **Reprogramar (RF-08)** sigue la misma estructura que *Agendar*: validar disponibilidad → archivar la cita original como **Reprogramada** (no *Cancelada*) → crear una nueva cita que hereda paciente, terapeuta y sala. Puede añadirse como tercera secuencia.
  - **Advertencia de coherencia:** el diagrama de flujo `rf08_flow_diagram.png` actual marca la original como *"Cancelada"* y cambia el estado antes de crear la nueva: **contradice el diseño** (RF-08 exige *Reprogramada* y atomicidad). Debe corregirse para mantener la coherencia.
- **Sin elementos de fases posteriores:** estos diagramas no mencionan endpoints, códigos de respuesta, base de datos, framework ni mecánicas de implementación; describen el comportamiento de diseño que la fase de construcción deberá respetar.
