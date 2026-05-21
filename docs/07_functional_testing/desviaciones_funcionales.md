# Desviaciones funcionales detectadas

> Aquí están las diferencias entre **lo que el sistema debería hacer** y **lo que realmente hace**, detectadas al ejecutar las pruebas.

## ¿Cómo está organizado?

Cada desviación tiene un identificador y cuatro partes:

- **Qué dice el requisito:** lo que debería pasar.
- **Qué hace el sistema:** lo que sí pasa.
- **Pruebas que la detectaron:** los casos de prueba que la evidenciaron.
- **Acción sugerida:** cómo cerrarla.

## Identificadores

```
D-01, D-02, D-03...    desviaciones puntuales
D-T1, D-T2...          desviaciones transversales (afectan varios requisitos)
D-Pendiente-XX         pruebas que no se ejecutaron y quedan abiertas
```

## Niveles de gravedad

| Nivel | Significado |
|:---:|---|
| 🔴 **Crítico** | Hay que arreglarlo antes de pasar a producción. |
| 🟠 **Alto** | Una funcionalidad importante no se cumple. Se nota al usar el sistema. |
| 🟡 **Medio** | El sistema funciona pero un detalle del diseño no se respeta. |
| 🟢 **Bajo** | Mejora menor o aclaración documental. |

---

# 🔴 Críticas

## D-02 — Secretaria y coordinador ven exactamente lo mismo

- **Qué dice el requisito:** RNF-02 y RNF-05 piden que el coordinador tenga acceso a información o acciones que la secretaria no tiene.
- **Qué hace el sistema:** ambos roles tienen exactamente las mismas vistas y los mismos botones disponibles. La única diferencia visual es el nombre del rol en la barra lateral.
- **Pruebas que la detectaron:** **CP-RNF02-03**.
- **Impacto:** **Crítico**. Sin diferenciación por rol, no hay control de acceso real. Un usuario con rol "secretaria" puede hacer todo lo que haría un coordinador.
- **Acción sugerida:**
  1. Definir qué acciones/vistas son exclusivas del coordinador.
  2. Agregar verificación por rol en el componente raíz (`App.tsx`) o por vista.
  3. Esconder o deshabilitar botones según `currentUser.role`.

---

# 🟠 Altas

## D-01 — La regla "máximo 3 citas pendientes por paciente" no se aplica

- **Qué dice el requisito:** RF-01 regla 6 establece que un paciente no puede tener más de 3 citas en estado "Programada" simultáneamente.
- **Qué hace el sistema:** un paciente puede acumular cualquier cantidad de citas pendientes. La función `countScheduledAppointments` existe en `frontend/src/services/validation.ts` pero **no se invoca** desde `runFullValidation`.
- **Pruebas que la detectaron:** **CP-RF01-06**.
- **Impacto:** **Alto**. Rompe una regla de negocio explícita. Puede saturar la agenda con un solo paciente.
- **Acción sugerida:**
  1. Modificar `runFullValidation` para llamar a `countScheduledAppointments` cuando `patientId !== null`.
  2. Si supera 3, devolver un `ConflictError` con mensaje "El paciente ya tiene 3 citas pendientes".
  3. Mostrar el mensaje en el wizard como cualquier otro conflicto.

---

## D-03 — Se pueden cancelar citas cuya hora ya pasó

- **Qué dice el requisito:** RF-09 regla 1 dice "solo se pueden cancelar citas antes de su hora programada".
- **Qué hace el sistema:** cualquier cita en estado "Programada" se puede cancelar, sin importar si su hora ya pasó. La función `cancelAppointment` solo verifica `statusId === 1`, no compara con la hora actual.
- **Pruebas que la detectaron:** **CP-RF09-03**.
- **Impacto:** **Alto**. Una cita "atrasada" se puede cancelar como si nunca hubiera pasado, lo que distorsiona los registros operativos.
- **Acción sugerida:**
  1. En `cancelAppointment`, antes de aceptar la cancelación, verificar `new Date(appt.startAt) > new Date()`.
  2. Si la hora ya pasó, rechazar con mensaje "Esta cita ya pasó. No puede cancelarse."
  3. Alternativamente, aclarar en el documento de requisitos si la regla aplica solo a cancelaciones "con anticipación" o también a cancelaciones operativas (paciente no se presentó), porque puede ser un caso legítimo distinto.

---

## D-04 — El paciente no guarda los datos extendidos del diseño

- **Qué dice el requisito:** RF-05 + diseño RF-05 piden guardar género, dirección, contacto de emergencia, notas médicas, fecha de baja.
- **Qué hace el sistema:** el modelo `Patient` solo tiene id, folio, nombre completo, teléfono, email, fecha de nacimiento y fecha de creación.
- **Pruebas que la detectaron:** **CP-RF05-01**.
- **Impacto:** **Alto** para conformidad documental, **bajo** para operación porque RNF-05 (minimización de datos) sugiere guardar lo mínimo.
- **Acción sugerida:**
  1. Decidir formalmente: ¿el módulo de agenda guarda solo lo mínimo o el modelo extendido?
  2. Alinear el documento de diseño con la decisión.
  3. Si se decide modelo extendido, ampliar `frontend/src/types/index.ts` y los formularios.

