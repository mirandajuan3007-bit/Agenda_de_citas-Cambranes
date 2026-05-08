# Reporte Final de Validación Integral — Célula 1

**Fecha:** 2026-05-08  
**Célula:** 1 — Integradora  
**Responsable:** @mirandajuan3007-bit  
**Issue de referencia:** [#67 — Trazabilidad y validación integral diseño vs implementación](https://github.com/mirandajuan3007-bit/Agenda_de_citas-Cambranes/issues/67)

---

## 1. Contexto de implementación

El módulo entregado es un **prototipo frontend** en React 18 + TypeScript + Vite (rama `develop`).  
**No existe backend** en esta rama. La persistencia opera sobre `localStorage`.  
Esto es un hallazgo transversal documentado como **D-T1** (ver sección 4).

| Capa | Tecnología | Estado |
|---|---|:---:|
| Frontend | React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.21 | ✅ Funcional |
| Persistencia | `localStorage` (sin backend) | ⚠️ Solo local |
| Backend | Spring Boot 3.2.5 (rama `contexto_ia` únicamente) | ❌ No disponible en `develop` |
| Base de datos | H2 / PostgreSQL (solo en `contexto_ia`) | ❌ No disponible en `develop` |

---

## 2. Qué entregó cada célula

### Célula 2 — Validación funcional (issue #68)
**Asignados:** @isaias-0608, @jogedelapa01-alt

Entregó los 5 documentos requeridos en `docs/06_pruebas_funcionales/`:

| Entregable | Archivo | Estado |
|---|---|:---:|
| Casos de prueba funcionales | `casos_de_prueba_funcionales.md` | ✅ Completo |
| Evidencia pruebas de aceptación | `evidencia_pruebas_aceptacion.md` | ✅ Completo |
| Evidencia pruebas de sistema | `evidencia_pruebas_sistema.md` | ✅ Completo |
| Desviaciones funcionales | `desviaciones_funcionales.md` | ✅ Completo |
| Reporte de conformidad funcional | `reporte_conformidad_funcional.md` | ✅ Completo |

**Resultados globales de sus pruebas:**

| Resultado | Cantidad |
|:---:|:---:|
| ✅ Pasaron | 21 |
| 🟡 Pasaron con observación | 2 |
| ❌ Fallaron | 3 |
| ⚪ No ejecutadas | 1 |
| **Total** | **27** |

---

### Célula 3 — Validación técnica (issue #69)
**Asignados:** @cesardzul-byte, @danicauich3

| Entregable | Archivo | Estado |
|---|---|:---:|
| Diagrama de clases (imagen) | `diagrams/class_diagram/class_diagram.png` | ✅ Completo |
| Diagrama de clases (editable) | `diagrams/class_diagram/class_diagram_editable.puml` | ✅ Completo |
| Guía del diagrama de clases | `diagrams/class_diagram/class_diagram_guide.md` | ✅ Completo |
| Modelo entidad-relación (descripción) | `docs/05_final/description_entity-relationship_model.md` | ✅ Completo |
| Diseño de base de datos (SQL) | `docs/05_final/diseño_base_de_datos.md` | ✅ Completo |
| Issues de diagrama de clases | #70, #71 | ✅ Cerradas |

---

## 3. Conformidad por requisito

### 3.1 Requisitos funcionales

| ID | Requisito | Casos ejecutados | Fallaron | Estado |
|:---:|---|:---:|:---:|:---:|
| RF-01 | Crear cita | CP-RF01-01 a CP-RF01-06 | CP-RF01-06 (D-01, D-05) | 🟡 Cumple parcial |
| RF-02 | Resumen antes de confirmar | CP-RF02-01 | — | ✅ Cumple |
| RF-03 | Validar disponibilidad de terapeuta y sala | CPS-02 | — | ✅ Cumple |
| RF-04 | Folio único de paciente | CP-RF04-01 | — | ✅ Cumple |
| RF-05 | Guardar paciente e historial | CP-RF05-01 | — (observación D-04) | 🟡 Cumple parcial |
| RF-06 | Consultar detalle de cita | CP-RF06-01 | — | ✅ Cumple |
| RF-07 | Identificar citas atrasadas | CP-RF07-01 | — | ✅ Cumple |
| RF-08 | Reprogramar cita | CP-RF08-01, CP-RF08-02 | — | ✅ Cumple |
| RF-09 | Cancelar cita | CP-RF09-01 a CP-RF09-03 | CP-RF09-03 (D-03) | 🟡 Cumple parcial |

**Resumen RF:** 6 cumplen totalmente · 3 cumplen parcialmente · 0 no cumplen

### 3.2 Requisitos no funcionales

| ID | Requisito | Evidencia principal | Estado |
|:---:|---|---|:---:|
| RNF-01 | Consistencia e integridad transaccional | `storage.ts`, `AppContext.tsx`, `appointments.ts`, `CPS-03` | 🟡 Cumple parcial |
| RNF-02 | Acceso seguro y control por rol | `LoginPage.tsx`, `AppContext.tsx`, `Sidebar.tsx`, `CP-RNF02-01..03` | 🟡 Cumple parcial |
| RNF-03 | Documentación del sistema y soporte operativo | `docs/README.md`, `docs/05_final/`, `diagrams/class_diagram/` | ✅ Cumple |
| RNF-04 | Observabilidad, logging y recuperación | `auditLogs` en `types/index.ts` + servicios; sin `/health`, métricas ni respaldos | ❌ No cumple |
| RNF-05 | Datos mínimos visibles según rol | `Sidebar.tsx`, `PatientsView.tsx`, `AppointmentDetailModal.tsx`, D-02 | 🟡 Cumple parcial |
| RNF-06 | Usabilidad y diseño coherente | `NewAppointmentModal.tsx`, `AppointmentDetailModal.tsx`, `globals.css` | 🟡 Cumple parcial |
| RNF-07 | Flujo simple para usuario sin capacitación previa | `NewAppointmentModal.tsx`, `CP-RNF07-01` | ✅ Cumple |
| RNF-08 | Mensajes de validación ante errores | `validation.ts`, `NewAppointmentModal.tsx`, `CP-RNF08-01` | ✅ Cumple |
| RNF-09 | Notificaciones y alertas al usuario | `useToast.ts`, `Toast.tsx`, `DashboardView.tsx`, `CP-RNF09-01` | ✅ Cumple |
| RNF-10 | Adaptación a pantallas y zoom | `globals.css`, layout de escritorio; prueba física pendiente `CP-RNF10-01` | 🟡 Cumple parcial |

**Resumen RNF:** 4 cumplen totalmente · 5 cumplen parcialmente · 1 no cumple

---

## 4. Desviaciones confirmadas

### D-01 🟠 Alto — Límite de citas pendientes no aplicado

- **Requisito incumplido:** RF-01 regla 6 — un paciente no puede tener más de 3 citas en estado SCHEDULED simultáneamente.
- **Evidencia técnica:** la función `countScheduledAppointments(patientId)` existe en `frontend/src/services/validation.ts` pero **no es llamada** desde `runFullValidation`.
- **Prueba que lo detectó:** CP-RF01-06 ❌ (se permitió registrar una 4.ª cita pendiente).
- **Acción correctiva:** invocar `countScheduledAppointments` dentro de `runFullValidation` cuando `patientId !== null` y retornar error si el conteo supera 3.

---

### D-02 🔴 Crítico — Sin diferenciación de roles en la interfaz

- **Requisito incumplido:** RNF-02 (control de acceso por rol), RNF-05 (datos mínimos según rol).
- **Evidencia:** los perfiles de secretaria y coordinador ven exactamente las mismas vistas, botones y acciones. La única diferencia visual es el nombre del rol en la barra lateral.
- **Impacto:** un usuario con rol secretaria puede realizar acciones reservadas para coordinador y viceversa. No hay control de acceso real.
- **Acción correctiva:** condicionar vistas y botones críticos con `currentUser.role` en `App.tsx` y en los componentes de menú/acción.

> ⚠️ Esta es la única desviación de gravedad **crítica**. Debe resolverse antes de declarar el sistema listo para uso.

---

### D-03 🟠 Alto — Se pueden cancelar citas pasadas

- **Requisito incumplido:** RF-09 — solo se pueden cancelar citas antes de su hora programada.
- **Evidencia técnica:** `cancelAppointment` en `appointments.ts` solo verifica `statusId === 1` (SCHEDULED), pero no compara `new Date(appt.startAt) > new Date()`.
- **Prueba que lo detectó:** CP-RF09-03 ❌.
- **Acción correctiva:** agregar validación de fecha/hora antes de ejecutar la cancelación.

---

### D-04 🟠 Alto — Modelo de paciente incompleto

- **Requisito incumplido:** RF-05 + diseño de datos.
- **Evidencia:** el tipo `Patient` en `frontend/src/types/` solo incluye: `id`, `folio`, `nombre`, `teléfono`, `email`, `fechaNacimiento`, `fechaCreacion`.
- **Campos faltantes del diseño:** `género`, `dirección`, `contactoEmergencia`, `notasMédicas`, `fechaBaja`.
- **Acción correctiva:** extender el tipo `Patient` y los formularios de creación/edición con los campos del diseño.

---

### D-05 🟡 Medio — Comprobante de pago y cuota no visibles en el wizard

- **Requisito incumplido:** RF-01 (citas terapéuticas con pago).
- **Evidencia:** el modelo soporta `paymentProofPath` y `cuota`, pero el wizard `NewAppointmentModal` no expone estos campos en ningún paso.
- **Acción correctiva:** agregar un campo de carga/referencia de comprobante y un campo de cuota en el paso correspondiente del wizard.

---

### D-T1 🟠 Transversal — Sin backend compartido

- **Afecta a:** RF-01, RF-04, RF-05, RF-08, RF-09, RNF-01, RNF-02, RNF-04.
- **Descripción:** toda la data vive en `localStorage` del navegador. Si el usuario borra datos del navegador, pierde todo. Dos secretarias trabajando en distintas computadoras tienen agendas completamente separadas y sin sincronización.
- **Clasificación:** decisión de arquitectura del prototipo, no un bug del frontend. Se debe documentar formalmente y atender al conectar el backend.

---

### Pruebas pendientes (no ejecutadas)

| ID | Prueba | Requisito |
|---|---|---|
| D-Pendiente-01 | Adaptación visual en 1366×768, 1440×900, 1920×1080 con zoom 100/125/150% | RNF-10 |
| D-Pendiente-02 | Flujo completo con usuario externo sin capacitación previa | RNF-07 CA-07.4 |

---

## 5. Funcionalidades implementadas sin diseño previo

Estas adiciones son **positivas** — el sistema hace más de lo documentado. Se listan para que queden registradas y no parezcan código sin respaldo.

| Funcionalidad | Dónde vive | Observación |
|---|---|---|
| Dashboard con tarjetas de resumen | Pantalla principal | No estaba en RF ni en diseño funcional |
| Panel de "Alertas de atraso" | Pantalla principal | No estaba en RF; apoya RF-07 |
| Sistema de notificaciones toast | Global (todas las acciones) | No estaba en RNF; apoya RNF-08 |
| Bitácora `auditLogs` | `localStorage` + servicio | Reemplaza `appointment_history` del diseño DB |
| `DEMO_NOW` (hora simulada) | Lógica de validación | Facilita demos; debe removerse en producción |

---

## 6. Funcionalidades diseñadas pero no implementadas

| Elemento | Diseño original | Estado real |
|---|---|---|
| `appointment_history` (tabla BD) | `docs/05_final/diseño_base_de_datos.md` | Reemplazado por `auditLogs` en localStorage |
| Campos extendidos de paciente | RF-05 + MER | Solo campos básicos (ver D-04) |
| Roles diferenciados en UI | RNF-02, RNF-05 | Sin implementar (ver D-02) |

---

## 7. Verificación de cobertura de la issue #67

| Exigencia de la issue | Evidencia de cumplimiento | Estado |
|---|---|:---:|
| Crear matriz de trazabilidad del proyecto | `docs/05_final/matriz_trazabilidad.md` | ✅ Cubierto |
| Relacionar cada RF y RNF con evidencia en implementación | Secciones 2 y 3 de la matriz + tabla RNF de este reporte | ✅ Cubierto |
| Consolidar hallazgos reportados por las demás células | Sección 2 de este reporte + desviaciones D-01 a D-T1 | ✅ Cubierto |
| Clasificar diferencias entre diseño e implementación | Sección 4 de este reporte + sección 4 de la matriz | ✅ Cubierto |
| Definir estado final de cada elemento | Tabla RF/RNF de este reporte + columna "Estado final" en la matriz | ✅ Cubierto |
| Preparar reporte final de conformidad del proyecto | Este archivo `reporte_final_integracion.md` | ✅ Cubierto |

### Pendientes técnicos después del cierre documental

| Tarea | Prioridad | Estado |
|---|:---:|:---:|
| Corregir D-02: diferenciación real por rol | Crítica | ⬜ Pendiente |
| Corregir D-01: límite de 3 citas pendientes | Alta | ⬜ Pendiente |
| Corregir D-03: bloquear cancelación de citas pasadas | Alta | ⬜ Pendiente |
| Corregir D-04: ampliar modelo de paciente | Alta | ⬜ Pendiente |
| Ejecutar validación multi-resolución y zoom (RNF-10) | Media | ⬜ Pendiente |
| Ejecutar prueba con usuario novato externo (RNF-07 CA-07.4) | Media | ⬜ Pendiente |

---

## 8. Resumen ejecutivo

El sistema implementado **cumple los flujos funcionales principales**. Los módulos de creación, consulta, reprogramación y cancelación de citas funcionan. Las validaciones de disponibilidad (terapeuta, sala, paciente) operan correctamente.

Existen **4 desviaciones altas** que deben corregirse antes de una entrega formal:

1. La regla de máximo 3 citas pendientes no se aplica (D-01) — corrección de 5 líneas en `validation.ts`.
2. No hay diferenciación visual ni funcional entre roles (D-02) — la más importante, requiere trabajo de frontend.
3. Se pueden cancelar citas ya pasadas (D-03) — corrección de 2 líneas en `appointments.ts`.
4. El modelo de paciente está incompleto (D-04) — requiere extender tipo y formulario.

El sistema **no está listo para producción** principalmente por D-02 (sin control de acceso real) y D-T1 (sin backend compartido). Está listo para demostración y validación funcional en entorno local.

---

## 9. Entregables de la validación integral

| Entregable | Archivo | Estado |
|---|---|:---:|
| Matriz de trazabilidad | `docs/05_final/matriz_trazabilidad.md` | ✅ Completa |
| Casos de prueba funcionales | `docs/06_pruebas_funcionales/casos_de_prueba_funcionales.md` | ✅ Célula 2 |
| Evidencia pruebas de aceptación | `docs/06_pruebas_funcionales/evidencia_pruebas_aceptacion.md` | ✅ Célula 2 |
| Evidencia pruebas de sistema | `docs/06_pruebas_funcionales/evidencia_pruebas_sistema.md` | ✅ Célula 2 |
| Desviaciones funcionales | `docs/06_pruebas_funcionales/desviaciones_funcionales.md` | ✅ Célula 2 |
| Reporte de conformidad funcional | `docs/06_pruebas_funcionales/reporte_conformidad_funcional.md` | ✅ Célula 2 |
| Diagrama de clases | `diagrams/class_diagram/` | ✅ Célula 3 |
| Modelo entidad-relación | `docs/05_final/description_entity-relationship_model.md` | ✅ Célula 3 |
| Diseño de base de datos | `docs/05_final/diseño_base_de_datos.md` | ✅ Célula 3 |
| **Reporte final de validación integral** | `docs/06_pruebas_funcionales/reporte_final_integracion.md` | ✅ Completo |
