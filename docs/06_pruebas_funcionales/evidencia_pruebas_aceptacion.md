# Evidencia de pruebas de aceptación

> Aquí está el resultado de ejecutar las pruebas que validan **lo que el usuario espera** del sistema.

## ¿Qué es una prueba de aceptación?

Es una prueba que mira el sistema **desde fuera**, como un usuario real. Pregunta: "¿el usuario puede cumplir su objetivo?".

Cada prueba de aceptación apunta a un **requisito** documentado.

## ¿Cómo está organizado este documento?

Cada caso ejecutado tiene:

- **Resultado esperado:** lo que debería pasar.
- **Resultado real:** lo que sí pasó.
- **Estado:** ✅ pasó · 🟡 pasó con observación · ❌ falló · ⚪ no se ejecutó.

---

# Resultados por requisito

## RF-01 — Crear cita

### CP-RF01-01 — Crear evaluación inicial

- **Esperado:** cita creada y visible en calendario; paciente nuevo registrado.
- **Real:** ✅ La cita se crea correctamente. Se genera folio del paciente. Aparece en el calendario y en la lista de pacientes. Toast de éxito.
- **Estado:** ✅ Pasó.

### CP-RF01-02 — Crear sesión terapéutica con paciente existente

- **Esperado:** cita de 90 min con paciente buscado.
- **Real:** ✅ Búsqueda muestra coincidencias. Cita creada con duración 90 min. Calendario actualizado.
- **Estado:** ✅ Pasó.

### CP-RF01-03 — Conflicto de horario con terapeuta

- **Esperado:** rechazo con mensaje claro.
- **Real:** ✅ El sistema rechaza con el mensaje "El terapeuta no está disponible en ese horario". El usuario regresa al paso anterior con datos preservados.
- **Estado:** ✅ Pasó.

### CP-RF01-04 — Cita fuera del horario laboral

- **Esperado:** rechazo con mensaje sobre horario 9:00–17:30.
- **Real:** ✅ La validación detecta horario inválido y muestra mensaje específico.
- **Estado:** ✅ Pasó.

### CP-RF01-05 — Cita en fin de semana

- **Esperado:** rechazo con mensaje sobre días laborales.
- **Real:** ✅ La validación detecta día no laboral y rechaza.
- **Estado:** ✅ Pasó.

### CP-RF01-06 — Cuarta cita pendiente del mismo paciente

- **Esperado:** rechazo con mensaje "ya tiene 3 citas pendientes".
- **Real:** ❌ **El sistema permite crear la 4ª, 5ª y N citas pendientes sin restricción.** La función para contar citas pendientes existe en el código pero no se usa.
- **Estado:** ❌ Falló.
- **Desviación asociada:** ver `desviaciones_funcionales.md` → **D-01**.

---

## RF-02 — Resumen antes de confirmar

### CP-RF02-01 — Resumen al final del wizard

- **Esperado:** paso 4 muestra todos los datos antes de guardar.
- **Real:** ✅ El resumen muestra tipo, paciente, terapeuta, sala (autoderivada), fecha, hora y duración. Botones "Atrás" y "Confirmar" funcionan.
- **Estado:** ✅ Pasó.

---

## RF-04 — Folio único de paciente

### CP-RF04-01 — Folio al crear paciente nuevo

- **Esperado:** folio formato `PAC-XXXX`, único y consecutivo.
- **Real:** ✅ Cada paciente recibe folio consecutivo (`PAC-0001`, `PAC-0002`, …). Se respeta el contador `nextPatientId` entre sesiones.
- **Estado:** ✅ Pasó.

---

## RF-05 — Historial del paciente

### CP-RF05-01 — Consultar historial de citas

- **Esperado:** historial muestra todas las citas con su estado.
- **Real:** 🟡 El historial muestra citas programadas, canceladas y reprogramadas. Sin embargo, **algunos campos del paciente esperados no aparecen** (género, dirección, contacto de emergencia) porque no están en el modelo.
- **Estado:** 🟡 Pasó con observación.
- **Desviación asociada:** ver `desviaciones_funcionales.md` → **D-04**.

---

## RF-06 — Consultar detalle de cita

### CP-RF06-01 — Detalle desde el calendario

- **Esperado:** modal con todos los datos relevantes.
- **Real:** ✅ Muestra paciente, folio, terapeuta, sala, tipo, fecha, hora, duración, estado y comentarios. Botones "Reagendar" y "Cancelar" se habilitan según estado.
- **Estado:** ✅ Pasó.

---

## RF-07 — Identificación visual de cita atrasada

### CP-RF07-01 — Marca visual sin cambiar estado

- **Esperado:** color rojo, animación, estado almacenado intacto.
- **Real:** ✅ Las citas en estado "Programada" cuya hora ya pasó se ven con color rojo y animación pulsante. Su `statusId` sigue siendo 1. El dashboard tiene un panel "Alertas de atraso" con esas citas.
- **Estado:** ✅ Pasó.

