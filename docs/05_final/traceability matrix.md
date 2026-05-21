# Matriz de Trazabilidad — Diseño vs Implementación

**Fecha de consolidación:** 2026-05-08  
**Célula responsable:** Célula 1 — Integradora  
**Alcance revisado:** rama `develop`, implementación frontend React + TypeScript + Vite con persistencia en `localStorage`.

## 1. Criterio de lectura

- **Cumple:** existe evidencia suficiente en diseño, implementación y validación para sostener conformidad.
- **Cumple parcial:** existe implementación o evidencia parcial, pero hay desviaciones, restricciones de arquitectura o falta una parte relevante de la validación.
- **No cumple:** el requisito exige capacidades que no existen en esta rama o la implementación contradice directamente el diseño.

---

## 2. Trazabilidad de requisitos funcionales

| ID | Requisito | Fuente / diseño | Evidencia en implementación | Evidencia de validación | Hallazgos consolidados | Estado final |
|---|---|---|---|---|---|---|
| RF-01 | Crear cita | `docs/02_requirements/rf01_requirement_description.md`, `docs/03_modeling/rf01_flow_diagram.png`, `docs/04_design/rf01_database_design.md` | `frontend/src/components/modals/NewAppointmentModal.tsx`, `frontend/src/services/appointments.ts`, `frontend/src/services/validation.ts` | `CP-RF01-01` a `CP-RF01-06`, `CPS-01`, `evidencia_pruebas_aceptacion.md` | D-01: no aplica el límite de 3 citas pendientes. D-05: la UI no expone cuota ni comprobante. | **Cumple parcial** |
| RF-02 | Mostrar resumen antes de confirmar | `docs/02_requirements/rf02_requirement_description.md`, `docs/03_modeling/rf02_flow_diagram.png` | `frontend/src/components/modals/NewAppointmentModal.tsx` (paso 4 del wizard) | `CP-RF02-01`, `evidencia_pruebas_aceptacion.md` | Sin desviaciones registradas. | **Cumple** |
| RF-03 | Validar disponibilidad de recursos | `docs/02_requirements/rf03_requirement_description.md`, `docs/03_modeling/rf03_flow_diagram.png` | `frontend/src/services/validation.ts`, `frontend/src/components/modals/NewAppointmentModal.tsx`, `frontend/src/components/modals/RescheduleModal.tsx` | `CP-RF01-03`, `CP-RF01-04`, `CP-RF01-05`, `CPS-02` | La validación de choques por terapeuta, sala y paciente sí opera. | **Cumple** |
| RF-04 | Generación automática de folio de paciente | `docs/02_requirements/rf04_requirement_description.md`, `docs/03_modeling/rf04_flow_diagram.jpg` | `frontend/src/services/patients.ts`, `frontend/src/types/index.ts`, `frontend/src/components/modals/NewAppointmentModal.tsx` | `CP-RF04-01`, `CPS-01` | Sin desviaciones registradas. | **Cumple** |
| RF-05 | Guardar datos del paciente e historial | `docs/02_requirements/rf05_requirement_description.md`, `docs/03_modeling/rf05_flow_diagram.jpg`, `docs/04_design/rf05.database_desing.md`, `docs/05_final/diseño_base_de_datos.md` | `frontend/src/services/patients.ts`, `frontend/src/components/patients/PatientsView.tsx`, `frontend/src/types/index.ts`, `frontend/src/services/appointments.ts` | `CP-RF05-01`, `CPS-01`, `evidencia_pruebas_aceptacion.md` | D-04: el modelo implementado guarda solo campos básicos; falta el conjunto extendido documentado. | **Cumple parcial** |
| RF-06 | Consultar detalle de una cita | `docs/02_requirements/rf06_requirement_description.md`, `docs/03_modeling/rf06_flow_diagram.png` | `frontend/src/components/modals/AppointmentDetailModal.tsx`, `frontend/src/components/calendar/CalendarView.tsx` | `CP-RF06-01`, `CPS-04` | Sin desviaciones registradas. | **Cumple** |
| RF-07 | Identificación visual de citas atrasadas | `docs/02_requirements/rf07_requirement_description.md`, `docs/03_modeling/rf07_flow_diagram.png`, `docs/05_final/implementation_context.md` | `frontend/src/components/dashboard/DashboardView.tsx`, `frontend/src/components/modals/AppointmentDetailModal.tsx`, `frontend/src/components/ui/Badge.tsx`, `frontend/src/utils/helpers.ts` | `CP-RF07-01`, `CPS-04` | Se implementa como condición visual derivada, no como estado persistido. | **Cumple** |
| RF-08 | Reprogramar una cita | `docs/02_requirements/rf08_requirement_description.md`, `docs/03_modeling/rf08_flow_diagram.png`, `docs/04_design/rf08_database_design.md` | `frontend/src/components/modals/RescheduleModal.tsx`, `frontend/src/services/appointments.ts`, `frontend/src/services/validation.ts` | `CP-RF08-01`, `CP-RF08-02`, `CPS-01` | Sin desviaciones registradas. | **Cumple** |
| RF-09 | Cancelar cita con anticipación y actualizar agenda | `docs/02_requirements/rf09_requirement_description.md`, `docs/03_modeling/rf09_flow_diagram.jpg` | `frontend/src/components/modals/CancelModal.tsx`, `frontend/src/components/modals/AppointmentDetailModal.tsx`, `frontend/src/services/appointments.ts` | `CP-RF09-01` a `CP-RF09-03`, `CPS-01` | D-03: el servicio permite cancelar aunque la hora programada ya haya pasado. | **Cumple parcial** |

