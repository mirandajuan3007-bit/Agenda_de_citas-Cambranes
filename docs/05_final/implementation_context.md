# Diseno de la base de datos

## 1. Vision general

La base de datos modela un sistema de gestion de citas para una clinica psicologica. Su objetivo es soportar el registro, consulta, reprogramacion, cancelacion y trazabilidad de citas dentro del modulo de agenda.

Entidades principales:

- `users`: personal que utiliza el sistema, como secretaria, coordinador o administrador
- `patients`: pacientes registrados en el modulo
- `therapists`: terapeutas disponibles para atender citas
- `rooms`: consultorios o salas disponibles
- `appointments`: citas del sistema
- `appointment_statuses`: catalogo de estados de cita
- `session_types`: catalogo de tipos de sesion
- `audit_logs`: trazabilidad de acciones relevantes

No se contempla una tabla separada para "citas borradas". La trazabilidad se mantiene mediante estados de cita y mediante `audit_logs`, ya que las citas no deben eliminarse fisicamente desde este modulo.

**Principios del modelo:**

- `appointments` es la entidad central del dominio.
- La base de datos debe permitir trazabilidad y consistencia, no solo almacenamiento.
- Las reglas de disponibilidad de paciente, terapeuta y sala deben respetarse desde el modelo y desde la logica de aplicacion.
- El modulo de agenda no debe convertirse en un expediente clinico completo.

---

## 2. Relaciones principales

- `users (1) -> (N) appointments` mediante `created_by`
- `patients (1) -> (N) appointments`
- `therapists (1) -> (N) appointments`
- `rooms (1) -> (N) appointments`
- `appointment_statuses (1) -> (N) appointments`
- `session_types (1) -> (N) appointments`

Cada cita debe relacionar exactamente:

- un paciente
- un terapeuta
- una sala
- un tipo de sesion
- un estado de cita

Adicionalmente, el contexto del proyecto establece que cada terapeuta tiene una sala asignada de forma fija. Si esta regla se mantiene en implementacion, debera modelarse explicitamente con una restriccion adicional, ya sea mediante una relacion uno a uno entre `therapists` y `rooms` o mediante una tabla de asignacion fija.

---

## 3. Descripcion de entidades

### 3.1. users

Representa a las personas que usan el sistema y que tienen credenciales de acceso.

Ejemplos:

- Secretaria
- Coordinador
- Administrador

**Responsabilidad:**

- autenticacion
- control de acceso por rol
- identidad digital dentro del sistema

**Por que existe separada:**

- distingue entre personas que usan el sistema y personas que reciben servicio
- un paciente no necesita iniciar sesion para que el modulo funcione

**Que problema resuelve:**

- evita duplicacion de datos de acceso
- permite manejar roles y permisos en el futuro
- mantiene trazabilidad sobre quien crea, modifica o cancela citas

### 3.2. patients

Representa a la persona que recibe la atencion dentro del sistema.

**Responsabilidad:**

- almacenar datos basicos del paciente
- generar y mantener un folio unico
- soportar historial de citas

**Por que esta separada de users:**

- el paciente no necesariamente accede al sistema
- los pacientes forman parte del dominio operativo, no del control de acceso

**Que problema resuelve:**

- permite identificar pacientes nuevos y existentes
- facilita la trazabilidad de sus citas
- soporta reglas como limite de citas pendientes y generacion de folio

### 3.3. therapists

Representa a un terapeuta disponible para atender citas.

**Responsabilidad:**

- almacenar datos profesionales del terapeuta
- soportar reglas de asignacion y disponibilidad

**Por que no es solo un rol en users:**

- puede requerir metadatos propios, como especialidad o configuracion operativa
- separa identidad digital de informacion profesional

**Que problema resuelve:**

- permite relacionar citas con terapeutas especificos
- soporta reglas futuras de disponibilidad o asignacion fija de sala

### 3.4. rooms

Representa el espacio fisico donde ocurre la cita.

**Responsabilidad:**

- evitar dobles reservas
- indicar donde ocurre la cita
- soportar control de infraestructura

**Por que no es solo un campo de texto en appointments:**

- no se podria controlar disponibilidad ni duplicidad correctamente
- dificultaria la escalabilidad del modelo

**Que problema resuelve:**

- impide que dos citas usen la misma sala al mismo tiempo
- mantiene trazabilidad del recurso fisico utilizado

### 3.5. appointments

Representa el evento central del sistema: una cita agendada en un horario especifico.

**Responsabilidad:**

- relacionar paciente, terapeuta, sala, fecha, tipo de sesion y estado
- registrar el horario y la duracion de la cita
- permitir cancelaciones, reprogramaciones y trazabilidad

**Por que es una tabla independiente:**

- modela la operacion principal del negocio
- concentra el estado real de la agenda

**Que problema resuelve:**

