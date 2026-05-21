# Casos de prueba funcionales

> Aquí están todas las pruebas que diseñamos para validar el sistema. Cada caso es una receta: pasos a seguir y resultado esperado.

## ¿Cómo está organizado?

Cada caso tiene este formato:

- **Identificador:** un código corto (ej. `CP-RF01-01`).
- **Tipo:** Aceptación o Sistema.
- **Apunta a:** qué requisito o diseño valida.
- **Precondiciones:** lo que tiene que estar listo antes de empezar.
- **Pasos:** qué hacer, en orden.
- **Resultado esperado:** qué debería pasar.

## Identificadores

Los identificadores siguen este patrón:

```
CP-RF01-01
│   │     │
│   │     └─ número del caso (01, 02, 03...)
│   └─ requisito que valida (RF01, RF02, RNF08...)
└─ "Caso de Prueba"
```

## Tipos de prueba

- **Aceptación:** valida que el usuario puede cumplir su objetivo. Vista desde fuera del sistema.
- **Sistema:** valida que un flujo completo funciona de extremo a extremo (UI → servicios → almacenamiento → UI).

---

# Pruebas de aceptación

## RF-01 — Crear cita

### CP-RF01-01 — Crear una evaluación inicial (caso normal)

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf01_requirement_description.md` |
| **Precondiciones** | Usuario logueado como secretaria. Existen al menos 1 terapeuta y 1 sala. |

**Pasos:**

1. Click en "Nueva cita".
2. Seleccionar tipo "Evaluación inicial".
3. Marcar "Paciente nuevo" y llenar nombre, teléfono, email.
4. Elegir terapeuta, fecha (día laboral) y hora válida (entre 9:00 y 17:30).
5. Verificar el resumen del paso 4.
6. Click en "Confirmar".

**Resultado esperado:**

- Aparece pantalla de éxito con el folio del paciente y el ID de la cita.
- La cita se ve en el calendario.
- El paciente aparece en la lista de pacientes.

---

### CP-RF01-02 — Crear sesión terapéutica para paciente existente

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf01_requirement_description.md` |
| **Precondiciones** | Existe al menos un paciente registrado. |

**Pasos:**

1. Click en "Nueva cita".
2. Seleccionar tipo "Sesión terapéutica".
3. Buscar paciente existente y seleccionarlo.
4. Elegir terapeuta, fecha y hora válidas.
5. Confirmar.

**Resultado esperado:**

- Cita creada con duración de 90 minutos.
- Aparece en el calendario en estado "Programada".

---

### CP-RF01-03 — Intentar crear cita con conflicto de horario

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf01_requirement_description.md`, `rf03_requirement_description.md` |
| **Precondiciones** | Existe una cita ya programada el lunes a las 10:00 con el terapeuta T1. |

**Pasos:**

1. Iniciar nueva cita.
2. Tipo terapéutica, paciente cualquiera.
3. Elegir mismo terapeuta T1, mismo lunes a las 10:30 (se solapa).
4. Click en "Confirmar".

**Resultado esperado:**

- El sistema **no** crea la cita.
- Aparece un mensaje indicando que el terapeuta no está disponible.
- El usuario puede corregir y reintentar.

---

### CP-RF01-04 — Intentar crear cita fuera del horario laboral

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf01_requirement_description.md` |

**Pasos:**

1. Iniciar nueva cita.
2. Llenar todos los campos.
3. Elegir hora 18:00 (fuera de horario).
4. Click en "Confirmar".

**Resultado esperado:**

- El sistema rechaza la cita con mensaje claro: horario válido es 9:00–17:30.

---

### CP-RF01-05 — Intentar crear cita en fin de semana

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf01_requirement_description.md` |

**Pasos:**

1. Iniciar nueva cita.
2. Elegir un sábado o domingo.
3. Click en "Confirmar".

**Resultado esperado:**

- El sistema rechaza con mensaje claro: solo lunes a viernes.

---

### CP-RF01-06 — Intentar crear cita 4ª para un paciente con 3 pendientes

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf01_requirement_description.md` regla 6 |
| **Precondiciones** | Paciente P1 ya tiene 3 citas en estado "Programada". |

