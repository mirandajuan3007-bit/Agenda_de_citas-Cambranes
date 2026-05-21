# Diseño detallado de la base de datos

## 1. Propósito del documento

Este documento presenta el diseño detallado de la base de datos del módulo de agenda para la clínica psicológica. Su objetivo es servir como referencia técnica para el equipo, de manera que cualquier integrante pueda entender:

- qué entidades existen en el sistema
- cómo se relacionan entre sí
- qué reglas de negocio deben respetarse desde el modelo de datos
- qué decisiones ya están definidas y cuáles siguen abiertas para implementación

Este archivo está pensado para compañeros del proyecto y funciona como documento de consulta del modelo de datos, independiente del archivo de contexto para IA.

---

## 2. Alcance del diseño

La base de datos cubre el módulo de agenda de citas. Esto incluye:

- registro de citas
- consulta de citas
- reprogramación
- cancelación
- trazabilidad operativa
- control de disponibilidad de paciente, terapeuta y sala

No cubre como parte central del modelo:

- pagos completos del sistema
- expediente clínico completo
- evaluación socioeconómica
- módulos externos a la agenda

---

## 3. Visión general del modelo

La entidad central del sistema es `appointments`, ya que representa el evento principal del dominio: una cita programada entre un paciente y un terapeuta, en una sala y en un horario específico.

Entidades principales del modelo:

- `users`
- `patients`
- `therapists`
- `rooms`
- `appointments`
- `appointment_statuses`
- `session_types`
- `audit_logs`

Entidades o estructuras opcionales para crecimiento posterior:

- `therapist_availabilities`

---

## 4. Relación entre entidades

Relaciones principales:

- un `user` puede crear muchas `appointments`
- un `patient` puede tener muchas `appointments`
- un `therapist` puede atender muchas `appointments`
- una `room` puede estar asociada a muchas `appointments`
- un `appointment_status` puede aplicarse a muchas `appointments`
- un `session_type` puede clasificarse en muchas `appointments`

Cada cita debe tener exactamente:

- un paciente
- un terapeuta
- una sala
- un tipo de sesión
- un estado

### Representación conceptual simple

```text
users ----------- created_by ---------- appointments ---------- patients
                                           |
                                           |
                                      therapists
                                           |
                                           |
                                         rooms

appointments -------- appointment_statuses
appointments -------- session_types
```

---

## 5. Descripción de entidades

### 5.1. users

Representa al personal que accede al sistema.

Ejemplos:

- secretaria
- coordinador
- administrador

**Propósito:**

- autenticación
- control de acceso por rol
- trazabilidad de acciones dentro del sistema

**Campos esperados:**

- id
- email
- password_hash
- full_name
- role
- created_at
- updated_at

**Observación:**

No representa pacientes. Se usa solo para personas con acceso al sistema.

### 5.2. patients

Representa a la persona que recibe la atención.

**Propósito:**

- almacenar datos básicos del paciente
- generar folio único
- relacionar al paciente con sus citas

**Campos esperados:**

- id
- folio
- full_name
- phone
- email
- birth_date
- created_at
- updated_at

**Observación:**

El módulo de agenda debe manejar datos básicos, no un expediente clínico completo.

### 5.3. therapists

Representa al terapeuta que atenderá citas.

**Propósito:**

- almacenar datos profesionales básicos
- relacionarlo con citas del sistema
- soportar futuras reglas de disponibilidad

**Campos esperados:**

- id
- user_id
- specialty
- notes
- active
- created_at

**Observación:**

Si los terapeutas no tendrán login en la primera versión, `user_id` puede mantenerse nullable o resolverse en otra iteración.

### 5.4. rooms

Representa el consultorio o sala física donde ocurre la cita.

**Propósito:**

- controlar disponibilidad física
- evitar dobles reservas
- ubicar la cita dentro de la clínica

**Campos esperados:**

- id
- name
- location
- capacity
- created_at

**Observación:**

El proyecto establece que cada terapeuta tiene una sala asignada de forma fija. Si esa regla se mantiene, deberá reforzarse con una restricción adicional en implementación.

### 5.5. appointment_statuses

Representa los estados posibles de una cita.

**Estados definidos por el proyecto:**

- `SCHEDULED`
- `CANCELLED`
- `RESCHEDULED`
- `COMPLETED`

**Propósito:**

- normalizar los estados
- evitar errores de texto libre
- facilitar reglas y validaciones

**Observación importante:**

La condición de "cita atrasada" no debe almacenarse como estado. Es una condición visual derivada del tiempo y del estado actual de la cita.

### 5.6. session_types

Representa el tipo de sesión de la cita.

**Ejemplos esperados:**

- evaluación inicial
- sesión terapéutica

**Propósito:**

- clasificar el flujo de negocio
- distinguir citas de primera vez de citas de seguimiento

### 5.7. appointments

Representa la cita como evento principal del sistema.

**Propósito:**

- relacionar paciente, terapeuta, sala, tipo de sesión y estado
- definir horario de inicio y fin
- soportar cancelación, reprogramación y consulta

