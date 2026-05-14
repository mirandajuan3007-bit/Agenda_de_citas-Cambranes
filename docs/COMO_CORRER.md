# Cómo correr el proyecto

## Requisitos
- Docker Desktop (Windows / Mac) o Docker Engine + docker-compose plugin (Linux).

## Arranque con un solo comando

Desde la raíz del repo:

```bash
docker compose up --build
```

Esto levanta tres contenedores:

| Servicio  | Puerto host | Descripción                       |
| --------- | ----------- | --------------------------------- |
| mysql     | 3307        | Base de datos MySQL 8             |
| backend   | 8080        | API Spring Boot                   |
| frontend  | 8081        | UI servida por nginx con proxy /api |

Abre el navegador en **http://localhost:8081**.

## Credenciales demo

| Rol         | Email                     | Password         |
| ----------- | ------------------------- | ---------------- |
| Secretaria  | secretaria@clinica.mx     | secretaria123    |
| Coordinador | coordinador@clinica.mx    | coordinador123   |

## Endpoints principales

Base: `http://localhost:8080/api`

- `POST   /auth/login` — devuelve datos del usuario.
- `GET    /patients`, `GET /patients/search?q=...`, `POST /patients`.
- `GET    /patients/{id}/appointments`.
- `GET    /appointments?date=YYYY-MM-DD` (o `from`/`to`).
- `POST   /appointments/check` — valida sin crear (devuelve lista de conflictos).
- `POST   /appointments` — crea cita.
- `POST   /appointments/{id}/cancel` — cancela.
- `POST   /appointments/{id}/reschedule` — reprograma.
- `POST   /appointments/{id}/complete` — marca completada.
- `GET    /therapists`, `/rooms`, `/session-types`, `/appointment-statuses`.

Todos los endpoints (excepto `/auth/login`) requieren el header `X-User-Id`.

## Detener y limpiar

```bash
docker compose down          # detener
docker compose down -v       # detener y borrar el volumen MySQL
```
