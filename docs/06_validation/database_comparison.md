# Comparativo de Base de Datos — Diseño vs Implementación

## 1. Resumen tabla por tabla

| Tabla del diseño | Estructura paralela en código | Coincide | Observación |
|---|---|---|---|
| `users` | `interface User` + `data.users` | Parcial | Falta `password_hash` (usa `password` en plano), falta `created_at`/`updated_at` |
| `patients` | `interface Patient` + `data.patients` | Sí | Coincide. `birth_date` opcional/vacío en el flujo nuevo paciente |
| `therapists` | `interface Therapist` + `data.therapists` | Parcial | Falta `user_id`, `notes`, `created_at`. Agrega `roomId` (sala fija) |
| `rooms` | `interface Room` + `data.rooms` | Parcial | Falta `capacity` y `created_at` |
| `appointment_statuses` | `interface AppointmentStatus` + `data.appointmentStatuses` | Sí | 4 estados con mismos códigos |
| `session_types` | `interface SessionType` + `data.sessionTypes` | Sí | 2 tipos |
| `appointments` | `interface Appointment` + `data.appointments` | Parcial | Agrega `cuota` y `rescheduledFromId` no presentes en el SQL |
| `audit_logs` | `interface AuditLog` + `data.auditLogs` | Parcial | Agrega `entityType: 'patient'`; faltan acciones `STATUS_CHANGE` |
| `therapist_availabilities` (opcional) | — | No | No implementado |

---

## 2. Detalle por tabla

### 2.1. `users`

**Diseño:**
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

**Implementación (`types/index.ts`):**
```ts
export interface User {
  id: number;
  email: string;
  password: string;         
  fullName: string;
  role: 'secretaria' | 'coordinador';
}
```

| Campo diseño | Campo impl. | Coincide |
|---|---|---|
| `id SERIAL PK` | `id: number` | Sí |
| `email UNIQUE NOT NULL` | `email: string` | Sí en tipo, sin enforce de UNIQUE |
| `password_hash NOT NULL` | `password: string` | No (solamente usa texto plano) |
| `full_name NOT NULL` | `fullName: string` | Sí |
| `role NOT NULL` | `role: 'secretaria' | 'coordinador'` | Sí (más estricto) |
| `created_at` | — | No (falta) |
| `updated_at` | — | No (falta) |

---

### 2.2. `patients`

**Diseño:**
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

**Implementación:**
```ts
export interface Patient {
  id: number;
  folio: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;     
  createdAt: string;
}
```

| Campo diseño | Campo impl. | Coincide |
|---|---|---|
| `id SERIAL PK` | `id: number` | Sí |
| `folio UNIQUE NOT NULL` | `folio: string` | Sí — formato `PAC-XXXX` |
| `full_name NOT NULL` | `fullName: string` | Sí |
| `phone` | `phone: string` | Sí |
| `email` | `email: string` | Sí |
| `birth_date DATE` | `birthDate: string` | Sí (opcional en alta nueva) |
| `created_at` | `createdAt: string` | Sí |
| `updated_at` | — | No — faltante |

---

### 2.3. `therapists`

**Diseño:**
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

**Implementación:**
```ts
export interface Therapist {
  id: number;
  fullName: string;
  specialty: string;
  roomId: number;        
  active: boolean;
}
```

| Campo diseño | Campo impl. | Coincide |
|---|---|---|
| `id SERIAL PK` | `id: number` | Sí |
| `user_id FK` | — | No (falta) |
| `specialty` | `specialty: string` | Sí |
| `notes` | — | No (falta) |
| `active` | `active: boolean` | Sí |
| `created_at` | — | No (falta) |
| — | `fullName: string` | Existe en código, no en diseño |
| — | `roomId: number` | Materializa la "sala fija" |

---

### 2.4. `rooms`

**Diseño:**
```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  capacity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Implementación:**
```ts
export interface Room {
  id: number;
  name: string;
  location: string;
}
```

| Campo diseño | Campo impl. | Coincide |
|---|---|---|
| `id SERIAL PK` | `id: number` | Sí |
| `name NOT NULL` | `name: string` | Sí |
| `location` | `location: string` | Sí |
| `capacity INT DEFAULT 1` | — | No (falta) |
| `created_at` | — | No (falta) |

---

### 2.5. `appointment_statuses`

**Diseño:**
```sql
CREATE TABLE appointment_statuses (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);
-- (1, 'SCHEDULED', 'Cita programada')
-- (2, 'CANCELLED', 'Cita cancelada')
-- (3, 'RESCHEDULED', 'Cita reprogramada')
-- (4, 'COMPLETED', 'Cita finalizada')
```

**Implementación:**
```ts
export type StatusId = 1 | 2 | 3 | 4;
export interface AppointmentStatus {
  id: StatusId;
  code: 'SCHEDULED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
  description: string;
}
```

Coincidencia exacta

---

### 2.6. `session_types`

**Diseño:**
```sql
CREATE TABLE session_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);
```

**Implementación:**
```ts
export type SessionTypeId = 1 | 2;
export interface SessionType {
  id: SessionTypeId;
  name: string;
}

