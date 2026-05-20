# Diagrama Modelo Entidad-Relación — Módulo de Agenda

## 1. Propósito del documento

Este documento presenta el modelo entidad-relación (MER) del módulo de agenda de la clínica psicológica. Su objetivo es representar de forma visual y declarativa:

- las entidades principales del dominio
- los atributos relevantes de cada entidad
- las relaciones (cardinalidades) entre ellas
- las reglas de negocio que el modelo debe sostener

Este modelo sirve de base directa para el diseño físico de la base de datos ya documentado en `docs/05_final/diseño_base_de_datos.md` y debe leerse como su contraparte visual.

---

## 2. ¿Qué es un modelo entidad-relación?

El modelo entidad-relación es una técnica de modelado conceptual de datos. Permite describir, de forma independiente del motor de base de datos, qué información maneja un sistema y cómo se conecta esa información entre sí.

Sus piezas básicas son:

- **Entidad**: una "cosa" del mundo real que el sistema necesita recordar (paciente, cita, sala). Cada entidad se convierte normalmente en una tabla.
- **Atributo**: una propiedad de la entidad (nombre, fecha de nacimiento, hora de inicio). Se convierten en columnas.
- **Llave primaria (PK)**: atributo o combinación que identifica de forma única a cada instancia de la entidad.
- **Llave foránea (FK)**: atributo que referencia la PK de otra entidad y materializa una relación.
- **Relación**: vínculo lógico entre dos entidades (un paciente *tiene* citas, una sala *aloja* citas).
- **Cardinalidad**: cuántas instancias de un lado se relacionan con cuántas del otro:
  - **1 : 1** uno a uno
  - **1 : N** uno a muchos
  - **N : M** muchos a muchos

### ¿Para qué sirve?

- garantiza que todos los datos del sistema estén representados antes de programar
- detecta redundancias y dependencias ocultas
- facilita la comunicación entre analistas, desarrolladores y stakeholders
- es el puente entre los requisitos del sistema y el esquema SQL real

En este proyecto el MER refleja directamente las reglas de negocio del módulo de agenda y se traduce 1 a 1 con las tablas SQL ya propuestas.

---

## 3. Alcance del modelo

El modelo cubre **únicamente el módulo de agenda de citas**, conforme a `docs/01_problem_definition/system_context.md`. Esto incluye:

- registro, consulta, reprogramación y cancelación de citas
- control de disponibilidad de paciente, terapeuta y sala
- trazabilidad operativa de las acciones del sistema

**Quedan fuera del alcance:**

- expediente clínico completo
- módulo de pagos completo
- evaluación socioeconómica
- cualquier módulo externo a la agenda

Esto justifica que el modelo no incluya entidades como `payment`, `clinical_record`, `evaluation`, etc.

---

## 4. Entidades del modelo

### 4.1. Entidades principales (núcleo del dominio)

| Entidad           | Rol en el sistema                                                  |
|-------------------|---------------------------------------------------------------------|
| `patients`        | Persona que recibe la atención psicológica.                        |
| `therapists`      | Profesional que atiende las citas.                                 |
| `rooms`           | Consultorio físico donde ocurre la cita.                           |
| `session_types`   | Clasificación del tipo de sesión (evaluación, terapéutica, etc.).  |
| `appointments`    | Entidad central: la cita como evento que une a las anteriores. |

### 4.2. Entidades de soporte

| Entidad                  | Por qué se incluye                                                                 |
|--------------------------|-------------------------------------------------------------------------------------|
| `users`                  | Personal con acceso al sistema (secretaria, coordinador, admin); necesario para `created_by` y trazabilidad. |
| `appointment_statuses`   | Catálogo normalizado de estados (`SCHEDULED`, `CANCELLED`, `RESCHEDULED`, `COMPLETED`). |
| `audit_logs`             | Registro histórico de cambios para soportar trazabilidad operativa.                |

### 4.3. Mapeo de los actores del sistema al modelo

Se definen dos actores que interactúan con el módulo: la **secretaria** y el **coordinador de la clínica**. Ambos se representan en la **misma entidad** `users`, diferenciados por el atributo `role`. No son entidades separadas porque comparten la misma estructura de datos (email, contraseña, nombre, etc.) y solo difieren en sus permisos.

