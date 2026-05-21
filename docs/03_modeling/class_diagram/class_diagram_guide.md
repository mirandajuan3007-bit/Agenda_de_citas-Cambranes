# Guía del Diagrama de Clases — Agenda de Citas
## Clínica Psicológica Cambranes

> **Para quién es esta guía:** Si es la primera vez que abres este proyecto y quieres entender cómo está organizado el sistema sin necesidad de leer código ni base de datos, este es tu punto de partida.

---

## ¿De qué trata el sistema?

Este sistema es una **agenda digital para una clínica psicológica**. Su propósito es reemplazar agendas físicas o Excel para que el personal administrativo (secretarias, coordinadores) pueda:

- Registrar pacientes y agendar sus citas
- Asignar terapeutas y consultorios disponibles
- Cancelar o reprogramar citas cuando sea necesario
- Tener un historial completo de todo lo que ocurrió

El sistema **no es una app para pacientes**. Los pacientes no inician sesión ni interactúan con él directamente — solo el personal de la clínica lo opera.

---

## ¿Qué es un diagrama de clases y por qué existe este?

Un **diagrama de clases** es un mapa visual de los "objetos" que existen en el sistema y cómo se relacionan entre sí. Piénsalo como el plano de una casa: no es la casa en sí, pero te muestra cómo está distribuida antes de construirla.

En este caso, el diagrama muestra:
- **Qué datos guarda el sistema** (atributos)
- **Qué acciones puede realizar cada objeto** (métodos)
- **Cómo se conectan los objetos entre sí** (relaciones)

---

## Cómo leer el diagrama — lo mínimo que necesitas saber

Cada caja en el diagrama es una **clase** y se ve así:

```
┌─────────────────────────┐
│       NombreClase       │  ← nombre del objeto
├─────────────────────────┤
│ + atributo : Tipo       │  ← datos que guarda
├─────────────────────────┤
│ + metodo() : Resultado  │  ← acciones que puede hacer
└─────────────────────────┘
```

El `+` antes de cada línea simplemente significa que ese dato o acción es accesible desde el resto del sistema (es "público").

Las **flechas** entre cajas indican que un objeto conoce o usa a otro:
- `──►` Una clase apunta hacia otra (la conoce en una dirección)
- `────` Las dos clases se conocen mutuamente
- Los números en los extremos (`1`, `0..*`, `0..1`) indican cuántos puede haber de cada lado

**Ejemplo rápido:**
```
Patient "1" ──► "0..*" Appointment
```
Esto significa: *un paciente puede tener cero o muchas citas, y cada cita pertenece a exactamente un paciente*.

---

## Las 9 clases del sistema explicadas en lenguaje simple

### 1. `User` — El personal que usa el sistema

Es cualquier persona de la clínica que tiene acceso al sistema: secretarias, coordinadores y administradores. Cada uno tiene su propio usuario con correo y contraseña.

**Datos importantes que guarda:**
| Dato | Para qué sirve |
|---|---|
| `email` | Es el nombre de usuario para iniciar sesión |
| `passwordHash` | La contraseña guardada de forma segura (no en texto plano) |
| `fullName` | Nombre completo del empleado |
| `role` | Su rol: `secretaria`, `coordinador` o `administrador` |

**Acciones que puede hacer:**
- `authenticate()` — verificar si el correo y contraseña son correctos al iniciar sesión
- `hasRole()` — revisar si tiene permiso para realizar cierta acción

> **Nota clave:** Los pacientes NO son usuarios del sistema. `User` solo representa al personal interno.

---

### 2. `Patient` — El paciente de la clínica

Representa a la persona que recibe atención psicológica. El sistema guarda su información para poder agendar citas, pero el paciente nunca entra al sistema por su cuenta.

**Datos importantes que guarda:**
| Dato | Para qué sirve |
|---|---|
| `folio` | Código único generado automáticamente para identificar al paciente |
| `fullName` | Nombre completo |
| `phone` | Teléfono de contacto |
| `email` | Correo del paciente (para notificaciones, si aplica) |
| `birthDate` | Fecha de nacimiento |

**Acciones que puede hacer:**
- `hasActivePendingAppointments()` — cuenta cuántas citas pendientes tiene actualmente
- `canScheduleNewAppointment()` — responde si se le puede agendar otra cita o no

> **Regla de negocio importante:** Un paciente **no puede tener más de 3 citas pendientes** al mismo tiempo. Si ya tiene 3, el sistema no permitirá agendar una más hasta que alguna se complete o cancele.

---

### 3. `Therapist` — El terapeuta / psicólogo

Representa al psicólogo que atiende las citas. La clínica tiene exactamente 3 terapeutas.

**Datos importantes que guarda:**
| Dato | Para qué sirve |
|---|---|
| `userId` | Conexión con su cuenta de usuario (puede ser nula si no tiene acceso al sistema) |
| `specialty` | Su área de especialización |
| `active` | Si está disponible actualmente o no |

