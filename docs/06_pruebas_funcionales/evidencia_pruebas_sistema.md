# Evidencia de pruebas de sistema

> Aquí está el resultado de probar el sistema **de extremo a extremo**: flujos completos que recorren varios módulos a la vez.

## ¿Qué es una prueba de sistema?

A diferencia de una prueba de aceptación (que mira una funcionalidad puntual), la **prueba de sistema** sigue un escenario de uso completo. Pasa por:

```
UI → servicios → almacenamiento → servicios → UI
```

Apunta al **diseño funcional** del sistema (cómo están conectadas las piezas).

## ¿Cómo está organizado este documento?

Cada caso ejecutado tiene:

- **Escenario:** qué historia se probó.
- **Resultado esperado:** lo que debería pasar al final.
- **Resultado real:** lo que sí pasó.
- **Estado:** ✅ pasó · 🟡 pasó con observación · ❌ falló · ⚪ no se ejecutó.

---

## CPS-01 — Vida completa de una cita: alta → reagendar → cancelar

**Escenario:** una secretaria recibe a un paciente nuevo, le asigna primera cita, luego él pide cambiarla, y finalmente la cancela.

**Pasos ejecutados:**

1. ✅ Login como secretaria.
2. ✅ Crear cita con paciente nuevo "María López" (RF-01 + RF-04).
3. ✅ Verificar en calendario que aparece la cita.
4. ✅ Abrir detalle, click en "Reagendar", elegir nuevo horario válido (RF-08).
5. ✅ Confirmar. Cita original archivada como "Reprogramada", nueva creada.
6. ✅ Volver al calendario: solo se ve la cita nueva.
7. ✅ Abrir detalle de la cita nueva, click en "Cancelar", motivo "Paciente avisó por teléfono" (RF-09).
8. ✅ Confirmar. Cita pasa a estado "Cancelada".
9. ✅ Ir a "Pacientes", buscar a María López, abrir su historial (RF-05).
10. ✅ Verificar que aparecen ambas citas: la "Reprogramada" y la "Cancelada".

**Resultado esperado:** cada paso se completa, los estados se rastrean, el folio del paciente se mantiene.

**Resultado real:** ✅ Todos los pasos se completaron correctamente. El folio del paciente (`PAC-XXXX`) se mantiene en ambas citas. Los `auditLogs` registran las acciones `CREATE`, `RESCHEDULE` y `CANCEL`.

**Estado:** ✅ Pasó.

---

## CPS-02 — Validación de recursos en cadena

**Escenario:** validar que cada uno de los tres recursos (terapeuta, sala, paciente) bloquea correctamente un horario.

**Pasos ejecutados:**

1. ✅ Crear C1: terapeuta T1, sala S1, paciente P1, lunes 10:00–11:00.
2. ✅ Intentar C2 con T1, sala S2, paciente P2, lunes 10:30 (solapa T1).
   - **Real:** rechazada con "El terapeuta ya tiene una cita en ese horario." ✅
3. ✅ Intentar C3 con T2, sala S1, paciente P3, lunes 10:30 (solapa S1).
   - **Real:** rechazada con "La sala ya está reservada en ese horario." ✅
4. ✅ Intentar C4 con T2, sala S2, paciente P1, lunes 10:30 (solapa P1).
   - **Real:** rechazada con "El paciente ya tiene una cita en ese horario." ✅
5. ✅ Crear C5 con T2, sala S2, paciente P3, lunes 11:30.
   - **Real:** se crea exitosamente. ✅

**Resultado esperado:** cada conflicto se detecta y se reporta con mensaje específico al recurso bloqueado. El caso sin conflicto se crea normalmente.

**Resultado real:** ✅ Las cuatro validaciones funcionaron correctamente. Los mensajes son específicos.

**Estado:** ✅ Pasó.

---

## CPS-03 — Persistencia entre sesiones

**Escenario:** verificar que los datos sobreviven al cierre del navegador.

**Pasos ejecutados:**

1. ✅ Crear cita.
2. ✅ Cerrar sesión.
3. ✅ Cerrar pestaña del navegador.
4. ✅ Volver a abrir la aplicación.
5. ✅ Iniciar sesión.
6. ✅ Verificar que la cita sigue ahí.

