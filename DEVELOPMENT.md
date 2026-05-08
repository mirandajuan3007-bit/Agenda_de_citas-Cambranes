# Documentación de Desarrollo - Sistema de Agenda de Citas

## Descripción General del Proyecto

Sistema completo de gestión de citas para una clínica psicológica, con interfaz web para secretarias y coordinadores. Permite programar, reprogramar y cancelar citas respetando restricciones de disponibilidad, horario laboral y reglas de negocio específicas.

**Propósito**: Automatizar la gestión de citas terapéuticas con validaciones complejas y un sistema de auditoría completo.

---

## Stack Tecnológico

### Backend
- **Framework**: Spring Boot 3.2.5
- **Lenguaje**: Java 17
- **Build**: Maven
- **Web**: Spring MVC + Thymeleaf (renderizado servidor)
- **Base de datos**: PostgreSQL (producción), H2 (desarrollo local)
- **Migraciones**: Flyway
- **Seguridad**: Spring Security 6.x (form-based login, BCrypt)
- **ORM**: JPA/Hibernate
- **Logging**: SLF4J con Logback (salida JSON en producción)
- **Validación**: Spring Validation (Jakarta Bean Validation)

### Frontend
- **Motor de templates**: Thymeleaf
- **Estilos**: CSS puro (minimalista y sobrio)
- **JavaScript**: Ninguno (todas interacciones mediante forms HTML)

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Orquestación local**: Docker Compose

---

## Requisitos Funcionales (RF) Implementados

| RF | Descripción | Implementación |
|---|---|---|
| **RF-01** | Evitar citas duplicadas (sin solapamiento de horas) | `AvailabilityService.assertResourcesFree()` verifica overlaps en therapist, room y patient |
| **RF-02** | Pantalla de resumen antes de confirmar cita | `AppointmentWebController` genera token UUID, `summary.html` muestra preview |
| **RF-03** | Validar disponibilidad (horario laboral, rango de fechas) | `AvailabilityService.validateTimeWindow()` verifica 9:00-17:30 lunes-viernes, 0-90 días adelante |
| **RF-04** | Generar folio único para paciente | `FolioGenerator` crea PAC-YYYYMMDD-NNNN por paciente |
| **RF-05** | Permitir registrar nuevos pacientes | `PatientWebController` + `PatientService` |
| **RF-06** | Ver detalles de cita | `AppointmentWebController` GET `/{id}` renderiza `detail.html` |
| **RF-07** | Indicar visualmente citas atrasadas | `AppointmentService.isLate()` marca status SCHEDULED con startAt en pasado |
| **RF-08** | Reprogramar citas | `AppointmentWebController` POST `/reprograma/{id}`, archiva original como RESCHEDULED, crea nueva |
| **RF-09** | Cancelar citas | `AppointmentWebController` POST `/cancel/{id}`, registra razón y usuario |

---

## Requisitos No Funcionales (RNF) Implementados

| RNF | Descripción | Implementación |
|---|---|---|
| **RNF-02** | Control de acceso por rol (Secretaria/Coordinador) | `SecurityConfig` + `@PreAuthorize` en endpoints |
| **RNF-04** | Auditoría y logging estructurado (JSON) | `AuditService` registra cambios; `logback-spring.xml` emite JSON en producción |
| **RNF-06** | Interfaz intuitiva | `layout.html` fragments reutilizables, paleta de colores consistente, mensajes flash claros |
| **RNF-07** | Indicadores visuales para citas atrasadas | Badges en rojo, clase CSS `row-late` en tablas |
| **RNF-09** | Interfaz sobria sin complejidad innecesaria | Sin JavaScript frameworks; CSS minimalista |

---

## Arquitectura y Patrones

### Capas

```
Controllers (Thymeleaf Web)
    ↓
Services (Lógica de negocio)
    ↓
Repositories (Data Access)
    ↓
Database (PostgreSQL / H2)
```

### Flujos Principales

