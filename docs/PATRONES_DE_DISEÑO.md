# Patrones de diseño aplicados

Documento dedicado a explicar **qué** patrones de diseño se usaron en el backend, **dónde** viven en el código y **por qué** se eligieron para resolver el problema concreto.

> Los patrones están concentrados en el backend (Spring Boot). El frontend usa adaptadores simples — su complejidad no justifica patrones formales.

---

## 1. Strategy (Estrategia)

**Para qué se usó:** validar las reglas de negocio de una cita (horario laboral, solape de terapeuta / sala / paciente, límite de citas pendientes) sin meter todos los `if`s en el service.

**Dónde:**
- `backend/src/main/java/mx/clinica/cambranes/agenda/domain/validation/AppointmentValidator.java` — interfaz común.
- `domain/validation/rules/WorkingHoursValidator.java` — valida lunes–viernes y rango 09:00–17:30.
- `domain/validation/rules/OverlapValidator.java` — detecta solape de terapeuta, sala y paciente con una sola consulta.
- `domain/validation/rules/PatientLimitValidator.java` — impide más de 3 citas programadas por paciente.

**Por qué aquí:**
Las reglas tienen entrada y salida idénticas (un `ValidationContext` → lista de errores) pero su lógica interna es completamente distinta. Strategy permite escribir cada regla en su propia clase con tests aislados; agregar una regla nueva (por ejemplo "no permitir citas en festivos") es solo crear otro `@Component` que implemente `AppointmentValidator`. Spring lo descubre automáticamente y el resto del sistema no cambia.

---

## 2. Chain of Responsibility (Cadena de Responsabilidad)

**Para qué se usó:** ejecutar las estrategias de validación en un orden determinista y acumular todos los errores en una sola llamada.

**Dónde:**
- `domain/validation/AppointmentValidationChain.java` — orquesta la cadena.
- Se invoca desde `service/AppointmentService.create(…)` y `service/AppointmentService.reschedule(…)`.

**Por qué aquí:**
Distintas operaciones (crear vs reprogramar) necesitan el mismo conjunto de validaciones. Centralizar la cadena evita duplicar el orden de evaluación en cada caso de uso. La anotación `@Order` en cada validador define la prioridad (horario → solape → límite) sin acoplarlos entre sí.

---

## 3. State (Estado)

**Para qué se usó:** modelar las transiciones permitidas de una cita (`SCHEDULED → CANCELLED / RESCHEDULED / COMPLETED`) sin escribir un `switch` gigante en el service.

**Dónde:**
- `domain/state/AppointmentState.java` — interfaz con `cancel`, `complete`, `reschedule`.
- `domain/state/ScheduledState.java` — único estado que acepta transiciones.
- `domain/state/TerminalState.java` + `CancelledState`, `RescheduledState`, `CompletedState` — rechazan cualquier transición con mensaje específico.
- `domain/state/AppointmentStateResolver.java` — resuelve el `AppointmentState` correcto a partir de la cita.

**Por qué aquí:**
Las reglas del proyecto dicen que una cita **nunca** se borra: cambia de estado. Si esa lógica vive dispersa en el service, es muy fácil olvidarla. Poniendo cada estado como una clase, el intento de cancelar una cita ya cancelada lanza `IllegalStateTransitionException` automáticamente — el service ni siquiera tiene que preguntarse en qué estado está.

---

## 4. Factory (Fábrica)

**Para qué se usó:** construir objetos `Appointment` con sus invariantes (estado inicial `SCHEDULED`, `endAt = startAt + duración`, herencia de datos al reprogramar) en un solo lugar.

**Dónde:**
- `domain/factory/AppointmentFactory.java` — métodos `newScheduled(…)` y `fromReschedule(…)`.

**Por qué aquí:**
Sin esto, cada vez que `AppointmentService` quisiera crear una cita tendría que recordar (a) pedirle al repo el estado SCHEDULED, (b) calcular `endAt`, (c) inicializar `comments` a `""`, etc. La factory garantiza que estos detalles no se filtren. Al reprogramar, además, `fromReschedule` asegura que la nueva cita herede paciente, terapeuta y sala del original — imposible olvidarlo desde el call site.

---

## 5. Observer / Event Bus

**Para qué se usó:** registrar automáticamente en `audit_logs` cada acción importante (crear, cancelar, reprogramar, completar cita y crear paciente) sin que los services tengan que llamar al `AuditLogRepository` ellos mismos.

**Dónde:**
- `domain/event/AppointmentEvent.java` + `PatientEvent.java` — eventos de dominio.
- `domain/event/AuditLogListener.java` — observer (`@EventListener`) que persiste el audit log.
- Los services publican con `ApplicationEventPublisher.publishEvent(...)`.