| Actor del sistema           | Entidad     | Valor de `users.role` | Responsabilidad sobre la agenda                                                                 |
|-----------------------------|-------------|------------------------|--------------------------------------------------------------------------------------------------|
| Secretaria                  | `users`     | `secretaria`           | Registra, reprograma, cancela y consulta citas. Genera la mayoría de los registros `created_by`. |
| Coordinador de la clínica   | `users`     | `coordinador`          | Supervisa la gestión de citas, accede a información para control y seguimiento, puede crear o intervenir citas. |
| Administrador (futuro)      | `users`     | `admin`                | Gestión técnica del sistema; uso operativo restringido.                                          |
| Terapeuta / psicólogo       | `therapists` | n/a                   | **No es usuario administrativo**. Es un rol clínico modelado aparte. Puede tener (o no) un `user_id` asociado si en el futuro se le da acceso al sistema. |
| Paciente                    | `patients`  | n/a                    | **No accede al sistema.** Solo es atendido por él.                                              |

---

## 5. Descripción de las relaciones

| Relación                                  | Cardinalidad | Significado de negocio                                                                 |
|-------------------------------------------|--------------|----------------------------------------------------------------------------------------|
| `patients` → `appointments`               | 1 : N        | Un paciente puede tener varias citas a lo largo del tiempo. Cada cita es de un solo paciente. |
| `therapists` → `appointments`             | 1 : N        | Un terapeuta atiende muchas citas. Cada cita la atiende un único terapeuta.            |
| `rooms` → `appointments`                  | 1 : N        | Una sala se reutiliza en muchas citas. Cada cita ocurre en una sola sala.              |
| `session_types` → `appointments`          | 1 : N        | Un tipo de sesión clasifica muchas citas. Cada cita tiene un único tipo.               |
| `appointment_statuses` → `appointments`   | 1 : N        | Un estado puede aplicarse a muchas citas. Cada cita tiene un único estado actual.      |
| `users` → `appointments` (`created_by`)   | 1 : N        | Un usuario administrativo puede crear muchas citas. Cada cita la crea un usuario.      |
| `users` → `therapists`                    | 1 : 0..1     | Un usuario *puede* tener un perfil de terapeuta asociado (futuro login del terapeuta). |
| `users` → `audit_logs`                    | 1 : N        | Un usuario genera muchos registros de auditoría.                                       |

### Restricciones clave que el modelo refuerza

- **Una cita exige siempre**: paciente, terapeuta, sala, tipo de sesión y estado (todas FK `NOT NULL`).
- **Un paciente, terapeuta o sala no se borra en cascada**: al eliminar uno, las citas se conservan (`ON DELETE RESTRICT`) para no perder historial.
- **El `folio` del paciente es único** (`UNIQUE`): garantiza identificación inequívoca.
- **El estado se referencia por catálogo**, no por texto libre: evita inconsistencias.

---

## 6. Reglas de negocio que respalda el modelo

Estas reglas, listadas en `docs/05_final/diseño_base_de_datos.md`, **están soportadas estructuralmente por el MER**:

1. Un terapeuta no puede tener dos citas al mismo tiempo. *(FK `therapist_id` + validación de solape sobre `start_at`/`end_at`)*
2. Una sala no puede usarse en dos citas simultáneas. *(FK `room_id` + validación de solape)*
3. Un paciente no puede tener dos citas en el mismo horario. *(FK `patient_id` + validación de solape)*
4. Toda cita debe nacer con estado `SCHEDULED`. *(FK obligatoria a `appointment_statuses`)*
5. Las citas no se eliminan físicamente. *(estados `CANCELLED`/`COMPLETED` + `ON DELETE RESTRICT`)*
6. La condición de "atrasada" **no es un estado**: es derivada en tiempo de visualización. Por eso *no* aparece en `appointment_statuses`.
7. Toda acción relevante deja huella en `audit_logs`.

---

## 7. Decisiones explícitas tomadas en el modelo

- **`appointments` es la entidad central.** Toda regla de negocio gira en torno a ella; por eso concentra siete llaves foráneas.
- **`appointment_statuses` es un catálogo, no un campo de texto.** Esto previene errores como `"cancelada"` vs `"CANCELADA"` vs `"Cancelado"`.
- **Se separa `users` de `therapists`.** Un usuario es alguien con acceso al sistema (secretaria, coordinador, admin); un terapeuta es un rol clínico. La relación `1 : 0..1` permite que un terapeuta tenga (o no) login.
- **Se separa `users` de `patients`.** Los pacientes **no** acceden al sistema.
- **No existen relaciones N:M.** Todas las relaciones del módulo son 1:N gracias a que `appointments` actúa como la tabla puente natural entre paciente, terapeuta y sala.
- **Se omiten entidades fuera de alcance** (pagos, expediente clínico, evaluaciones), cumpliendo el criterio de "no entidades innecesarias".