#### 1. Crear Cita (RF-01, RF-02, RF-03, RF-04)
```
GET /appointments/new
  → Renderiza formulario con types (EVALUATION/THERAPY)
  
POST /appointments/new (form data + token UUID)
  → Valida con AvailabilityService
  → Genera folio si es EVALUATION (RF-04)
  → Almacena en sesión con token
  → Redirige a /summary/{token}
  
GET /appointments/summary/{token}
  → Renderiza preview de datos (RF-02)
  
POST /appointments/confirm/{token}
  → AppointmentService.create()
  → Guarda cita, audita acción
  → Redirige a /appointments/{id}
```

#### 2. Reprogramar Cita (RF-08)
```
GET /appointments/{id}
  → Renderiza formulario de reprogramación
  
POST /appointments/{id}/reschedule
  → AppointmentService.reschedule()
  → Archiva original con status RESCHEDULED
  → Crea nueva cita con mismos datos (excepto fecha/hora)
  → Audita ambas operaciones
```

#### 3. Cancelar Cita (RF-09)
```
POST /appointments/{id}/cancel
  → Valida que no esté iniciada
  → AppointmentService.cancel()
  → Marca status CANCELLED, registra razón y usuario
  → Audita acción
```

### Validaciones Centralizadas

**AvailabilityService** (RF-03):
- Horario laboral: 09:00-17:30
- Días laborales: lunes-viernes
- Rango de fechas: hoy a 90 días adelante
- Sin solapamientos con other appointments (therapist, room, patient)
- Max 3 citas pendientes por paciente

**AppointmentService**:
- Integridad referencial (patient, therapist, room, sessionType existen)
- Duración > 0 minutos
- Atomicidad: reschedule = archive + create

---

## Esquema de Base de Datos

### Tablas Principales

#### **users**
- `id` (INT, PK)
- `email` (VARCHAR UNIQUE) - Identificador login
- `password_hash` (VARCHAR) - BCrypt
- `full_name`, `role` (SECRETARY/COORDINATOR), `active`
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

#### **patients**
- `id` (INT, PK)
- `folio` (VARCHAR UNIQUE) - PAC-YYYYMMDD-NNNN (generado por FolioGenerator)
- `full_name`, `phone`, `email`, `birth_date`
- `created_at`, `updated_at`

#### **therapists**
- `id` (INT, PK)
- `user_id` (INT, FK → users) - Usuario login del terapeuta
- `full_name`, `specialty`
- `room_id` (INT UNIQUE, FK → rooms) - 1:1 con sala
- `active`
- `created_at`

#### **rooms**
- `id` (INT, PK)
- `name`, `location`, `capacity`
- `created_at`

#### **appointments**
- `id` (BIGINT, PK)
- `patient_id`, `therapist_id`, `room_id`, `session_type_id` (FKs)
- `start_at`, `end_at` (TIMESTAMP WITH TIME ZONE)
- `duration_minutes`
- `status_id` (FK → appointment_statuses)
- `created_by`, `created_at`, `updated_at`
- `cancelled_reason`, `cancelled_at`, `cancelled_by`
- `rescheduled_to_id` (FK → appointments, self-referencing)
- `payment_proof_path`, `fee`, `comments`
- **Indices**: start_at, (therapist_id, start_at), (room_id, start_at), (patient_id, start_at), status_id

#### **appointment_statuses**
- `id` (SMALLINT, PK)
- `code` (VARCHAR UNIQUE) - SCHEDULED, CANCELLED, RESCHEDULED, COMPLETED
- `description`

#### **session_types**
- `id` (INT, PK)
- `name` - "Evaluacion inicial", "Sesion terapeutica"

#### **audit_logs**
- `id` (BIGINT, PK)
- `entity_type`, `entity_id` (BIGINT)
- `action` - CREATE, UPDATE, CANCEL, RESCHEDULE
- `payload` (VARCHAR, JSON opcional)
- `performed_by` (INT, FK → users)
- `performed_at` (TIMESTAMP WITH TIME ZONE)
- **Index**: (entity_type, entity_id)

---

## Estructura de Archivos

