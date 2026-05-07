# Reporte de conformidad funcional
---

## En una sola línea

> El sistema **hace lo que debe hacer** en los flujos importantes. Hay **4 reglas funcionales** que no se cumplen y deben arreglarse antes de pasar a producción.

---

## Resumen visual

```
Pruebas de aceptación (¿el usuario puede cumplir su objetivo?)
✅ Pasaron:  16
🟡 Observac.: 1
❌ Fallaron:  3
⚪ No exec.:  1
   Total:    21

Pruebas de sistema (¿los flujos completos funcionan?)
✅ Pasaron:  5
🟡 Observac.: 1
❌ Fallaron:  0
   Total:    6
```

**Traducción:** de 27 pruebas, **21 pasaron limpio, 2 con observación, 3 fallaron y 1 no se pudo ejecutar**.

---

## ¿Qué responde esta validación?

### 1. ¿El sistema hace lo que el requisito dice?

✅ **Sí, en su mayoría.** Los 9 RF principales tienen comportamiento alineado con su documentación, salvo 3 reglas específicas:

- RF-01: la regla "máximo 3 citas pendientes" no se aplica (D-01).
- RF-09: deja cancelar citas con hora ya pasada (D-03).
- RF-05: no guarda los campos extendidos del paciente (D-04).

### 2. ¿El flujo implementado corresponde al diseño funcional?

✅ **Sí.** Las pruebas de sistema (CPS-01 a CPS-06) confirmaron que el ciclo de vida de la cita, la validación de recursos, la persistencia, los estados y la sesión funcionan según el diseño consolidado.

### 3. ¿El usuario puede completar el proceso esperado de inicio a fin?

✅ **Sí.** Las pruebas de aceptación cubrieron crear cita, ver detalle, reagendar, cancelar y consultar historial. Todos los flujos terminan exitosamente.

### 4. ¿Existen reglas funcionales incumplidas?

⚠️ **Sí, cuatro:**

- D-01: regla de 3 citas pendientes (RF-01).
- D-02: control de acceso por rol (RNF-02, RNF-05).
- D-03: cancelar después de la hora programada (RF-09).
- D-04: modelo de paciente reducido (RF-05).

### 5. ¿Existen comportamientos implementados que no estaban previstos en el diseño?

✅ **Sí, pero son aportes positivos:**

- Dashboard con tarjetas y panel de "Alertas de atraso".
- Sistema de notificaciones tipo toast.
- Bitácora `auditLogs` (sustituye a `appointment_history` del diseño).
- Hora simulada (`DEMO_NOW`) para que la demo siempre muestre citas en distintos estados.

Ninguno es una desviación negativa, pero conviene anotarlos para evitar parecer "código sin documento".

### 6. ¿Existen funcionalidades diseñadas que no se reflejan en la implementación?

⚠️ **Sí, dos principales:**

- Tabla `appointment_history` (reemplazada por `auditLogs`).
- Campos extendidos del paciente: género, dirección, contacto de emergencia, notas médicas.

---

## Estado de conformidad por requisito

### Requisitos funcionales

| ID | Requisito | Pasaron | Fallaron | Estado |
|:---:|---|:---:|:---:|:---:|
| RF-01 | Crear cita | 5/6 | 1/6 (D-01, D-05) | 🟡 |
| RF-02 | Resumen antes de confirmar | 1/1 | 0 | ✅ |
| RF-03 | Validar disponibilidad | (cubierto en RF-01 + CPS-02) | 0 | ✅ |
| RF-04 | Folio único de paciente | 1/1 | 0 | ✅ |
| RF-05 | Guardar paciente y historial | 1/1 (con observación) | 0 (D-04) | 🟡 |
| RF-06 | Consultar detalle | 1/1 | 0 | ✅ |
| RF-07 | Marcar atrasadas | 1/1 | 0 | ✅ |
| RF-08 | Reagendar | 2/2 | 0 | ✅ |
| RF-09 | Cancelar | 2/3 | 1/3 (D-03) | 🟡 |

**Resumen RF:** 6 cumplen completos, 3 cumplen con desviación.

### Requisitos no funcionales (visibles)