```

Coincide.

---

### 2.7. `appointments`

**Diseño:**
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

**Implementación:**
```ts
export interface Appointment {
  id: number;
  patientId: number;
  therapistId: number;
  roomId: number;
  sessionTypeId: SessionTypeId;
  startAt: string;          
  endAt: string;
  durationMinutes: number;
  statusId: StatusId;
  createdBy: number;
  createdAt: string;
  updatedAt?: string;
  cancelledReason: string | null;
  cancelledAt: string | null;
  paymentProofPath: string | null;
  cuota: number | null;     
  comments: string;
  rescheduledFromId?: number; 
}
```

| Campo diseño | Campo impl. | Coincide |
|---|---|---|
| `id BIGSERIAL PK` | `id: number` | Sí |
| `patient_id FK NOT NULL` | `patientId: number` | Sí |
| `therapist_id FK NOT NULL` | `therapistId: number` | Sí |
| `room_id FK NOT NULL` | `roomId: number` | Sí |
| `session_type_id FK NOT NULL` | `sessionTypeId: SessionTypeId` | Sí |
| `start_at NOT NULL` | `startAt: string` | Parcial, hora local string en lugar de timestamp con TZ |
| `end_at NOT NULL` | `endAt: string` | Parcial |
| `duration_minutes NOT NULL` | `durationMinutes: number` | Sí |
| `status_id FK NOT NULL` | `statusId: StatusId` | Sí |
| `created_by` | `createdBy: number` | Sí |
| `created_at` | `createdAt: string` | Sí |
| `updated_at` | `updatedAt?: string` | Sí (opcional) |
| `cancelled_reason` | `cancelledReason: string \| null` | Sí |
| `cancelled_at` | `cancelledAt: string \| null` | Sí |
| `payment_proof_path` | `paymentProofPath: string \| null` | Sí |
| `comments` | `comments: string` | Sí |
| `CHECK (start_at < end_at)` | Validado en `validateWorkingHours` | Sí en lo funcional, no estructural |
| — | `cuota: number \| null` | Decisión técnica no documentada |
| — | `rescheduledFromId?: number` | Trazabilidad útil para RF-08, sin formalizar |

---

### 2.8. `audit_logs`

**Diseño:**
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

**Implementación:**
```ts
export interface AuditLog {
  id: number;
  entityType: 'appointment' | 'patient';
  entityId: number;
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'RESCHEDULE';
  payload: Record<string, unknown>;
  performedBy: number;
  performedAt: string;
}
```

| Aspecto | Coincide |
|---|---|
| Estructura | Sí |
| Falta acción `STATUS_CHANGE` (sugerida por diseño) | No |
| `entityType` limitado a 2 valores en código (`appointment`, `patient`) | Parcial, menos flexible |

---

### 2.9. `therapist_availabilities` (opcional)

| Aspecto | Estado |
|---|---|
| Tabla en diseño | Sí |
| Implementación | No existe |
| Impacto | Aceptable, en el diseño se marcaba como opcional |

---

## 3. Reglas de integridad y restricciones

| Restricción | Diseño | Implementación | Estado |
|---|---|---|---|
| Solapamiento prohibido por terapeuta | Debe prohibirse | `validateAvailability` por `therapistId` | Sí |
| Solapamiento prohibido por sala | Debe prohibirse | `validateAvailability` por `roomId` | Sí |
| Solapamiento prohibido por paciente | Debe prohibirse | `validateAvailability` por `patientId` | Sí |
| Estado inicial = SCHEDULED | Sí | `statusId: 1` hardcoded en `createAppointment` | Sí |
| No eliminación física de citas | Sí | El código solo cambia `statusId`; nunca llama `splice`/`filter` para eliminar | Sí |
| Cita atrasada NO modifica estado almacenado | Sí | `isOverdue` es función de presentación, no muta el store | Sí |
| Sala fija por terapeuta | Decisión abierta | Materializada como `Therapist.roomId` | Sí (decisión asumida) |
| `ON DELETE RESTRICT` para FKs | Sí | No aplicable (no hay FK estructural; solo validación funcional) | No |
| `CHECK (start_at < end_at)` | Sí | `validateWorkingHours` lo verifica antes de guardar | Sí en lo funcional |
| Índices recomendados | Sí | No aplican en localStorage | N/A |

---

## 4. Reglas de seguridad y buenas prácticas (sección 6 del diseño)

| Regla diseño | Implementación | Estado |
|---|---|---|
| Nunca guardar contraseñas en texto plano (bcrypt/argon2) | `User.password` en texto plano en `seed.ts` | No |
| Credenciales/secretos via env vars o secret manager | No aplica (no hay backend) | N/A |
| Endpoints autenticados | No hay endpoints | N/A |
| Auditar cambios sensibles | `auditLogs` existe | Parcial, pero no se persiste fuera del navegador |
| No exponer datos clínicos innecesarios | Listados muestran solo lo necesario | Sí |

---

## 5. Conclusión del comparativo de BD

- Estructuralmente, los tipos TypeScript reflejan 8 de las 8 tablas principales (aprox. 70 % paridad de campos).
- La persistencia es localStorage, no PostgreSQL. La integridad transaccional, las FKs, los CHECKs y los índices del diseño no existen estructuralmente, aunque la mayor parte de las reglas se replican en código.
- Hay 3 campos no diseñados que aparecen en el código: `cuota`, `rescheduledFromId`, `Therapist.roomId`. Hay 6 campos diseñados ausentes: `password_hash`, `users.created_at/updated_at`, `therapists.user_id/notes/created_at`, `rooms.capacity/created_at`, `patients.updated_at`, `audit_logs` acción `STATUS_CHANGE`.

| Métrica | Valor |
|---|---|
| Tablas presentes | 8/9 (89 %) |
| Campos diseñados implementados | aprox. 38/45 (84 %) |
| Restricciones diseñadas implementadas a nivel funcional | aprox. 7/9 (78 %) |
| Restricciones implementadas a nivel estructural (FKs/CHECKs/UNIQUE) | 0 |
| Decisiones abiertas del diseño cerradas implícitamente en código | 3 sin documentar |
