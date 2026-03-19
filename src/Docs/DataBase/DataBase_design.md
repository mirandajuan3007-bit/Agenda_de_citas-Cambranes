# Diseño de la base de datos para el caso de creacion de citas

## Appoiment
cuando se crea la cita, se guarda en la Tabla Appoiment

```sql
CREATE TABLE appointments (
	id BIGSERIAL PRIMARY KEY,
	patient_id INT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
	therapist_id INT NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
	room_id INT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
	start_at TIMESTAMP WITH TIME ZONE NOT NULL,
	end_at TIMESTAMP WITH TIME ZONE NOT NULL,
	duration_minutes INT NOT NULL,
	status_id SMALLINT NOT NULL REFERENCES appointment_statuses(id),
	created_by INT REFERENCES users(id),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
	cancelled_reason TEXT,
	deleted_at TIMESTAMP WITH TIME ZONE NULL,
	cacelled_reason TEXT,
	payment_prof_path VARCHAR(500) --!url de la imagen del comprobante
);
```

## patient
cunado se crea una cita por primera vez se crea un paciente en la base de datos

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(50) UNIQUE, 
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