| ID | Requisito | Pasaron | Fallaron | Estado |
|:---:|---|:---:|:---:|:---:|
| RNF-02 | Acceso seguro | 2/3 | 1/3 (D-02) | 🟡 |
| RNF-05 | Datos mínimos en pantalla | (cubierto en RNF-02) | (D-02) | 🟡 |
| RNF-07 | Flujo simple | 1/1 | 0 | ✅ |
| RNF-08 | Mensajes de validación | 1/1 | 0 | ✅ |
| RNF-09 | Toasts y alertas | 1/1 | 0 | ✅ |
| RNF-10 | Adaptación a pantallas | 0/1 (no ejecutado) | — | ⚪ |

**Resumen RNF:** 3 cumplen completos, 2 con desviación, 1 sin verificar.

---

## Mapa: artefacto del Ciclo V → prueba ejecutada

Como pidió la nota del Ciclo V, **cada prueba apunta a un artefacto** del lado izquierdo:

```
Definición de requerimientos  ↔  Pruebas de aceptación
   docs/02_requirements/*         CP-RF01-01 a CP-RF09-03
                                  CP-RNF02-01 a CP-RNF10-01

Diseño funcional               ↔  Pruebas de sistema
   docs/05_final/                 CPS-01 a CPS-06
   implementation_context.md
   diseño_base_de_datos.md
```

No probamos por probar. Cada caso de prueba referencia un documento del lado izquierdo en su campo "Apunta a".

---

## Recomendaciones, en orden de prioridad

### 🔴 Antes de poner el sistema en producción

1. **Implementar diferenciación por rol** (D-02) — afecta RNF-02 y RNF-05.

### 🟠 Antes de la siguiente entrega

2. **Aplicar regla de 3 citas pendientes** (D-01) — la función ya existe, solo falta llamarla.
3. **Validar que solo se puedan cancelar citas no pasadas** (D-03).
4. **Decidir alcance del modelo de paciente** (D-04) — extendido o mínimo, y alinear código y diseño.
5. **Documentar formalmente que el módulo es un prototipo sin backend** (D-T1) — esto explica por qué algunos RNF quedan parcialmente cumplidos.

### 🟡 Mejora continua

6. **Agregar UI de comprobante de pago y cuota** (D-05) en sesiones terapéuticas.
7. **Ejecutar pruebas de pantalla y zoom** (D-Pendiente-01).
8. **Hacer prueba de usabilidad con usuario novato** (D-Pendiente-02).

---

## Veredicto

🟡 **Aprobado con observaciones.**

El módulo cumple su función principal y supera el grueso de las pruebas funcionales. Sin embargo, **D-02 (sin diferenciación por rol)** es una desviación crítica que debe atenderse antes de cualquier despliegue real.

Las desviaciones D-01, D-03 y D-04 son ajustes localizados que se pueden cerrar rápidamente con cambios puntuales en el código.

D-T1 (persistencia en navegador) es una decisión de arquitectura que **no es un error**, pero debe documentarse explícitamente como limitación del prototipo.

---

## Checklist del entregable de la célula

- [x] Se revisaron los RF asignados a la célula (9 RF revisados).
- [x] Se revisaron los RNF visibles asignados a la célula (6 RNF revisados).
- [x] Se ejecutaron pruebas de sistema sobre flujos completos (6 pruebas).
- [x] Se ejecutaron pruebas de aceptación orientadas al usuario (21 pruebas).
- [x] Se documentaron resultados esperados y resultados reales.
- [x] Se registraron evidencias de validación.
- [x] Se identificaron desviaciones funcionales (8 desviaciones, incluyendo 2 pendientes).
- [x] Se reportaron hallazgos a la célula integradora (mapeo en `desviaciones_funcionales.md`).

---

## Archivos relacionados

- 📋 `casos_de_prueba_funcionales.md` — el catálogo completo de pruebas con pasos y resultados esperados.
- 🧪 `evidencia_pruebas_aceptacion.md` — resultado de las pruebas de aceptación.
- 🧪 `evidencia_pruebas_sistema.md` — resultado de las pruebas de sistema.
- ⚠️ `desviaciones_funcionales.md` — las 8 desviaciones detectadas, con detalle.