---

## RF-08 — Reagendar

### CP-RF08-01 — Reagendar a horario disponible

- **Esperado:** original archivada, nueva creada con vínculo.
- **Real:** ✅ La cita original cambia a "Reprogramada". Se crea nueva cita enlazada vía `rescheduledFromId`. En calendario solo aparece la nueva.
- **Estado:** ✅ Pasó.

### CP-RF08-02 — Reagendar a horario ocupado

- **Esperado:** rechazo, original sin cambios.
- **Real:** ✅ Validación detecta el conflicto antes de mover. La cita original se mantiene intacta en estado "Programada".
- **Estado:** ✅ Pasó.

---

## RF-09 — Cancelar

### CP-RF09-01 — Cancelación con motivo válido

- **Esperado:** cita cancelada, motivo registrado, horario libre.
- **Real:** ✅ Se solicita motivo (≥ 5 caracteres), se registra en la cita junto con la fecha de cancelación. El horario queda disponible para nuevas citas porque `validateAvailability` ignora citas en estado 2 (cancelada).
- **Estado:** ✅ Pasó.

### CP-RF09-02 — Cancelación con motivo corto o vacío

- **Esperado:** rechazo con mensaje.
- **Real:** ✅ El formulario no acepta motivos de menos de 5 caracteres y muestra mensaje específico.
- **Estado:** ✅ Pasó.

### CP-RF09-03 — Cancelar cita cuya hora ya pasó

- **Esperado:** rechazo con mensaje "solo antes de la hora programada".
- **Real:** ❌ **El sistema permite cancelar la cita aunque su hora ya pasó.** La regla del documento de requisitos no se aplica.
- **Estado:** ❌ Falló.
- **Desviación asociada:** ver `desviaciones_funcionales.md` → **D-03**.

---

## RNF-02 — Acceso

### CP-RNF02-01 — Login con credenciales válidas

- **Esperado:** acceso al dashboard.
- **Real:** ✅ Login exitoso. Sesión persistente. Nombre y rol visibles en sidebar.
- **Estado:** ✅ Pasó.

### CP-RNF02-02 — Login con contraseña incorrecta

- **Esperado:** rechazo con mensaje.
- **Real:** ✅ Aparece mensaje "Credenciales inválidas". El sistema no permite acceso.
- **Estado:** ✅ Pasó.

### CP-RNF02-03 — Diferenciación por rol

- **Esperado:** coordinador ve más que secretaria.
- **Real:** ❌ **Ambos roles ven exactamente las mismas vistas y tienen las mismas acciones disponibles.** La única diferencia visual es el nombre del rol en la barra lateral.
- **Estado:** ❌ Falló.
- **Desviación asociada:** ver `desviaciones_funcionales.md` → **D-02**.

---

## RNF-07 — Flujo simple

### CP-RNF07-01 — Wizard conserva datos al regresar

- **Esperado:** datos preservados.
- **Real:** ✅ Al usar "Atrás", los campos llenados siguen ahí. El estado se mantiene en el componente.
- **Estado:** ✅ Pasó.

---

## RNF-08 — Mensajes de validación

### CP-RNF08-01 — Mensajes específicos por recurso

- **Esperado:** mensajes distintos para terapeuta, sala y paciente.
- **Real:** ✅ Cada conflicto produce un mensaje claro y diferente:
  - "El terapeuta ya tiene una cita en ese horario."
  - "La sala ya está reservada en ese horario."
  - "El paciente ya tiene una cita en ese horario."
- **Estado:** ✅ Pasó.

---

## RNF-09 — Toasts y alertas

### CP-RNF09-01 — Tipos de toast

- **Esperado:** verde para éxito, rojo para error, azul para info.
- **Real:** ✅ Cada operación produce el toast adecuado con icono y color correspondientes.
- **Estado:** ✅ Pasó.

---

## RNF-10 — Adaptación a pantallas

### CP-RNF10-01 — 1366×768 a distintos zooms

- **Estado:** ⚪ No se ejecutó por falta de entorno de pruebas físicas controlado.
- **Razón:** las pruebas se hicieron en una sola pantalla con zoom 100 %. Se requieren las resoluciones documentadas.
- **Acción:** documentado como pendiente en `desviaciones_funcionales.md` → **D-Pendiente-01**.

---

# Resumen de pruebas de aceptación

| Estado | Cantidad |
|:---|---:|
| ✅ Pasaron | 16 |
| 🟡 Pasaron con observación | 1 |
| ❌ Fallaron | 3 |
| ⚪ No ejecutadas | 1 |
| **Total** | **21** |

## Lectura rápida

- 🟢 **El usuario puede completar todos los flujos críticos**: login, crear cita, ver, reagendar y cancelar.
- 🟡 Hay 3 desviaciones que afectan reglas específicas (3 citas máx., diferenciación por rol, cancelar cita pasada).
- ⚪ Falta validar adaptación a distintas resoluciones.