```
backend/
├── pom.xml                                    # Configuración Maven
├── Dockerfile                                 # Multi-stage build (Maven + JRE)
├── src/main/java/com/clinica/agenda/
│   ├── AgendaApplication.java                 # @SpringBootApplication
│   ├── config/
│   │   ├── BusinessProperties.java            # @ConfigurationProperties para agenda.business.*
│   │   ├── SecurityConfig.java                # @Configuration Spring Security (form login)
│   │   └── DataInitializer.java               # CommandLineRunner para seeding inicial
│   ├── enums/
│   │   ├── Role.java                          # SECRETARY, COORDINATOR
│   │   └── AppointmentStatusCode.java         # SCHEDULED, CANCELLED, RESCHEDULED, COMPLETED
│   ├── model/
│   │   ├── User.java, Patient.java, Therapist.java, Room.java
│   │   ├── Appointment.java, AppointmentStatus.java, SessionType.java
│   │   └── AuditLog.java
│   ├── repository/
│   │   ├── UserRepository.java                # findByEmailIgnoreCase()
│   │   ├── PatientRepository.java             # findByFolio(), search()
│   │   ├── TherapistRepository.java
│   │   ├── RoomRepository.java
│   │   ├── SessionTypeRepository.java
│   │   ├── AppointmentStatusRepository.java
│   │   ├── AppointmentRepository.java         # findOverlappingByTherapist/Room/Patient()
│   │   └── AuditLogRepository.java
│   ├── service/
│   │   ├── AvailabilityService.java           # Validaciones RF-03 (horario, overlaps, límites)
│   │   ├── AppointmentService.java            # CRUD citas (create, reschedule, cancel, isLate)
│   │   ├── PatientService.java                # CRUD pacientes
│   │   ├── AuditService.java                  # Auditoría RNF-04
│   │   └── FolioGenerator.java                # Generador PAC-YYYYMMDD-NNNN RF-04
│   ├── security/
│   │   ├── AppUserDetails.java                # UserDetails wrapper con getId(), getFullName()
│   │   └── AppUserDetailsService.java         # UserDetailsService para autenticación
│   ├── exception/
│   │   ├── BusinessException.java
│   │   ├── ConflictException.java
│   │   ├── NotFoundException.java
│   │   └── GlobalExceptionHandler.java        # @ControllerAdvice, manejo RNF-04
│   ├── dto/
│   │   ├── AppointmentForm.java               # Binding form POST /appointments/new
│   │   ├── RescheduleForm.java
│   │   ├── CancelForm.java
│   │   └── PatientForm.java
│   └── web/
│       ├── AuthWebController.java             # GET /login
│       ├── DashboardWebController.java        # GET / (KPIs, upcoming)
│       ├── AppointmentWebController.java      # GET/POST citas (RF-01 a RF-09)
│       ├── PatientWebController.java          # GET/POST pacientes
│       └── GlobalModelAttributes.java         # Inyecta currentUser
│
├── src/main/resources/
│   ├── application.yml                        # Config principal
│   ├── application-local.yml                  # H2 en memoria
│   ├── application-docker.yml                 # PostgreSQL en Docker
│   ├── logback-spring.xml                     # Logging JSON (RNF-04)
│   ├── templates/
│   │   ├── layout.html                        # Fragments reutilizables
│   │   ├── auth/login.html
│   │   ├── dashboard/index.html               # RF-07 (late count)
│   │   ├── appointments/
│   │   │   ├── new.html                       # Formulario de cita (RF-02)
│   │   │   ├── summary.html                   # Preview antes confirmar (RF-02)
│   │   │   ├── list.html                      # Listado con late badges (RF-07)
│   │   │   └── detail.html                    # Detalle + reprogramar/cancelar (RF-08, RF-09)
│   │   ├── patients/
│   │   │   ├── new.html
│   │   │   └── list.html
│   │   └── error/generic.html
│   ├── static/
│   │   ├── styles.css                         # Minimalista, sobrio (RNF-09)
│   │   └── js/ (vacío)
│   └── db/
│       ├── migration/
│       │   ├── V1__schema.sql                 # PostgreSQL schema
│       │   └── V2__seed.sql                   # Demo data
│       └── migration_h2/
│           ├── V1__schema.sql                 # H2 schema (GENERATED BY DEFAULT AS IDENTITY)
│           └── V2__seed.sql                   # Demo data H2
│
├── src/test/java/                             # Tests (estructura similar)
│
└── .gitignore                                 # target/, .idea/, logs/
```