**Pasos:**

1. Iniciar nueva cita.
2. Buscar paciente P1.
3. Llenar campos válidos.
4. Confirmar.

**Resultado esperado:**

- El sistema rechaza la cita con mensaje "el paciente ya tiene 3 citas pendientes".

> ⚠️ Esta regla está documentada pero **no se aplica en el código actual**. La prueba se documenta para registrar la desviación.

---

## RF-02 — Resumen antes de confirmar

### CP-RF02-01 — Verificar resumen al final del wizard

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf02_requirement_description.md` |

**Pasos:**

1. Iniciar nueva cita.
2. Llenar todos los campos en pasos 1 a 3.
3. Avanzar al paso 4.

**Resultado esperado:**

- Se muestran: tipo de sesión, paciente, terapeuta, sala, fecha, hora y duración.
- Hay botón "Atrás" para corregir.
- Hay botón "Confirmar" para guardar.

---

## RF-04 — Generación automática de folio

### CP-RF04-01 — Folio único al crear paciente nuevo

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf04_requirement_description.md` |

**Pasos:**

1. Crear paciente nuevo "Juan Pérez" durante el wizard de cita.
2. Confirmar la cita.
3. Ir a la sección "Pacientes".
4. Buscar a Juan Pérez.

**Resultado esperado:**

- El paciente tiene un folio con formato `PAC-XXXX`.
- Si se crea otro paciente, su folio es distinto y consecutivo.

---

## RF-05 — Historial del paciente

### CP-RF05-01 — Consultar historial de citas

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf05_requirement_description.md` |
| **Precondiciones** | Existe paciente P1 con al menos 2 citas y 1 cancelación. |

**Pasos:**

1. Ir a "Pacientes".
2. Click en el nombre de P1.
3. Abrir "Historial".

**Resultado esperado:**

- Se listan todas las citas del paciente con su estado: programadas, canceladas, reprogramadas.
- Aparecen ordenadas cronológicamente.

---

## RF-06 — Consultar detalle de cita

### CP-RF06-01 — Ver detalle desde el calendario

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf06_requirement_description.md` |

**Pasos:**

1. Ir al calendario.
2. Click sobre una cita.

**Resultado esperado:**

- Se abre un modal con: paciente, folio, terapeuta, sala, tipo de sesión, fecha, hora, duración, estado y comentarios.
- Hay botones para reagendar y cancelar (si la cita lo permite).

---

## RF-07 — Cita atrasada

### CP-RF07-01 — Identificar visualmente una cita atrasada

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf07_requirement_description.md` |
| **Precondiciones** | Existe cita en estado "Programada" cuya hora ya pasó (la hora simulada del sistema permite reproducirlo). |

**Pasos:**

1. Ir al calendario.
2. Localizar una cita programada con hora pasada.

**Resultado esperado:**

- La cita se ve con color rojo y animación pulsante.
- Su estado almacenado **sigue siendo "Programada"** (no cambió a "Atrasada").
- El dashboard muestra la cita en el panel "Alertas de atraso".

---

## RF-08 — Reagendar cita

### CP-RF08-01 — Reagendar a horario disponible

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf08_requirement_description.md` |
| **Precondiciones** | Existe cita C1 programada. |

**Pasos:**

1. Abrir el detalle de C1.
2. Click en "Reagendar".
3. Elegir nueva fecha y hora válidas.
4. Confirmar.

**Resultado esperado:**

- C1 cambia a estado "Reprogramada".
- Se crea una cita nueva C2 con la nueva fecha/hora.
- C2 está enlazada a C1 (campo `rescheduledFromId`).
- En el calendario solo se ve C2 (C1 queda archivada pero accesible vía historial).