- sin esta entidad no existe agenda ni validacion de conflictos
- permite operar el calendario y mantener el historial de citas

### 3.6. appointment_statuses

Representa los posibles estados de una cita.

Estados esperados por coherencia con el proyecto:

- `SCHEDULED`
- `CANCELLED`
- `RESCHEDULED`
- `COMPLETED`

**Responsabilidad:**

- indicar en que fase se encuentra una cita

**Por que no usar solo texto libre:**

- evita errores tipograficos
- normaliza el modelo
- permite validaciones mas fuertes

**Que problema resuelve:**

- mantiene una sola fuente de estados valida para las citas
- evita borrar citas para representar cambios de estado

Importante: la condicion de "cita atrasada" definida en RF-07 no debe modelarse como un estado adicional en esta tabla. Es una condicion visual derivada del tiempo y del estado actual de la cita.

### 3.7. session_types

Representa los tipos de sesion soportados por el modulo.

Ejemplos esperados:

- Evaluacion inicial
- Sesion terapeutica

**Responsabilidad:**

- clasificar las citas segun el flujo de negocio

### 3.8. audit_logs

Representa el historial tecnico de acciones relevantes sobre entidades del sistema.

**Responsabilidad:**

- registrar creacion, actualizacion, cancelacion o reprogramacion de citas
- conservar evidencia de quien realizo una accion y cuando la realizo

---

## 4. Esquema propuesto

### 4.1. Tabla users

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

### 4.2. Tabla patients

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

### 4.3. Tabla therapists

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

Nota: `user_id` puede ser nullable si en la primera implementacion los terapeutas no tendran acceso directo al sistema y solo se manejaran como recurso del dominio.

### 4.4. Tabla rooms

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  capacity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 4.5. Tabla appointment_statuses

```sql
CREATE TABLE appointment_statuses (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);
```

Poblado sugerido:

- `(1, 'SCHEDULED', 'Cita programada')`
- `(2, 'CANCELLED', 'Cita cancelada')`
- `(3, 'RESCHEDULED', 'Cita reprogramada')`
- `(4, 'COMPLETED', 'Cita finalizada')`

### 4.6. Tabla session_types

```sql
CREATE TABLE session_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);
```

### 4.7. Tabla appointments

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

Recomendaciones:

- `start_at` y `end_at` forman la ventana de la cita
- `duration_minutes` puede derivarse, pero conviene conservarlo para consultas y validaciones rapidas
- `status_id` controla el estado documental de la cita, no su estado visual temporal

### 4.8. Tabla audit_logs

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

Acciones sugeridas:

- `CREATE`
- `UPDATE`
- `CANCEL`
- `RESCHEDULE`
- `STATUS_CHANGE`

### 4.9. Tabla therapist_availabilities (opcional)

Si se requiere modelar horarios del terapeuta de forma mas robusta:

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

## 5. Restricciones y reglas criticas

Debe prohibirse que exista solapamiento de citas por:

- mismo `therapist_id`
- mismo `room_id`
- mismo `patient_id`

Reglas de negocio adicionales que este diseno debe respetar por coherencia con el proyecto:

- El estado inicial de una cita debe ser `SCHEDULED` o su equivalente documental de "programada".
- Una cita no debe eliminarse fisicamente desde el modulo de agenda.
- Un paciente no debe tener mas de 3 citas pendientes o activas al mismo tiempo, si la regla definida en RF-01 se mantiene para implementacion.
- La condicion de atraso de una cita no modifica el estado almacenado; solo afecta su representacion visual.
- Si el proyecto mantiene la regla de sala fija por terapeuta, la implementacion debera forzar esa restriccion en base de datos o en logica de aplicacion.

---

## 6. Seguridad y buenas practicas

- Nunca guardar contrasenias en texto plano; almacenar `password_hash` con bcrypt o argon2.
- Gestionar credenciales y secretos mediante variables de entorno o un secret manager.
- Proteger endpoints que manipulan citas con autenticacion y autorizacion.
- Auditar cambios sensibles en `audit_logs`.
- No exponer datos clinicos innecesarios desde el modulo de agenda.

---

## 7. Notas para implementacion asistida por IA

Si este documento se usa como contexto para una IA que construira el sistema, debe interpretarse con estas restricciones:

- El modulo actual es exclusivamente de agenda, no de expediente clinico completo.
- La IA no debe inventar estados adicionales de cita sin respaldo documental.
- La IA no debe asumir borrado fisico de citas.
- La IA debe tratar `appointments` como la entidad central del dominio.
- La IA debe validar conflictos de horario entre paciente, terapeuta y sala.
- La IA debe respetar que la regla visual de citas atrasadas pertenece a la capa de aplicacion o interfaz, no al catalogo de estados.
- La IA debe implementar primero el subconjunto minimo del modelo necesario para el MVP, antes de extenderlo con catalogos o reglas opcionales.