**Resumen RF:** 9 requisitos funcionales evaluados → 6 cumplen, 3 cumplen parcialmente, 0 no cumplen.

---

## 3. Trazabilidad de requisitos no funcionales

| ID | Requisito | Fuente / diseño | Evidencia en implementación | Evidencia de validación | Hallazgos consolidados | Estado final |
|---|---|---|---|---|---|---|
| RNF-01 | Consistencia e integridad transaccional | `docs/02_requirements/rnf01_requirement_description.md` | `frontend/src/data/storage.ts`, `frontend/src/context/AppContext.tsx`, `frontend/src/services/appointments.ts`, `frontend/src/components/modals/NewAppointmentModal.tsx` | `CPS-03` | La persistencia local conserva datos entre sesiones, pero el flujo de crear paciente y luego crear cita no es transaccional; si falla el segundo paso puede quedar estado parcial. Además no existe BD compartida en esta rama. | **Cumple parcial** |
| RNF-02 | Control de acceso básico y privacidad en UI | `docs/02_requirements/rnf02_requirement_description.md` | `frontend/src/components/auth/LoginPage.tsx`, `frontend/src/context/AppContext.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/types/index.ts` | `CP-RNF02-01`, `CP-RNF02-02`, `CP-RNF02-03` | El login existe, pero D-02 confirma que no hay diferenciación efectiva entre secretaria y coordinador. | **Cumple parcial** |
| RNF-03 | Documentación del sistema y soporte operativo | `docs/02_requirements/rnf03_requirement-description.md`, `docs/README.md`, `docs/05_final/implementation_context.md`, `diagrams/class_diagram/class_diagram_guide.md` | La documentación está versionada y accesible en el repositorio bajo `docs/` y `diagrams/`. | Revisión documental de Célula 1 y entregables de Célula 3 | Existe documentación general, técnica y operativa suficiente para entender el módulo actual. | **Cumple** |
| RNF-04 | Observabilidad, logging y recuperación del sistema | `docs/02_requirements/rnf04_requirement_description.md`, `docs/05_final/diseño_base_de_datos.md` | `frontend/src/types/index.ts` (`auditLogs`), `frontend/src/services/appointments.ts`, `frontend/src/services/patients.ts` | Revisión técnica y D-T1 | Solo existe una bitácora local `auditLogs`. No hay `/health`, métricas, respaldo automático ni recuperación de base de datos en la rama `develop`. | **No cumple** |
| RNF-05 | Datos mínimos visibles según rol | `docs/02_requirements/rnf05_requirement_description.md` | `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/components/patients/PatientsView.tsx`, `frontend/src/components/modals/AppointmentDetailModal.tsx` | `CP-RNF02-03`, `desviaciones_funcionales.md` | D-02: la UI muestra la misma información y las mismas acciones a ambos roles. | **Cumple parcial** |
| RNF-06 | Usabilidad y diseño coherente | `docs/02_requirements/rnf06_requirement_description.md` | `frontend/src/components/modals/NewAppointmentModal.tsx`, `frontend/src/components/modals/AppointmentDetailModal.tsx`, `frontend/src/styles/globals.css`, `frontend/src/components/layout/Sidebar.tsx` | Revisión visual del prototipo y resultados de RNF-07/08/09 | La UI es consistente y operable, pero no existe una guía de estilo mínima documentada en el repositorio ni una revisión formal de escritorio como pide el RNF. | **Cumple parcial** |
| RNF-07 | Flujo simplificado y onboarding operativo | `docs/02_requirements/rnf07_requirement_description.md` | `frontend/src/components/modals/NewAppointmentModal.tsx`, `frontend/src/App.tsx` | `CP-RNF07-01`, `evidencia_pruebas_aceptacion.md` | El wizard conserva estado y permite avanzar/retroceder sin perder datos. La prueba con usuario novato externo sigue pendiente. | **Cumple** |
| RNF-08 | Claridad y organización de formularios | `docs/02_requirements/rnf08_requeriment_description.md` | `frontend/src/components/modals/NewAppointmentModal.tsx`, `frontend/src/services/validation.ts`, `frontend/src/components/auth/LoginPage.tsx` | `CP-RNF08-01` | Los formularios están agrupados por pasos y los mensajes de error son específicos por recurso bloqueado. | **Cumple** |
| RNF-09 | Mensajes y retroalimentación al usuario | `docs/02_requirements/rnf09_requirement_description.md` | `frontend/src/hooks/useToast.ts`, `frontend/src/components/ui/Toast.tsx`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/DashboardView.tsx` | `CP-RNF09-01` | Existen toasts de éxito, error e información y alertas visibles en el dashboard. | **Cumple** |
| RNF-10 | Adaptación a escritorio y zoom | `docs/02_requirements/rnf10_requirement_description.md`, `frontend/src/styles/globals.css` | Layout fluido general del frontend y estilos globales compartidos. | `CP-RNF10-01` no ejecutado, `desviaciones_funcionales.md` → D-Pendiente-01 | Hay indicios de diseño responsive de escritorio, pero no existe validación en 1366×768, 1440×900 y 1920×1080 con zoom 100/125/150. | **Cumple parcial** |

**Resumen RNF:** 10 requisitos no funcionales evaluados → 4 cumplen, 5 cumplen parcialmente, 1 no cumple.

---

## 4. Hallazgos transversales consolidados

| ID | Severidad | Diferencia diseño vs implementación | Requisitos afectados |
|---|---|---|---|
| D-01 | Alto | No se aplica el máximo de 3 citas pendientes por paciente. | RF-01 |
| D-02 | Crítico | No existe diferenciación real entre roles en la interfaz. | RNF-02, RNF-05 |
| D-03 | Alto | Se pueden cancelar citas cuya hora ya pasó. | RF-09 |
| D-04 | Alto | El modelo de paciente implementado es más corto que el diseñado. | RF-05 |
| D-05 | Medio | La UI no expone comprobante de pago ni cuota para sesiones terapéuticas. | RF-01 |
| D-T1 | Alto transversal | La solución en `develop` es frontend-only con `localStorage`; no hay backend compartido. | RF-01, RF-04, RF-05, RF-08, RF-09, RNF-01, RNF-02, RNF-04 |
| D-Pendiente-01 | Pendiente | No se ejecutó la validación multi-resolución y multi-zoom. | RNF-10 |
| D-Pendiente-02 | Pendiente | No se ejecutó prueba con usuario novato externo al equipo. | RNF-07 |

---

## 5. Resultado global de conformidad

| Universo | Cumple | Cumple parcial | No cumple | Total |
|---|---:|---:|---:|---:|
| RF | 6 | 3 | 0 | 9 |
| RNF | 4 | 5 | 1 | 10 |
| **Global** | **10** | **8** | **1** | **19** |

### Conclusión

La implementación de la rama `develop` **sí corresponde en gran medida al diseño funcional principal**, pero todavía no puede declararse conforme al 100% por tres razones estructurales:

1. Existen **desviaciones funcionales de negocio** ya confirmadas por pruebas (D-01, D-03, D-04, D-05).
2. Existe una **desviación crítica de control de acceso** (D-02) que impide cerrar RNF-02 y RNF-05.
3. La rama evaluada es un **prototipo frontend sin backend compartido**, lo que impacta RNF-01 y RNF-04.