---

## D-T1 — Persistencia depende del navegador del usuario (transversal)

- **Qué pasa:** todo se guarda en `localStorage`. No hay backend ni base de datos compartida.
- **Pruebas que la detectaron:** **CPS-03**.
- **Impacto:** **Alto** y **transversal**. Afecta:
  - Si el usuario borra datos del navegador, pierde todo.
  - Dos secretarias en computadoras distintas tienen agendas distintas (no se comparten).
  - No hay respaldo automático.
  - No hay forma de auditar desde fuera.
- **Acción sugerida:**
  1. Documentar formalmente que el módulo es un **prototipo** sujeto a estas limitaciones.
  2. Marcar requisitos dependientes (RNF-01, RNF-04) como "atendidos al construir backend".
  3. Planificar la migración a un backend real (FastAPI, Express, Django, etc.) con base de datos relacional.

> 💡 La **T** en D-T1 quiere decir **transversal**: no es un solo problema, es la consecuencia de una decisión de arquitectura.

---

# 🟡 Medias

## D-05 — Faltan campos de comprobante de pago y cuota en el formulario

- **Qué dice el requisito:** RF-01 dice que las "Citas de terapia" deben capturar comprobante de pago y cuota.
- **Qué hace el sistema:** el wizard `NewAppointmentModal` no expone estos campos. El modelo `Appointment` los soporta (`paymentProofPath`, `cuota`) pero quedan vacíos.
- **Pruebas que la detectaron:** detectado en revisión durante **CP-RF01-02** (creación terapéutica).
- **Impacto:** **Medio**. La operación funcional no se rompe, pero la regla del diseño no se cumple.
- **Acción sugerida:** agregar dos campos al paso 3 del wizard cuando `sessionTypeId === 2` (sesión terapéutica). Permitir adjuntar archivo o ruta y monto.

---

# 🟢 Pendientes (pruebas no ejecutadas)

## D-Pendiente-01 — Pruebas de adaptación a pantallas y zoom

- **Qué dice el requisito:** RNF-10 pide validar el sistema en 1366×768, 1440×900 y 1920×1080, con zoom de 100, 125 y 150 %.
- **Qué hicimos:** la validación se realizó en una sola pantalla y un solo zoom (100 %).
- **Pruebas que quedan abiertas:** **CP-RNF10-01**.
- **Impacto:** No es una desviación detectada, sino una validación pendiente.
- **Acción sugerida:** ejecutar la batería de pruebas de pantalla en al menos las 9 combinaciones requeridas y dejar capturas en `docs/07_pruebas_funcionales/evidencia_visual/rnf10/`.

---

## D-Pendiente-02 — Prueba con un usuario sin experiencia (CA-07.4)

- **Qué dice el requisito:** RNF-07 CA-07.4 dice que un usuario sin experiencia debe completar el registro al primer intento.
- **Qué hicimos:** las pruebas las ejecutó la propia célula, que ya conocía el sistema.
- **Pruebas que quedan abiertas:** prueba de usabilidad con usuario novato.
- **Impacto:** No es una desviación detectada, es una validación pendiente.
- **Acción sugerida:** organizar una sesión de prueba con una persona ajena al equipo y registrar tiempo de finalización, errores cometidos y comentarios.

---

# Resumen de desviaciones

| ID | Gravedad | Tema | Requisito afectado |
|---|:---:|---|---|
| D-01 | 🟠 Alto | Regla 3 citas pendientes no se aplica | RF-01 |
| D-02 | 🔴 Crítico | Sin diferenciación por rol | RNF-02, RNF-05 |
| D-03 | 🟠 Alto | Cancelar después de la hora programada | RF-09 |
| D-04 | 🟠 Alto | Modelo de paciente reducido | RF-05 |
| D-05 | 🟡 Medio | Falta UI de comprobante/cuota | RF-01 |
| D-T1 | 🟠 Alto (transversal) | Persistencia solo en navegador | RF-01, RF-04, RF-05, RF-08, RF-09, RNF-01, RNF-02, RNF-04 |
| D-Pendiente-01 | 🟢 Pendiente | Pruebas de pantalla/zoom | RNF-10 |
| D-Pendiente-02 | 🟢 Pendiente | Prueba con usuario novato | RNF-07 |

| Resumen | Cantidad |
|---|---:|
| 🔴 Críticas | 1 |
| 🟠 Altas | 3 + 1 transversal |
| 🟡 Medias | 1 |
| 🟢 Pendientes | 2 |
| **Total** | **8** |

---

## Relación con el reporte de la célula integradora

Estas desviaciones se entregan a la célula de **trazabilidad y conformidad** para que se consoliden con sus hallazgos en `docs/06_validation/hallazgos_consolidados.md`.

Equivalencias rápidas:

| Esta célula | Célula integradora |
|---|---|
| D-01 | H-04 |
| D-02 | H-03 |
| D-03 | H-06 |
| D-04 | H-07 + H-08 |
| D-05 | H-05 |
| D-T1 | H-T1 |
