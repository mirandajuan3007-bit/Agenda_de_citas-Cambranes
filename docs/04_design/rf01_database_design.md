# Diseno de la base de datos para el caso de creacion de citas

## Catalogo de estados de cita

La tabla de estados permite mantener trazabilidad sin eliminar fisicamente las citas.

```sql
CREATE TABLE appointment_statuses (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, 
  description TEXT
);
```

## Catalogo de tipos de sesion

La tabla clasifica las citas segun el tipo de atencion.

```sql
CREATE TABLE session_types (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL UNIQUE
);
```

## Usuarios administrativos

Registra al personal que crea, actualiza o cancela citas dentro del modulo.

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

## Pacientes

Cuando se crea una cita de evaluacion inicial, se registra al paciente y se genera su folio unico.

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

## Terapeutas

```sql
CREATE TABLE therapists (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  active BOOLEAN NOT NULL DEFAULT TRUE
);
```

## Salas

Cada terapeuta tiene una sala asignada de forma fija.

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  capacity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Citas

Cuando se crea la cita, se guarda en la tabla `appointments`.

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

### Restricciones de negocio sugeridas

- El estado inicial de una cita debe ser `programada`.
- No se deben eliminar fisicamente citas desde este modulo.
- El `folio` del paciente debe ser unico.
- La duracion y el rango horario deben ser consistentes con `start_at` y `end_at`.