**Acciones que puede hacer:**
- `isAvailableAt(inicio, fin)` — revisar si el terapeuta está libre en ese horario

> **Nota clave:** En la primera versión del sistema, un terapeuta puede no tener cuenta de usuario. Por eso `userId` puede estar vacío. Esto se resolvió separando `User` de `Therapist`.

---

### 4. `Room` — El consultorio / sala

Representa el espacio físico donde ocurre la cita. La clínica tiene 3 consultorios.

**Datos importantes que guarda:**
| Dato | Para qué sirve |
|---|---|
| `name` | Nombre del consultorio (ej: "Consultorio A") |
| `location` | Ubicación dentro de la clínica |
| `capacity` | Cuántas personas puede recibir |

**Acciones que puede hacer:**
- `isAvailableAt(inicio, fin)` — revisar si el consultorio está libre en ese horario

> **¿Por qué existe esta clase y no es solo un campo de texto?** Porque si fuera solo texto libre (como "Consultorio A"), el sistema no podría saber si ese consultorio ya está ocupado en ese horario. Al ser una clase propia, se puede verificar disponibilidad y evitar dobles reservas.

---

### 5. `Appointment` — La cita *(el objeto más importante del sistema)*

Es el corazón del sistema. Todo gira alrededor de esta clase. Una cita conecta a un paciente, un terapeuta, un consultorio, un tipo de sesión y un estado.

**Datos importantes que guarda:**
| Dato | Para qué sirve |
|---|---|
| `startAt` / `endAt` | Fecha y hora de inicio y fin de la cita |
| `durationMinutes` | Duración en minutos (se guarda para búsquedas rápidas) |
| `cancelledReason` | Motivo de cancelación (obligatorio al cancelar) |
| `cancelledAt` | Cuándo fue cancelada |
| `paymentProofPath` | Ruta del comprobante de pago (para sesiones terapéuticas) |
| `comments` | Notas adicionales sobre la cita |

También guarda 6 referencias (FK) a otros objetos:
- Al `Patient` que asiste
- Al `Therapist` que atiende
- A la `Room` donde ocurre
- Al `SessionType` (qué tipo de sesión es)
- Al `AppointmentStatus` (en qué estado está)
- Al `User` que creó la cita

**Acciones que puede hacer:**
| Acción | Qué hace |
|---|---|
| `schedule()` | Crea la cita con estado inicial `SCHEDULED` |
| `cancel(motivo, usuario)` | Cambia el estado a `CANCELLED` y registra quién y por qué |
| `reschedule(nuevaFecha, usuario)` | Archiva esta cita como `RESCHEDULED` y crea una nueva |
| `complete()` | Marca la cita como `COMPLETED` |
| `isLate()` | Dice si la cita ya pasó su hora de inicio sin completarse (solo visual, no cambia datos) |
| `validateNoOverlap()` | Verifica que no haya conflicto de horario con el terapeuta, la sala o el paciente |

> **Regla importante:** Las citas **nunca se borran** del sistema. Por eso no existe un método `delete()`. Si se cancela, cambia de estado pero permanece en la base de datos para trazabilidad.

---

### 6. `AppointmentStatus` — El estado de la cita (catálogo fijo)

Es una lista cerrada de los posibles estados que puede tener una cita. No cambia con el tiempo — siempre serán estos 4 valores:

| Estado | Cuándo aplica |
|---|---|
| `SCHEDULED` | La cita fue agendada y está pendiente |
| `CANCELLED` | La cita fue cancelada |
| `RESCHEDULED` | La cita original cuando fue reprogramada |
| `COMPLETED` | La cita ya ocurrió |

> **Ojo:** "Cita atrasada" **no es un estado**. Si una cita ya pasó su hora pero no fue completada, eso se calcula visualmente en el momento (`isLate()`), pero el estado en base de datos sigue siendo `SCHEDULED`.

---

### 7. `SessionType` — El tipo de sesión (catálogo fijo)

Indica qué tipo de atención se dará en la cita. Solo existen dos tipos:

| Tipo | Cuándo se usa |
|---|---|
| `Evaluación inicial` | Primera vez que el paciente asiste. Requiere registrar todos sus datos. |
| `Sesión terapéutica` | Citas de seguimiento. El paciente ya existe en el sistema. |

---

### 8. `AuditLog` — El historial de cambios

Cada vez que alguien realiza una acción importante en el sistema (crear, cancelar, reprogramar una cita), se guarda un registro automático aquí. Esto permite saber exactamente quién hizo qué y cuándo.

