# Sistema de Agenda de Citas - Clínica Psicológica Cambranes

Aplicación completa de gestión de citas para una clínica psicológica, construida con **Spring Boot 3.2**, **Java 17**, **Thymeleaf** y **PostgreSQL/H2**.

## 📋 Descripción

Sistema web que permite:
- ✅ Crear citas sin conflictos de horario (RF-01)
- ✅ Validar horario laboral y rango de fechas (RF-03)
- ✅ Vista previa antes de confirmar (RF-02)
- ✅ Generar folios únicos para pacientes (RF-04)
- ✅ Registrar nuevos pacientes (RF-05)
- ✅ Ver detalles de citas (RF-06)
- ✅ Indicadores visuales de citas atrasadas (RF-07)
- ✅ Reprogramar citas (RF-08)
- ✅ Cancelar citas con justificación (RF-09)
- ✅ Auditoría completa de cambios (RNF-04)
- ✅ Control de acceso por rol (RNF-02)

## 🚀 Inicio Rápido

### Sin Docker (Recomendado para desarrollo)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

Abre: http://localhost:8080

Credenciales demo:
- Email: `secretaria@clinica.local`
- Contraseña: `password123`

### Con Docker

```bash
docker compose up
```

Abre: http://localhost:8080

## 📚 Documentación

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Documentación técnica completa
  - Stack tecnológico
  - Arquitectura y patrones
  - Esquema de base de datos
  - Decisiones de diseño
  - Reglas de negocio
  - Mapeo RF/RNF a código

- **[SETUP_LOCAL.md](./SETUP_LOCAL.md)** - Guía paso a paso
  - Requisitos previos
  - Instrucciones para Windows/Mac/Linux
  - Troubleshooting
  - Pruebas de funcionalidad

## 🔧 Requisitos Previos

### Opción A (Sin Docker)
- Java 17+ ([Descargar](https://adoptium.net))
- Maven 3.8+ ([Descargar](https://maven.apache.org))
- Git

### Opción B (Con Docker)
- Docker Desktop ([Descargar](https://www.docker.com/products/docker-desktop))
- Git

## 📁 Estructura del Proyecto

```
agenda-citas-cambranes/
├── backend/
│   ├── pom.xml                           # Dependencias Maven
│   ├── Dockerfile                        # Multi-stage build
│   ├── src/main/java/com/clinica/agenda/
│   │   ├── config/                       # Configuración Spring
│   │   ├── model/                        # Entidades JPA
│   │   ├── repository/                   # Data Access Layer
│   │   ├── service/                      # Lógica de negocio
│   │   ├── security/                     # Spring Security
│   │   ├── exception/                    # Manejo de errores
│   │   ├── dto/                          # Form bindings
│   │   └── web/                          # Controllers
│   ├── src/main/resources/
│   │   ├── templates/                    # Thymeleaf HTML
│   │   ├── static/styles.css             # Estilos CSS
│   │   ├── application.yml               # Config principal
│   │   ├── logback-spring.xml            # Logging
│   │   └── db/migration/                 # SQL Flyway
│   └── target/                           # Compilado (generado)
├── docker-compose.yml                    # Orquestación Docker
├── DEVELOPMENT.md                        # Documentación técnica
├── SETUP_LOCAL.md                        # Guía local
└── README.md                             # Este archivo
```

## 🏗️ Arquitectura

```
Thymeleaf Templates (HTML)
         ↓
Spring Web MVC Controllers
         ↓
Service Layer (Lógica negocio)
         ↓
Spring Data Repositories (JPA)
         ↓
PostgreSQL / H2 Database
```

## 🔐 Seguridad

- **Autenticación**: Spring Security form-based login
- **Hashing**: BCrypt para contraseñas
- **CSRF**: Protección nativa habilitada
- **Autorización**: Roles SECRETARY / COORDINATOR
- **Auditoría**: Todos cambios registrados con usuario y timestamp

## 📊 Base de Datos

Tablas principales: `users`, `patients`, `therapists`, `rooms`, `appointments`, `audit_logs`

Esquema completo en: [DEVELOPMENT.md](./DEVELOPMENT.md#esquema-de-base-de-datos)

## 🧪 Verificar Que Funciona

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Login
Abre http://localhost:8080/login con credenciales demo

## 📖 Documentación Detallada

La documentación del proyecto está en:
* [DEVELOPMENT.md](./DEVELOPMENT.md) - Técnica y arquitectura
* [SETUP_LOCAL.md](./SETUP_LOCAL.md) - Guía local paso a paso
* `/docs/` - Requisitos, modelado, diseño

---

**Versión**: 1.0.0 | **Stack**: Spring Boot 3.2.5 + Java 17 + Thymeleaf | **BD**: PostgreSQL/H2