---

### CP-RF08-02 — Intentar reagendar a horario ocupado

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf08_requirement_description.md`, `rf03_requirement_description.md` |

**Pasos:**

1. Reagendar una cita a un horario que ya tiene otra cita programada.
2. Confirmar.

**Resultado esperado:**

- El sistema rechaza el cambio con mensaje claro.
- La cita original **no** cambia de estado.

---

## RF-09 — Cancelar cita

### CP-RF09-01 — Cancelar con motivo válido

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf09_requirement_description.md` |

**Pasos:**

1. Abrir detalle de una cita programada.
2. Click en "Cancelar".
3. Escribir motivo (al menos 5 caracteres).
4. Confirmar.

**Resultado esperado:**

- La cita pasa a estado "Cancelada".
- En el detalle se ve el motivo y la fecha de cancelación.
- El horario queda libre para crear otra cita.

---

### CP-RF09-02 — Intentar cancelar sin motivo o con motivo corto

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf09_requirement_description.md` |

**Pasos:**

1. Abrir detalle de cita programada.
2. Click en "Cancelar".
3. Dejar el motivo vacío o escribir solo 3 caracteres.
4. Click en "Confirmar".

**Resultado esperado:**

- El sistema no acepta y pide motivo de al menos 5 caracteres.

---

### CP-RF09-03 — Intentar cancelar una cita cuya hora ya pasó

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | `rf09_requirement_description.md` regla 1 |

**Pasos:**

1. Localizar una cita en estado "Programada" con hora ya pasada.
2. Intentar cancelarla.

**Resultado esperado:**

- El sistema rechaza la cancelación con mensaje "solo se pueden cancelar citas antes de su hora programada".

> ⚠️ Esta regla **no se aplica en el código actual**. La prueba se documenta para registrar la desviación.

---

# Pruebas de sistema

## CPS-01 — Flujo completo: alta de paciente nuevo + cita + reagendar + cancelar

| Campo | Valor |
|---|---|
| **Tipo** | Sistema |
| **Apunta a** | Diseño funcional consolidado en `docs/05_final/implementation_context.md` |

**Pasos:**

1. Login como secretaria.
2. Crear cita para paciente nuevo (RF-01 + RF-04).
3. Verificar que aparece en el calendario.
4. Abrir su detalle y reagendar (RF-08).
5. Cancelar la cita reagendada con motivo (RF-09).
6. Verificar el historial del paciente (RF-05).

**Resultado esperado:**

- Cada paso ejecuta sin errores.
- Al final, en el historial del paciente se ven las dos citas: una "Reprogramada" y otra "Cancelada".
- El folio del paciente sigue siendo el mismo.

---

## CPS-02 — Flujo de validación de recursos

| Campo | Valor |
|---|---|
| **Tipo** | Sistema |
| **Apunta a** | `rf03_requirement_description.md` |

**Pasos:**

1. Crear cita C1 con terapeuta T1, sala S1, paciente P1, lunes 10:00–11:00.
2. Intentar crear C2 con T1, otra sala S2, otro paciente P2, lunes 10:30. **Esperado:** rechazo (T1 ocupado).
3. Intentar crear C3 con T2, S1, P3, lunes 10:30. **Esperado:** rechazo (S1 ocupada).
4. Intentar crear C4 con T2, S2, P1, lunes 10:30. **Esperado:** rechazo (P1 ocupado).
5. Crear C5 con T2, S2, P3, lunes 11:30. **Esperado:** se crea exitosamente.

**Resultado esperado:**

- Cada validación se aplica con mensaje específico al recurso bloqueado.
- C5 se crea normalmente porque no hay solapamiento con ningún recurso.

---

## CPS-03 — Persistencia entre sesiones

| Campo | Valor |
|---|---|
| **Tipo** | Sistema |
| **Apunta a** | RNF-01 |

**Pasos:**

1. Crear una cita.
2. Cerrar sesión.
3. Cerrar el navegador.
4. Volver a abrir la aplicación.
5. Iniciar sesión.

**Resultado esperado:**

- La cita creada sigue ahí.
- El folio del paciente se mantiene.

---

## CPS-04 — Visualización de citas en distintos estados

| Campo | Valor |
|---|---|
| **Tipo** | Sistema |
| **Apunta a** | RF-06, RF-07 |

**Pasos:**

1. En el calendario, verificar las citas existentes en el seed.

**Resultado esperado:**

- Citas programadas: color base.
- Citas finalizadas: color atenuado.
- Citas canceladas: con icono o color distintivo.
- Citas reprogramadas: archivadas, no se ven en el calendario actual.
- Citas atrasadas: rojo con animación pulsante.

---

# Pruebas de RNF visibles

## CP-RNF02-01 — Login con credenciales válidas

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | RNF-02 |

**Pasos:**

1. Abrir aplicación sin sesión.
2. Ingresar usuario y contraseña del seed.
3. Click en "Iniciar sesión".

**Resultado esperado:**

- Se muestra el dashboard.
- En la barra lateral aparece nombre y rol.

---

## CP-RNF02-02 — Login con contraseña incorrecta

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | RNF-02 |

**Pasos:**

1. Ingresar usuario válido y contraseña incorrecta.

**Resultado esperado:**

- Mensaje de error claro.
- No se accede al sistema.

---

## CP-RNF02-03 — Diferenciación por rol

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | RNF-02, RNF-05 |

**Pasos:**

1. Iniciar sesión como secretaria. Anotar qué se ve.
2. Cerrar sesión.
3. Iniciar sesión como coordinador. Anotar qué se ve.
4. Comparar.

**Resultado esperado:**

- El coordinador ve secciones o información que la secretaria no ve.

> ⚠️ Hoy ambos ven exactamente lo mismo. La prueba se documenta para registrar la desviación.

---

## CP-RNF07-01 — Wizard conserva datos al regresar

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | RNF-07 (CA-07.2) |

**Pasos:**

1. Iniciar nueva cita.
2. Llenar paso 1, 2 y 3.
3. En el paso 3, click en "Atrás".
4. Volver al paso 3.

**Resultado esperado:**

- Los campos previamente llenados siguen ahí.

---

## CP-RNF08-01 — Mensajes de validación específicos

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | RNF-08, RNF-09 |

**Pasos:**

1. Provocar un conflicto de terapeuta.
2. Provocar un conflicto de sala.
3. Provocar un conflicto de paciente.

**Resultado esperado:**

- Cada caso muestra un mensaje **distinto** y específico al recurso bloqueado.

---

## CP-RNF09-01 — Toasts y alertas

| Campo | Valor |
|---|---|
| **Tipo** | Aceptación |
| **Apunta a** | RNF-09 |

**Pasos:**

1. Crear cita exitosamente. **Esperado:** toast verde "éxito".
2. Provocar un error. **Esperado:** toast rojo "error".
3. Información secundaria. **Esperado:** toast azul/gris "info".

---

## CP-RNF10-01 — Adaptación a 1366×768

| Campo | Valor |
|---|---|
| **Tipo** | Sistema |
| **Apunta a** | RNF-10 |

**Pasos:**

1. Abrir aplicación en pantalla 1366×768.
2. Verificar que no haya scroll horizontal innecesario.
3. Probar zoom 100, 125 y 150 %.

**Resultado esperado:**

- Layout se ajusta sin elementos cortados.
- Botones y formularios siguen accesibles.

> ⚠️ Esta prueba **no se ejecutó** por falta de entorno de pruebas físicas. Se reporta como pendiente.

---

# Resumen de casos de prueba

| Categoría | Cantidad |
|---|---:|
| Pruebas de aceptación de RF | 14 |
| Pruebas de sistema | 4 |
| Pruebas de RNF visibles | 7 |
| **Total** | **25** |