**Por qué aquí:**
La trazabilidad es un requisito transversal. Mezclarla con la lógica de negocio acopla los services al audit y rompe la regla de responsabilidad única. Con eventos, agregar un nuevo "listener" (por ejemplo, enviar correo o notificar a otro sistema) es escribir un `@Component` con `@EventListener`. Los services ni se enteran.

---

## 6. Repository (Repositorio)

**Para qué se usó:** abstraer el acceso a base de datos. Spring Data JPA genera la implementación a partir de la interfaz.

**Dónde:**
- `domain/repository/AppointmentRepository.java` y los demás en el mismo paquete.
- Métodos como `findOverlapping(...)`, `countScheduledByPatient(...)` encapsulan la query SQL de validación.

**Por qué aquí:**
El patrón es prácticamente forzado por Spring, pero la decisión consciente fue poner las queries críticas (solape, conteo de citas activas) **en el repositorio** y no en el service, para que el service razone solo en términos de "dame las citas que chocan" sin saber JPQL.

---

## 7. DTO (Data Transfer Object)

**Para qué se usó:** separar el modelo de dominio (entidades JPA) del contrato público de la API.

**Dónde:**
- `api/dto/*.java` — records inmutables (`AppointmentDto`, `PatientDto`, `CreateAppointmentRequest`, etc.).
- `api/mapper/DtoMapper.java` — convierte entidad → DTO en un lugar único.

**Por qué aquí:**
Si los controllers devolvieran entidades JPA directamente, exponer un campo nuevo en la BD lo expondría también en la API (y al revés). Los DTOs nos permiten cambiar la BD sin romper a los consumidores y validar la entrada con Bean Validation (`@NotNull`, `@Email`, `@Min`) sin contaminar la entidad.

---

## 8. Builder

**Para qué se usó:** construir entidades complejas (`Appointment`) sin un constructor de 12 parámetros.

**Dónde:**
- Anotación `@Builder` de Lombok en todas las entidades (`Appointment`, `Patient`, `User`, …).
- Uso en `AppointmentFactory` y en `DemoUserSeeder`.

**Por qué aquí:**
`Appointment` tiene muchos campos opcionales (`paymentProofPath`, `cuota`, `comments`, `rescheduledFrom`). Un builder hace las llamadas legibles y deja explícito qué se llena y qué se omite — los `null` desaparecen del call site.

---

## 9. Argument Resolver (variante de Adapter en Spring MVC)

**Para qué se usó:** inyectar el usuario autenticado directamente en los métodos de los controllers sin repetir el código de lectura del header `X-User-Id`.

**Dónde:**
- `api/security/CurrentUser.java` — anotación.
- `api/security/CurrentUserArgumentResolver.java` — implementación de `HandlerMethodArgumentResolver`.
- Registrado en `config/WebConfig.java`.

**Por qué aquí:**
Los controllers reciben el usuario como `@CurrentUser User user` y se enfocan en la lógica del endpoint. La autenticación es deliberadamente simple (header + lookup), suficiente para un módulo administrativo cerrado. El argument resolver es el lugar natural donde adaptar la convención de transporte (HTTP header) al tipo del dominio (`User`).

---

## 10. Global Exception Handler (variante de Chain of Responsibility de Spring MVC)

**Para qué se usó:** mapear excepciones del dominio (`NotFoundException`, `BusinessRuleException`, `IllegalStateTransitionException`) a respuestas HTTP coherentes sin que cada controller las capture.

**Dónde:**
- `api/error/GlobalExceptionHandler.java` (`@RestControllerAdvice`).
- `api/error/ApiError.java` — formato uniforme de respuesta de error.

**Por qué aquí:**
Los services lanzan excepciones de dominio puras; el handler decide cómo se traducen a `404`, `409` o `400`. Los controllers permanecen libres de `try/catch` repetitivos.

---

## Resumen rápido

| Patrón                  | Para resolver                                                  | Archivo principal                                    |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| Strategy                | Una regla por clase                                            | `domain/validation/rules/*Validator.java`           |
| Chain of Responsibility | Ejecutar todas las reglas en orden y acumular errores          | `domain/validation/AppointmentValidationChain.java`  |
| State                   | Transiciones de estado de la cita                              | `domain/state/AppointmentState.java`                 |
| Factory                 | Crear citas con sus invariantes                                | `domain/factory/AppointmentFactory.java`             |
| Observer                | Audit log desacoplado                                          | `domain/event/AuditLogListener.java`                 |
| Repository              | Acceso a BD con queries específicas                            | `domain/repository/AppointmentRepository.java`       |
| DTO                     | Contrato API ≠ modelo de dominio                               | `api/dto/*.java`                                     |
| Builder                 | Construcción legible de entidades                              | Lombok `@Builder` en entidades                       |
| Argument Resolver       | Inyectar el usuario autenticado en los controllers             | `api/security/CurrentUserArgumentResolver.java`      |
| Exception Handler       | Mapear excepciones de dominio a respuestas HTTP                | `api/error/GlobalExceptionHandler.java`              |
