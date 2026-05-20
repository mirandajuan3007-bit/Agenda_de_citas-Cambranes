# Hallazgos y Deuda Técnica

Documento complementario a `REPORTE_VALIDACION_TECNICA.md`. 
Lista cada hallazgo con prioridad, esfuerzo estimado y referencia al artefacto.

---

## Convenciones

- **Severidad**: Crítica / Alta / Media / Baja
- **Tipo**: Bug · Diseño · Documentación · Seguridad · Pruebas · Arquitectura

---

## Hallazgos

### H-01 · No existe backend ni base de datos

- **Severidad:** Crítica
- **Tipo:** Arquitectura
- **Origen:** `docs/05_final/diseño_base_de_datos.md` define PostgreSQL · `frontend/src/data/storage.ts` usa localStorage
- **Impacto:** RNF-01 (integridad), RNF-04 (observabilidad), RNF-05 (cifrado), multi-usuario, escalabilidad
- **Recomendación:** Decidir formalmente entre declarar el alcance "demo de cliente" en `implementation_context.md` y cerrar el módulo o construir backend (Node/Express/Postgres o equivalente) replicando los servicios actuales como API

### H-02 · Contraseñas en texto plano

- **Severidad:** Crítica
- **Tipo:** Seguridad
- **Origen:** `frontend/src/types/index.ts:13-17` y `seed.ts:21-34` · diseño exige `password_hash`
- **Impacto:** Riesgo reputacional. Aunque sea demo, los seeds están versionados con credenciales legibles
- **Recomendación:** Reemplazar por hash bcrypt en seed y comparar via `bcrypt.compare`; o marcar explícitamente como `// DEMO ONLY — no usar en producción` y mover seed a un archivo no versionado

### H-03 · `auditLogs` sin uso operativo

- **Severidad:** Alta
- **Tipo:** Diseño + Documentación
- **Origen:** `data.auditLogs` se llena pero nunca se consulta desde la UI
- **Impacto:** RNF-04 incumplido
- **Recomendación:** Mínimo: botón "Exportar logs" en dashboard del coordinador que descargue JSON. Ideal: vista de auditoría con filtros

### H-04 · Decisiones técnicas no documentadas

- **Severidad:** Media
- **Tipo:** Documentación
- **Origen:** Campos `cuota`, `rescheduledFromId`, `Therapist.roomId`, ausencia de `Therapist.user_id/notes`, `User.created_at`, etc.
- **Impacto:** Diseño y código drifteando
- **Recomendación:** Actualizar `docs/05_final/diseño_base_de_datos.md` con las decisiones realizadas o ajustar el código para alinearlo al diseño

### H-05 · `Therapist.user_id` faltante

- **Severidad:** Media
- **Tipo:** Diseño
- **Origen:** Diseño SQL 4.3 lo incluye, pero código no lo tiene
- **Impacto:** Bloquea futuro login de terapeutas
- **Recomendación:** Añadirlo opcional al `interface Therapist`

### H-06 · Hora "actual" hardcodeada

- **Severidad:** Alta
- **Tipo:** Bug latente
- **Origen:** `frontend/src/data/seed.ts:16` `DEMO_NOW = '2026-04-27T10:45:00'`
- **Impacto:** Tras esa fecha, el indicador atrasada siempre se cumple para todas las citas anteriores y se pierde sentido
- **Recomendación:** Reemplazar por `new Date()` salvo flag de demo, documentar el flag si se conserva

### H-07 · Regla de máx. 3 citas activas no aplicada

- **Severidad:** Alta
- **Tipo:** Bug funcional
- **Origen:** `services/validation.ts:154 countScheduledAppointments` definida pero nadie la consume
- **Impacto:** RF-01 regla 6 no se aplica
- **Recomendación:** Llamar `countScheduledAppointments(patientId) >= 3` en el wizard antes de habilitar "Confirmar"

### H-8 · Cancelación sin verificar `now < startAt`

- **Severidad:** Media
- **Tipo:** Bug funcional
- **Origen:** `services/appointments.ts:cancelAppointment` solo valida `statusId === 1`
- **Impacto:** RF-09 regla 1 ("solo se pueden cancelar antes de su hora")
- **Recomendación:** Añadir validación 

### H-9 · Atomicidad de `rescheduleAppointment` no garantizada

- **Severidad:** Media
- **Tipo:** Bug latente
- **Origen:** `services/appointments.ts:rescheduleAppointment` modifica original y luego hace push de la nueva, si falla a mitad, deja `statusId=3`
- **Impacto:** RNF-01
- **Recomendación:** Construir `nextData` completo en memoria y solo entonces `saveData(nextData)`

### H-10 · Filtrado por rol no implementado

- **Severidad:** Media
- **Tipo:** Diseño / Seguridad
- **Origen:** RNF-02 exige "el sistema muestra solo módulos permitidos para ese rol", pero el código no diferencia
- **Impacto:** RNF-02 incompleto
- **Recomendación:** Definir matriz rol×vista×acción y aplicar guard en Sidebar/Header/modales

### H-11 · Mensaje de error en RF-06 silencioso

- **Severidad:** Baja
- **Tipo:** UX
- **Origen:** `AppointmentDetailModal` retorna `null` si la cita no existe
- **Impacto:** RF-06 regla "mostrar mensaje de error si no existe"
- **Recomendación:** Mostrar `Toast` con mensaje claro

### H-12 · Wizard combina nombre y apellidos

- **Severidad:** Baja
- **Tipo:** UX
- **Origen:** RF-01 lista "nombre(s)" y "apellidos" separados; código usa un solo `fullName`
- **Impacto:** Pequeña diferencia funcional con el diseño
- **Recomendación:** O bien actualizar el diseño, o separar el campo en el wizard y concatenar al guardar