**Campos esperados:**

- id
- patient_id
- therapist_id
- room_id
- session_type_id
- start_at
- end_at
- duration_minutes
- status_id
- created_by
- created_at
- updated_at
- cancelled_reason
- cancelled_at
- payment_proof_path
- comments

**Observación:**

Es la entidad más importante del sistema. Toda la lógica de agenda gira alrededor de ella.

### 5.8. audit_logs

Representa el historial de cambios importantes.

**Propósito:**

- registrar creación, actualización, cancelación o reprogramación
- saber quién hizo qué cambio y cuándo
- apoyar trazabilidad y depuración futura

---

## 6. Esquema SQL propuesto

### 6.1. Tabla users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6.2. Tabla patients

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6.3. Tabla therapists

```sql
CREATE TABLE therapists (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  specialty VARCHAR(255),
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6.4. Tabla rooms

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  capacity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6.5. Tabla appointment_statuses

```sql
CREATE TABLE appointment_statuses (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);
```

**Poblado sugerido:**

- `(1, 'SCHEDULED', 'Cita programada')`
- `(2, 'CANCELLED', 'Cita cancelada')`
- `(3, 'RESCHEDULED', 'Cita reprogramada')`
- `(4, 'COMPLETED', 'Cita finalizada')`

### 6.6. Tabla session_types

```sql
CREATE TABLE session_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);
```

### 6.7. Tabla appointments

```sql
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  therapist_id INT NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  session_type_id INT NOT NULL REFERENCES session_types(id),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT NOT NULL,
  status_id SMALLINT NOT NULL REFERENCES appointment_statuses(id),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cancelled_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE NULL,
  payment_proof_path VARCHAR(500),
  comments TEXT,
  CHECK (start_at < end_at)
);
```

### 6.8. Tabla audit_logs

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  payload JSONB,
  performed_by INT REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6.9. Tabla therapist_availabilities (opcional)

```sql
CREATE TABLE therapist_availabilities (
  id SERIAL PRIMARY KEY,
  therapist_id INT REFERENCES therapists(id) ON DELETE CASCADE,
  room_id INT REFERENCES rooms(id),
  weekday SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_date DATE,
  end_date DATE
);
```

---

## 7. Reglas de negocio críticas

La base de datos y la lógica de aplicación deben respetar estas reglas:

1. Un terapeuta no puede tener dos citas al mismo tiempo.
2. Una sala no puede usarse en dos citas simultáneas.
3. Un paciente no puede tener dos citas en el mismo horario.
4. Una cita debe iniciar con estado `SCHEDULED`.
5. Las citas no deben eliminarse físicamente desde el módulo.
6. La condición de atraso no cambia el estado guardado en base de datos.
7. Si se mantiene la regla del RF-01, un paciente no debe tener más de 3 citas pendientes o activas al mismo tiempo.

---

## 8. Índices y validaciones recomendadas

Además de llaves primarias y foráneas, conviene considerar:

- índice por `appointments.start_at`
- índice por `appointments.therapist_id`
- índice por `appointments.room_id`
- índice por `appointments.patient_id`
- índice compuesto por `therapist_id + start_at`
- índice compuesto por `room_id + start_at`
- índice compuesto por `patient_id + start_at`

También conviene validar desde aplicación:

- horario laboral permitido
- coherencia entre `duration_minutes` y el rango `start_at/end_at`
- relación fija terapeuta-sala, si se decide imponer

---

## 9. Decisiones abiertas del diseño

Estas decisiones todavía deben confirmarse antes o durante la implementación:

- si los terapeutas tendrán usuario propio desde la primera versión
- si la asignación fija terapeuta-sala se impondrá desde base de datos o solo desde lógica de aplicación
- si `therapist_availabilities` entrará desde el MVP o en una iteración posterior
- si `payment_proof_path` realmente forma parte del MVP o debe dejarse fuera inicialmente

---

## 10. Notas para implementación asistida por IA

Si este documento se usa como contexto para una IA que construirá el sistema, debe interpretarse con estas restricciones:

- el módulo actual es exclusivamente de agenda
- no debe implementarse como expediente clínico completo
- no deben inventarse estados nuevos de cita
- no debe asumirse borrado físico de citas
- `appointments` debe tratarse como la entidad central del sistema
- la validación de conflictos entre paciente, terapeuta y sala es obligatoria
- la alerta de cita atrasada pertenece a la capa de aplicación o interfaz, no a la tabla de estados

---

## 11. Recomendación para el equipo

Si el equipo quiere empezar implementación ordenadamente, este documento debe leerse junto con:

- `docs/01_problem_definition/system_context.md`
- `docs/02_requirements/rf01_requirement_description.md`
- `docs/04_design/rf01_database_design.md`
- `docs/05_final/implementation_context.md`

Este archivo funciona como referencia detallada para entender el diseño de base de datos, mientras que `implementation_context.md` sirve como guía más general para implementación.