**Resultado esperado:** datos persistentes.

**Resultado real:** 🟡 La cita persiste correctamente porque la aplicación usa `localStorage`. **Sin embargo, si el usuario borra los datos del navegador o usa modo incógnito, todo se pierde.** Esto es esperado dado que no hay backend.

**Estado:** 🟡 Pasó con observación.

**Observación:** este comportamiento es aceptable para un prototipo, pero **no para producción**. Documentado en `desviaciones_funcionales.md` → contexto de **D-T1**.

---

## CPS-04 — Visualización de citas en distintos estados

**Escenario:** verificar que el calendario distingue visualmente cada estado.

**Pasos ejecutados:**

1. ✅ Cargar calendario con datos de seed.
2. ✅ Ubicar cita programada — color azul base.
3. ✅ Ubicar cita finalizada — color atenuado/gris.
4. ✅ Buscar cita cancelada — no aparece en el calendario, pero sí en historial del paciente con icono y color rojo.
5. ✅ Buscar cita reprogramada — archivada, no aparece en el calendario actual.
6. ✅ Ubicar cita atrasada (hora pasada, estado programada) — color rojo con animación pulsante.

**Resultado esperado:** distinción visual clara para cada estado.

**Resultado real:** ✅ La distinción visual es clara y consistente. El dashboard refuerza la vista de atrasadas con un panel dedicado.

**Estado:** ✅ Pasó.

---

## CPS-05 — Login → operación → cierre de sesión

**Escenario:** ciclo completo de uso por un turno de la secretaria.

**Pasos ejecutados:**

1. ✅ Login como secretaria.
2. ✅ Realizar varias operaciones: crear 2 citas, reagendar 1, cancelar 1.
3. ✅ Verificar contador de operaciones reflejado en el dashboard.
4. ✅ Logout.
5. ✅ Verificar que al cerrar sesión, la pantalla regresa al login.

**Resultado esperado:** sesión bien gestionada, dashboard actualizado, salida limpia.

**Resultado real:** ✅ Todo correcto. La aplicación protege las vistas: si no hay sesión, no se puede acceder al dashboard ni a las acciones.

**Estado:** ✅ Pasó.

---

## CPS-06 — Carga inicial con seed limpio

**Escenario:** primera vez que un usuario abre la aplicación.

**Pasos ejecutados:**

1. ✅ Limpiar `localStorage` del navegador.
2. ✅ Recargar la aplicación.
3. ✅ Iniciar sesión.

**Resultado esperado:** el seed inicializa terapeutas, salas, catálogos y datos demo. El sistema queda listo para operar.

**Resultado real:** ✅ El seed crea: 2 usuarios, 3 terapeutas, 3 salas, 4 estados de cita, 2 tipos de sesión, varias citas demo en distintos estados. Todo aparece visible y funcional.

**Estado:** ✅ Pasó.

---

# Resumen de pruebas de sistema

| Estado | Cantidad |
|:---|---:|
| ✅ Pasaron | 5 |
| 🟡 Pasaron con observación | 1 |
| ❌ Fallaron | 0 |
| ⚪ No ejecutadas | 0 |
| **Total** | **6** |

## Lectura rápida

- 🟢 **Los flujos completos funcionan**. El sistema soporta el ciclo de vida completo de una cita y respeta la trazabilidad del paciente.
- 🟡 La persistencia depende del navegador del usuario. Esto es por la arquitectura actual (sin backend) y debe atenderse antes de producción.

## Mapa: prueba de sistema → diseño funcional

| Prueba | Diseño funcional que valida |
|---|---|
| CPS-01 | Ciclo de vida de la cita: creación, reagendamiento, cancelación, historial. |
| CPS-02 | Modelo de validación de recursos (`validation.ts`) y reglas de solapamiento. |
| CPS-03 | Capa de persistencia (`storage.ts`) y arranque desde almacenamiento. |
| CPS-04 | Estados de la cita y su mapeo visual. |
| CPS-05 | Modelo de sesión (login/logout/protección de vistas). |
| CPS-06 | Inicialización del sistema desde el seed. |

Cada prueba apunta a un artefacto del diseño funcional, como pide la nota del Ciclo V. **No probamos por probar.**