---

## Decisiones de Diseño

### 1. ¿Por qué Thymeleaf en lugar de REST API + Frontend Framework?
- **Simplicidad**: Renderizado servidor = menos complejidad en arquitectura
- **UX mínima**: Requerimiento de interfaz "sobria" sin frameworks pesados (React, Vue)
- **Seguridad**: Form submission → CSRF protection nativa en Spring Security
- **Deployment**: Una sola aplicación Java, no 2 servicios separados

### 2. ¿Por qué dos perfiles de base de datos?
- **Local (H2)**: Sin dependencias externas, start rápido para desarrollo
- **Docker (PostgreSQL)**: Producción realista, migraciones y datos persistentes
- Flyway maneja ambos: `db/migration/` (PostgreSQL), `db/migration_h2/` (H2)

### 3. ¿Por qué CommandLineRunner en DataInitializer?
- Demo credentials ("password123") deben funcionar inmediatamente tras clon
- BCrypt es determinístico solo dentro de Spring; seed data podría tener hash incorrecto
- DataInitializer re-codifica al startup, garantiza acceso siempre

### 4. ¿Por qué índices específicos en appointments?
- `start_at`: Búsqueda de citas en rango de fechas
- `(therapist_id, start_at)`: Detección rápida de overlaps por terapeuta (RF-01)
- `(room_id, start_at)`: Detección de overlaps por sala
- `(patient_id, start_at)`: Detección de overlaps por paciente + conteo de pendientes
- `status_id`: Filtros por estado

### 5. ¿Por qué self-referencing en rescheduled_to_id?
- Auditoría completa: original cita queda como RESCHEDULED, nueva cita referencia a la anterior
- Permite rastrear cadena de reprogramaciones

---

## Reglas de Negocio Críticas

### Horario Laboral (RF-03)
```
Lunes-viernes: 09:00 - 17:30
Fuera de rango o fines de semana: BusinessException
```

### Rango de Fechas (RF-03)
```
Mínimo: hoy (0 días adelante)
Máximo: 90 días adelante
Fuera de rango: BusinessException
```

### Sin Solapamientos (RF-01)
```
Para cita (start_at, end_at, therapist, room, patient):
  ✗ Terapeuta ocupado en ese horario
  ✗ Sala ocupada en ese horario
  ✗ Paciente con otra cita en ese horario
  → ConflictException
```

### Máximo Pendientes por Paciente (RF-03)
```
Si paciente ya tiene 3 citas con status SCHEDULED/RESCHEDULED:
  → ConflictException
```

### Folio Único (RF-04)
```
Formato: PAC-YYYYMMDD-NNNN
  - YYYYMMDD = fecha de creación del paciente
  - NNNN = secuencial por día (0001, 0002, ...)
  - Único a nivel global
```

### Cancelación (RF-09)
```
Solo si start_at > ahora (cita no ha iniciado)
Requiere reason (campo obligatorio)
Audita: cancelled_by, cancelled_at, cancelled_reason
```

### Reprogramación (RF-08)
```
Cita original: status = RESCHEDULED, rescheduled_to_id = nueva cita
Nueva cita: status = SCHEDULED (hereda patient, therapist, pero permite cambiar room/date/time)
Audita ambas operaciones
```

---

## Configuración y Variables de Entorno

### application.yml (valores por defecto)
```yaml
agenda:
  business:
    work-start: "09:00"           # Inicio jornada
    work-end: "17:30"             # Fin jornada
    work-days: MONDAY,TUESDAY,... # Días laborales
    max-pending-per-patient: 3    # RF-03
    min-days-ahead: 0             # Hoy
    max-days-ahead: 90            # RF-03
    timezone: "America/Mexico_City"
```

