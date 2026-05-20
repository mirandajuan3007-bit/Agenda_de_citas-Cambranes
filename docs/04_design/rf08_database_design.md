# Diseno de la base de datos para el caso de reprogramar una cita

## Tipos de sesion

Tabla que almacena los tipos de sesión disponibles en el sistema, como seguimiento. Se utiliza para clasificar las citas y aplicar reglas de negocio según el tipo.

```sql
CREATE TABLE session_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
```

## Estados de cita

Tabla que define los diferentes estados que puede tener una cita, como activa, cancelada o reprogramada. Permite manejar el ciclo de vida de las citas sin eliminarlas físicamente.

```sql
CREATE TABLE appointment_statuses (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
```

## Citas reprogramadas

Tabla principal que almacena la información de las citas, incluyendo paciente, terapeuta, sala, horario y estado.

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
    updated_by INT REFERENCES users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    parent_appointment_id BIGINT REFERENCES appointments(id),
    reschedule_count INT DEFAULT 0,
    reschedule_note TEXT,
    CHECK (start_at < end_at)
);
```

### Consideraciones de diseno

- La cita original no debe sobrescribirse; debe pasar al estado `reprogramada`.
- La nueva cita debe apuntar a la cita original mediante `parent_appointment_id`.
- `reschedule_count` permite identificar cuantas veces se ha modificado una misma cadena de citas.
- La reprogramacion debe validarse contra disponibilidad de terapeuta, paciente y sala antes de guardarse.
