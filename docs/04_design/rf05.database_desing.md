# Diseño de la base de datos para el caso **RF-05 Guardar datos del paciente e historial de citas**

## `patients`
Cuando un paciente agenda por primera vez, su información se registra en la tabla `patients`.

```sql
CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    birth_date DATE,
    gender VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

## `appointment_statuses`
Catálogo de estados para las citas.

```sql
CREATE TABLE appointment_statuses (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);
```

### Ejemplo de datos
```sql
INSERT INTO appointment_statuses (name, description) VALUES
('scheduled', 'Cita programada'),
('completed', 'Cita completada'),
('cancelled', 'Cita cancelada'),
('rescheduled', 'Cita reprogramada'),
('no_show', 'Paciente no asistió');
```

## `appointments`
Cada cita del paciente se guarda en la tabla `appointments`.
Aquí queda registrada la relación entre paciente, terapeuta, consultorio y estado actual de la cita.

```sql
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
    room_id BIGINT REFERENCES rooms(id) ON DELETE RESTRICT,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL,
    status_id SMALLINT NOT NULL REFERENCES appointment_statuses(id),
    reason TEXT, -- motivo de la cita
    notes TEXT, -- notas generales de la cita
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    cancelled_reason TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

## `appointment_history`
Para conservar el historial de citas, cada cambio importante de una cita se registra en esta tabla.
Esto permite saber cuándo se creó, reprogramó, canceló o completó una cita.

```sql
CREATE TABLE appointment_history (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    previous_status_id SMALLINT REFERENCES appointment_statuses(id),
    new_status_id SMALLINT NOT NULL REFERENCES appointment_statuses(id),
    changed_by BIGINT REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Relación entre tablas

- Un **paciente** puede tener **muchas citas**.
- Una **cita** pertenece a **un solo paciente**.
- Una **cita** puede tener **muchos registros de historial**.
- El **historial** guarda cada cambio de estado de una cita.

## Flujo de funcionamiento en BD

### 1. Se registra el paciente
Si el paciente no existe, se inserta en `patients`.

### 2. Se crea la cita
La cita se guarda en `appointments` con estado inicial `scheduled`.

### 3. Se guarda el historial inicial
Al crearse la cita, también se inserta un registro en `appointment_history` indicando que la cita fue programada.

### 4. Si la cita cambia
Cada vez que la cita se cancele, reprograme o complete, se actualiza `appointments.status_id` y se agrega un nuevo registro en `appointment_history`.

## Ejemplo de inserción

### Crear paciente
```sql
INSERT INTO patients (
    folio,
    full_name,
    phone,
    email,
    birth_date,
    gender,
    address
) VALUES (
    'PAC-0001',
    'Juan Pérez López',
    '9991234567',
    'juanperez@email.com',
    '1998-05-14',
    'Masculino',
    'Mérida, Yucatán'
);
```

### Crear cita
```sql
INSERT INTO appointments (
    patient_id,
    therapist_id,
    room_id,
    start_at,
    end_at,
    duration_minutes,
    status_id,
    reason,
    created_by
) VALUES (
    1,
    2,
    1,
    '2026-03-25 10:00:00-06',
    '2026-03-25 11:00:00-06',
    60,
    1,
    'Primera consulta',
    1
);
```

### Guardar historial de creación
```sql
INSERT INTO appointment_history (
    appointment_id,
    patient_id,
    previous_status_id,
    new_status_id,
    changed_by,
    change_reason
) VALUES (
    1,
    1,
    NULL,
    1,
    1,
    'Cita creada en el sistema'
);
```

## Consulta para ver el historial de citas de un paciente

```sql
SELECT
    a.id AS appointment_id,
    p.full_name AS patient_name,
    a.start_at,
    a.end_at,
    s.name AS current_status,
    h.changed_at,
    ps.name AS previous_status,
    ns.name AS new_status,
    h.change_reason
FROM appointments a
INNER JOIN patients p ON p.id = a.patient_id
INNER JOIN appointment_statuses s ON s.id = a.status_id
LEFT JOIN appointment_history h ON h.appointment_id = a.id
LEFT JOIN appointment_statuses ps ON ps.id = h.previous_status_id
LEFT JOIN appointment_statuses ns ON ns.id = h.new_status_id
WHERE p.id = 1
ORDER BY a.start_at DESC, h.changed_at DESC;
```

## Resumen
Para el **RF-05**, la representación en BD mínima recomendable sería:

- `patients` → guarda los datos del paciente.
- `appointments` → guarda las citas asociadas al paciente.
- `appointment_statuses` → catálogo de estados.
- `appointment_history` → guarda el historial de cambios de cada cita.