### Docker Compose
```yaml
services:
  postgres:
    image: postgres:16
    ports: 5432:5432
    env: POSTGRES_PASSWORD=agenda, POSTGRES_DB=agenda
    
  app:
    build: ./backend
    ports: 8080:8080
    env: SPRING_PROFILES_ACTIVE=docker
    depends_on: postgres
```

### Perfiles Spring activos
- **local** (default): H2 en memoria, sin HTTPS, logs en texto
- **docker**: PostgreSQL en Docker, HTTPS preparado, logs en JSON

---

## Seguridad

### Autenticación
- Form-based login: `/login` → POST `/login` (Spring Security estándar)
- Password hashing: BCrypt ($2a$10$...)
- Demo credentials: `secretaria@clinica.local` / `password123`

### Autorización
- Roles: SECRETARY, COORDINATOR
- AccessControl: `@PreAuthorize("hasAnyRole('SECRETARY', 'COORDINATOR')")` en endpoints sensibles
- CSRF: Habilitado por defecto

### Auditoría (RNF-04)
- Todas acciones: CREATE, UPDATE, CANCEL, RESCHEDULE registradas en `audit_logs`
- Payload: JSON con cambios (antes/después)
- Trazabilidad: `performed_by`, `performed_at`

---

## Observabilidad

### Health Check (RNF-04)
```
GET /actuator/health
Respuesta: { "status": "UP", "components": { "db": { "status": "UP" } } }
```

### Logging (RNF-04)
- **Local**: Texto legible (stdout)
- **Producción**: JSON estructurado (compatible ELK/Splunk)
- Niveles: DEBUG (local), INFO (producción)

### Métricas
```
GET /actuator/metrics
- jvm.memory.*, http.server.requests, db.connection.pool.*
```

---

## Credenciales Demo

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| María López | `secretaria@clinica.local` | `password123` | SECRETARY |
| Carlos López | `coordinador@clinica.local` | `password123` | COORDINATOR |

---

## Próximos Pasos / Mejoras Futuras

1. **Tests unitarios e integración**: JUnit 5, Mockito, TestContainers
2. **Reportes**: Citas por terapeuta, ocupación de salas, etc.
3. **Notificaciones**: Email/SMS a pacientes
4. **API REST**: Consumo desde apps móviles
5. **Multi-idioma**: Internacionalización (i18n)
6. **Sincronización con Google Calendar**: Integración externa
7. **SPA Frontend**: Migrar a React/Vue si crece complejidad

---

## Referencias de Requisitos

| Requisito | Archivo(s) | Líneas relevantes |
|---|---|---|
| **RF-01** (No duplicados) | `AvailabilityService.java` | `assertResourcesFree()` |
| **RF-02** (Resumen) | `AppointmentWebController.java` | GET `/summary/{token}` |
| **RF-03** (Validación) | `AvailabilityService.java` | `validateTimeWindow()`, `assertWithinPendingLimit()` |
| **RF-04** (Folio) | `FolioGenerator.java` | `generate()` |
| **RF-05** (Pacientes) | `PatientService.java` | `registerNew()`, `search()` |
| **RF-06** (Detalles) | `AppointmentWebController.java` | GET `/{id}` |
| **RF-07** (Atrasadas) | `AppointmentService.java` | `isLate()`, templates |
| **RF-08** (Reprogramar) | `AppointmentService.java`, `AppointmentWebController.java` | `reschedule()` |
| **RF-09** (Cancelar) | `AppointmentService.java`, `AppointmentWebController.java` | `cancel()` |
| **RNF-02** (Autorización) | `SecurityConfig.java` | `@PreAuthorize` |
| **RNF-04** (Auditoría) | `AuditService.java`, `GlobalExceptionHandler.java` | Logging RNF-04 |
| **RNF-06** (UX) | `layout.html`, `styles.css` | Fragments, paleta colores |
| **RNF-07** (Visual late) | `AppointmentService.isLate()`, templates | Badges rojos |
| **RNF-09** (Sobrio) | `styles.css` | Sin frameworks JS |