**Datos que guarda:**
| Dato | Para qué sirve |
|---|---|
| `entityType` | Qué tabla fue afectada (ej: `"appointments"`) |
| `entityId` | El ID del registro que cambió |
| `action` | Qué pasó: `CREATE`, `UPDATE`, `CANCEL`, `RESCHEDULE`, `STATUS_CHANGE` |
| `payload` | Detalle en formato JSON con los datos antes y después del cambio |
| `performedBy` | Quién realizó la acción (referencia al usuario) |
| `performedAt` | Cuándo ocurrió |

> **¿Por qué existe esto?** Porque como las citas nunca se borran, el AuditLog complementa esa decisión asegurando que cada cambio quede registrado. Es el mecanismo de trazabilidad completa del sistema.

---

### 9. `TherapistAvailability` — Disponibilidad del terapeuta *(no está en el MVP)*

Esta clase existe en el diseño pero **no se implementa en la primera versión**. Serviría para registrar el horario habitual de cada terapeuta (qué días y en qué horas atiende regularmente).

Se incluyó en el diagrama para no tener que rediseñar el modelo cuando se agregue en el futuro.

---

## Mapa de cómo se conectan todas las clases

```
                    ┌──────────────────┐    ┌──────────────┐
                    │ AppointmentStatus │    │ SessionType  │
                    │  (catálogo fijo) │    │ (catálogo)   │
                    └────────┬─────────┘    └──────┬───────┘
                             │ classifies           │ classifies
                             │                      │
┌──────────┐  creates   ┌────▼──────────────────────▼──┐
│   User   ├───────────►│         Appointment           │
│(personal)│            │      (ENTIDAD CENTRAL)        │
└────┬─────┘            └───┬────────┬────────┬─────────┘
     │                      │ has    │ attends │ hosts
     │ puede ser             │        │         │
     ▼                      ▼        ▼         ▼
┌──────────┐          ┌─────────┐ ┌──────────┐ ┌──────┐
│Therapist │          │ Patient │ │Therapist │ │ Room │
└────┬─────┘          └─────────┘ └──────────┘ └──────┘
     │ sala fija (1:1)
     └──────────────────────────────────────────►┌──────┐
                                                  │ Room │
                                                  └──────┘
                    ┌──────────┐
                    │ AuditLog │ ← registra cambios de todo
                    └──────────┘
```

---

## Las 10 reglas de negocio más importantes

Estas reglas no son invención del equipo de desarrollo — vienen del cliente y están modeladas en el diagrama:

| # | Regla | Cómo se ve en el diagrama |
|---|---|---|
| 1 | Un terapeuta no puede tener dos citas al mismo tiempo | `Therapist.isAvailableAt()` + `Appointment.validateNoOverlap()` |
| 2 | Un consultorio no puede usarse en dos citas al mismo tiempo | `Room.isAvailableAt()` + `Appointment.validateNoOverlap()` |
| 3 | Un paciente no puede tener dos citas al mismo tiempo | `Appointment.validateNoOverlap()` |
| 4 | Al crear una cita, el estado inicial siempre es `SCHEDULED` | `Appointment.schedule()` fija ese estado |
| 5 | Las citas **nunca se borran** del sistema | No existe método `delete()` en `Appointment` |
| 6 | Un paciente no puede tener más de 3 citas pendientes | `Patient.canScheduleNewAppointment()` lo verifica |
| 7 | "Cita atrasada" es visual, no un estado en base de datos | `Appointment.isLate()` devuelve solo `true/false`, no cambia datos |
| 8 | Reprogramar crea una nueva cita y archiva la original | `reschedule()` retorna una nueva `Appointment` |
| 9 | Al cancelar, se debe registrar el motivo y quién canceló | `cancel(motivo, usuario)` + entrada en `AuditLog` |
| 10 | Cada terapeuta tiene asignado un consultorio fijo | Relación `1 a 1` entre `Therapist` y `Room` |

---

## Qué NO hace el sistema (para no confundirse)

- **No gestiona pagos.** Solo guarda la ruta a un comprobante de pago (`paymentProofPath`), no procesa transacciones.
- **No envía notificaciones automáticas.** No hay emails ni SMS automáticos en el MVP.
- **No tiene portal para pacientes.** Los pacientes no tienen acceso al sistema.
- **No maneja expedientes clínicos.** Solo guarda los datos básicos del paciente para agendar citas.
- **No calcula honorarios.** No hay lógica financiera más allá del campo del comprobante.

---

## Glosario rápido

| Término | Qué significa en este proyecto |
|---|---|
| **PK** | Primary Key — identificador único de cada registro |
| **FK** | Foreign Key — referencia al ID de otro objeto |
| **MVP** | Minimum Viable Product — la primera versión funcional del sistema |
| **AuditLog** | Registro automático de todos los cambios importantes |
| **Catálogo** | Lista fija de valores que no cambia durante el uso del sistema |
| **nullable** | Un campo que puede estar vacío (sin valor) |
| **Overlap** | Traslape — dos citas ocupando el mismo horario con el mismo recurso |
| **SCHEDULED** | Estado inicial de toda cita: "está programada" |
