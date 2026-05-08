# Célula 1 — Procedimiento paso a paso

> Guía operativa. Define el orden, las acciones concretas y la evidencia que la Célula 1 debe producir en cada etapa para llegar a un reporte final defensible.

---

## Mapa de etapas

```
 ┌───────────────────────────────────────────────────────────────────────┐
 │  Etapa 0  Preparación                                                  │
 │  Etapa 1  Inventario de artefactos                                     │
 │  Etapa 2  Levantamiento de la matriz extendida                         │
 │  Etapa 3  Verificación documental cruzada                              │
 │  Etapa 4  Recepción de hallazgos de Célula 2 (funcional)               │
 │  Etapa 5  Recepción de hallazgos de Célula 3 (técnica)                 │
 │  Etapa 6  Consolidación de hallazgos                                   │
 │  Etapa 7  Clasificación de conformidad por requisito                   │
 │  Etapa 8  Reporte final                                                │
 │  Etapa 9  Cierre y archivo                                             │
 └───────────────────────────────────────────────────────────────────────┘
```

Cada etapa produce **un artefacto** o **un cambio rastreable** dentro de los entregables. No se avanza a la etapa siguiente sin haber cerrado la anterior.

---

## Etapa 0 — Preparación

**Objetivo:** dejar el entorno listo y la versión congelada antes de validar.

### 0.1. Acciones

1. Confirmar la rama de trabajo (actual: `contexto_ia`) y el commit de corte.
2. Ejecutar `git status` y verificar que no haya cambios locales sin guardar que afecten la lectura.
3. Levantar el backend para verificar que arranca: `mvn spring-boot:run` (o el script equivalente del proyecto).
4. Confirmar acceso a la base de datos en el entorno usado (PostgreSQL local o H2 según perfil).
5. Crear o actualizar la subcarpeta `docs/05_final/celula_01_integradora/`.

### 0.2. Salida esperada

- Commit y rama anotados en la cabecera de cada entregable.
- Backend arrancando sin errores fatales (los warnings se anotan, no bloquean).

### 0.3. Checklist

- [ ] Rama `contexto_ia` confirmada.
- [ ] Commit de corte registrado.
- [ ] Backend levanta.
- [ ] BD accesible.
- [ ] Carpeta de la célula creada.

---

## Etapa 1 — Inventario de artefactos

**Objetivo:** confirmar qué artefactos existen, dónde están y si están bien nombrados.

### 1.1. Acciones

1. Listar `docs/02_requirements/` y registrar los RF y RNF presentes.
2. Listar `docs/03_modeling/` y verificar que cada RF con documento tenga su diagrama de flujo.
3. Listar `docs/04_design/` y verificar nombre canónico `rf##_database_design.md`.
   - Reportar inmediatamente cualquier desviación (ej. `rf05.database_desing.md`).
4. Listar `prototypes/` y verificar correspondencia con los RF que aplican.
5. Listar `backend/src/main/java/com/clinica/agenda/` y registrar los paquetes principales.
6. Listar `backend/src/main/resources/db/migration/` y registrar el schema y seed vigentes.
7. Volcar el inventario a una tabla simple en notas internas.

### 1.2. Salida esperada

Tabla en la sección de inventario del entregable 1, con columnas:

| Artefacto | Ruta | Estado | Convención de nombre | Observación |
|---|---|---|---|---|

### 1.3. Checklist

- [ ] Lista cerrada de RF/RNF documentados.
- [ ] Lista de diagramas confirmada.
- [ ] Lista de diseños técnicos confirmada con violaciones de convención reportadas.
- [ ] Lista de prototipos confirmada.
- [ ] Inventario de código confirmado a nivel paquete.

---

## Etapa 2 — Levantamiento de la matriz extendida

**Objetivo:** producir el entregable 1 (`02_matriz_trazabilidad_diseño_vs_implementacion.md`).

### 2.1. Acciones

1. Tomar la matriz base de `docs/05_final/matriz_trazabilidad.md`.
2. Para cada RF y RNF, **agregar las columnas extendidas**:
   - `Archivo de implementación` (ruta + clase/función principal).
   - `Punto de prueba sugerido` (cómo se prueba: endpoint, flujo en UI, query SQL).
   - `Evidencia de validación` (qué archivo o captura sostiene la afirmación).
   - `Cambio no documentado` (Sí/No).
   - `Deuda de implementación` (Sí/No).
3. Cruzar contra `backend/src/main/java/...` para identificar el archivo más relevante por RF.
   - RF-01 → `service/AppointmentService.java` (`create`).
   - RF-03 → `service/AvailabilityService.java`.
   - RF-04 → `service/FolioGenerator.java`.
   - RF-05 → `service/PatientService.java` + `model/Patient.java`.
   - RF-06 → `web/AppointmentWebController.java` + `templates/appointments/detail.html`.
   - RF-07 → `service/AppointmentService.java#isLate`.
   - RF-08 → `service/AppointmentService.java#reschedule`.
   - RF-09 → `service/AppointmentService.java#cancel`.
   - RF-11 → ❌ no detectado en código (ningún paquete de mailing o template de correo).
4. Marcar cada celda según la **convención de estados** (✅ / ⚠️ / ❌ / 🔲).
5. Dejar `Conformidad` en 🔲 hasta que las Células 2 y 3 reporten.

### 2.2. Salida esperada

Archivo `02_matriz_trazabilidad_diseño_vs_implementacion.md` con:

- Encabezado, fecha, rama y commit.
- Tabla extendida de RF.
- Tabla extendida de RNF.
- Tabla de artefactos transversales.
- Bloque de discrepancias detectadas en levantamiento documental.

### 2.3. Checklist

- [ ] Todos los RF presentes en la tabla extendida.
- [ ] Todos los RNF presentes en la tabla extendida.
- [ ] Cada fila tiene archivo de implementación o se marca `❌ Sin implementación detectada`.
- [ ] Cada fila tiene punto de prueba sugerido.
- [ ] Conformidad temporal en 🔲 (sin verificar) hasta integración de hallazgos.

---

## Etapa 3 — Verificación documental cruzada

**Objetivo:** detectar incoherencias entre documentos antes de que las Células 2 y 3 las descubran a mano.

### 3.1. Acciones

1. Comparar nombres de estado de cita entre:
   - `docs/02_requirements/rf02_requirement_description.md` (usa `Pendiente`).
   - `docs/05_final/diseño_base_de_datos.md` (usa `SCHEDULED`).
   - `backend/src/main/resources/db/migration/V2__seed.sql` (usa `SCHEDULED`).
   - `backend/src/main/java/com/clinica/agenda/enums/AppointmentStatusCode.java`.
   - **Discrepancia D-01:** documentar el desalineamiento literal.
2. Verificar referencias cruzadas dentro de los documentos de requisitos.
   - **Discrepancia D-02:** RF-05 referencia "RF-06" y "RF-07" con sentido distinto al definido en el proyecto.
3. Confirmar nombres de archivo:
   - **Discrepancia D-03:** `docs/04_design/rf05.database_desing.md` viola convención.
4. Listar requisitos sin diseño:
   - **Discrepancia D-04:** RF-03, RF-04, RF-11 sin documento de requisito ni de diseño.
5. Para cada discrepancia, registrar:
   - ID, origen, descripción, impacto, célula responsable.

### 3.2. Salida esperada

Sección "Discrepancias documentales" dentro del entregable 1 y entrada inicial en el entregable 2.

### 3.3. Checklist

- [ ] D-01 confirmada y documentada.
- [ ] D-02 confirmada y documentada.
- [ ] D-03 confirmada y documentada.
- [ ] D-04 confirmada y documentada.
- [ ] Discrepancias adicionales detectadas durante el cruce, también registradas.

---

## Etapa 4 — Recepción de hallazgos de Célula 2 (funcional)

**Objetivo:** integrar el reporte funcional de Célula 2 sin alterarlo.

### 4.1. Acciones

1. Leer el reporte recibido (`docs/05_final/hallazgo_de_las_celulas.md` o el archivo que la Célula 2 designe).
2. Para cada hallazgo:
   - Asignarle un ID de la forma `H-C2-NNN` si la célula no lo asignó.
   - Mapearlo al RF o RNF afectado.
   - Registrar severidad declarada por Célula 2.
   - Si la severidad no fue declarada, solicitarla formalmente. **No estimar.**
3. Si un hallazgo refiere a un RF que ya estaba en estado 🔲, dejarlo en 🔲 hasta que Célula 3 también opine, salvo que Célula 2 sea la única responsable de ese RF según `matriz_trazabilidad.md`.

### 4.2. Salida esperada

Filas agregadas al entregable 2 (`03_lista_consolidada_hallazgos.md`) con origen `Célula 2`.

### 4.3. Checklist

- [ ] Todos los hallazgos de Célula 2 incorporados.
- [ ] IDs únicos asignados.
- [ ] RF/RNF afectado identificado en cada uno.
- [ ] Hallazgos sin severidad reenviados a Célula 2 para aclaración.

---

## Etapa 5 — Recepción de hallazgos de Célula 3 (técnica)

**Objetivo:** integrar el reporte técnico de Célula 3 con la misma lógica que la 4.

### 5.1. Acciones

1. Repetir el proceso de la Etapa 4 con prefijo `H-C3-NNN`.
2. Prestar especial atención a:
   - RF-03 (validación de disponibilidad): si Célula 3 confirma que `AvailabilityService` cumple, registrar como evidencia.
   - RF-04 (folio): si confirma `FolioGenerator`, registrar.
   - Artefactos transversales (ER, arquitectura, casos de uso): si Célula 3 reporta ausencia, registrar como deuda documental.
   - RNF-02, RNF-04, RNF-06: validaciones técnicas (roles, logs, /actuator/health).

### 5.2. Salida esperada

Filas agregadas al entregable 2 con origen `Célula 3`.

### 5.3. Checklist

- [ ] Todos los hallazgos de Célula 3 incorporados.
- [ ] IDs únicos asignados.
- [ ] Validaciones de RF-03 y RF-04 confirmadas o rebatidas.
- [ ] Artefactos transversales evaluados.

---

## Etapa 6 — Consolidación de hallazgos

**Objetivo:** producir el entregable 2 cerrado.

### 6.1. Acciones

1. Detectar **duplicados** entre Célula 2 y Célula 3 (un mismo síntoma reportado por dos lados).
   - Si son el mismo hallazgo: fusionar y conservar las dos referencias en el campo `Origen`.
   - Si son síntomas distintos del mismo problema: dejarlos separados pero **enlazarlos** con un campo `Relacionado con`.
2. Detectar **contradicciones** entre Célula 2 y Célula 3.
   - Levantar una **observación de conflicto** (`OC-NNN`) con descripción y propuesta de resolución.
   - No cerrar el hallazgo hasta que la contradicción se resuelva.
3. Aplicar la **matriz de severidad**:

   | Severidad | Criterio |
   |---|---|
   | Crítica | Bloquea operación de la agenda o produce datos inválidos. |
   | Alta | Afecta una funcionalidad principal pero hay alternativa manual. |
   | Media | Diferencia entre diseño e implementación que no rompe operación. |
   | Baja | Cosmético, documental o de convención. |

4. Asignar **dueño** y **decisión propuesta**:
   - Decisiones permitidas: `Corregir antes del cierre`, `Aceptar como deuda`, `Postergar`, `Escalar a stakeholder`.

### 6.2. Salida esperada

Entregable 2 (`03_lista_consolidada_hallazgos.md`) cerrado, con tabla maestra y resumen de severidades.

### 6.3. Checklist

- [ ] Duplicados fusionados.
- [ ] Contradicciones registradas y en proceso de resolución o resueltas.
- [ ] Severidad asignada a cada hallazgo.
- [ ] Dueño y decisión asignados.

---

## Etapa 7 — Clasificación de conformidad por requisito

**Objetivo:** producir el entregable 3.

### 7.1. Acciones

1. Para cada RF y RNF, aplicar la siguiente regla:

   ```
   Si NO hay hallazgos abiertos críticos o altos contra el requisito
   y la implementación cubre todos los criterios del documento de requisito
   y existe evidencia de validación,
       => ✅ Cumple
   Si hay hallazgos medios o si la implementación cubre solo parte de los criterios,
       => ⚠️ Cumple parcial
   Si hay hallazgos críticos o altos sin resolución,
   o si no existe implementación detectada,
       => ❌ No cumple
   Si no hay evidencia suficiente,
       => 🔲 Sin verificar (no debe quedar así al cierre)
   ```

2. Justificar cada estado con:
   - Hallazgos asociados (IDs).
   - Archivo de implementación.
   - Evidencia.
3. Marcar requisitos sin documento como **Cambio no documentado** (si están implementados) o **Deuda de implementación** (si no están).

### 7.2. Salida esperada

Entregable 3 (`04_clasificacion_conformidad.md`) con la tabla de estados finales.

### 7.3. Checklist

- [ ] 0 filas en 🔲.
- [ ] Cada estado tiene justificación trazable.
- [ ] Cambios no documentados marcados.
- [ ] Deudas de implementación marcadas.

---

## Etapa 8 — Reporte final

**Objetivo:** producir el entregable 4.

### 8.1. Acciones

1. Generar resumen ejecutivo (1 página).
2. Generar tablero de KPIs:
   - % de RF cumple totalmente.
   - % de RNF cumple totalmente.
   - Cantidad de hallazgos críticos / altos / medios / bajos.
   - Cantidad de cambios no documentados.
   - Cantidad de deudas de implementación.
3. Listar **decisiones tomadas**:
   - Qué se acepta como deuda.
   - Qué se exige corregir antes del cierre.
   - Qué se escala a stakeholder.
4. Listar **recomendaciones** para sprints siguientes.
5. Firmar y fechar.

### 8.2. Salida esperada

Entregable 4 (`05_reporte_final_validacion.md`) firmado.

### 8.3. Checklist

- [ ] Resumen ejecutivo redactado.
- [ ] KPIs calculados.
- [ ] Decisiones documentadas.
- [ ] Recomendaciones documentadas.
- [ ] Firma + fecha + commit anotados.

---

## Etapa 9 — Cierre y archivo

**Objetivo:** dejar el entregable navegable y trazable a futuro.

### 9.1. Acciones

1. Actualizar `README.md` de la carpeta de la célula con enlaces.
2. Actualizar `docs/05_final/matriz_trazabilidad.md` con los estados finales (la Célula 1 es la responsable de mantenerla al día).
3. Crear commit con los entregables y un mensaje claro:
   - Ej. `docs: cierre Célula 1 (validación integral) — corte <commit>`.
4. Anotar en `hallazgo_de_las_celulas.md` el cierre y la referencia al reporte final.

### 9.2. Salida esperada

Carpeta consistente, índice navegable y matriz base sincronizada.

### 9.3. Checklist

- [ ] README de la célula actualizado.
- [ ] `matriz_trazabilidad.md` sincronizada.
- [ ] Commit creado.
- [ ] Cierre anotado en `hallazgo_de_las_celulas.md`.

---

## Reglas para hacer evidencia válida

Una afirmación tiene evidencia válida cuando se cumple **al menos una** de estas formas:

| Tipo de evidencia | Formato aceptado |
|---|---|
| Código | Ruta `archivo:linea` y nombre de la función o método relevante. |
| Migración SQL | Ruta del archivo y línea/sección. |
| Endpoint | Verbo + ruta + comportamiento esperado. |
| Captura UI | Imagen guardada en `docs/05_final/celula_01_integradora/evidencia/` con nombre `EV-NNN_<descripcion>.png`. |
| Log | Extracto de `logs/` con timestamp y categoría. |
| Prueba ejecutada | ID de prueba o comando ejecutado + salida esperada. |
| Consulta SQL | Sentencia SQL + resultado obtenido. |

> Texto sin evidencia **no cuenta**. La célula puede registrar la observación, pero el estado del requisito permanece en 🔲.

---

## Plantilla mínima de hallazgo

```markdown
### H-CX-NNN — <Título corto>

- Origen: Célula 2 / Célula 3 / Célula 1 (cruce documental)
- Requisito afectado: RF-XX o RNF-XX
- Severidad: Crítica / Alta / Media / Baja
- Tipo: Funcional / Técnica / Documental / Cambio no documentado / Deuda
- Descripción: <qué se observó>
- Evidencia: <ruta, captura o log>
- Decisión propuesta: Corregir / Aceptar / Postergar / Escalar
- Dueño: <persona o rol>
- Estado: Abierto / En análisis / Resuelto / Aceptado
```

> Esta plantilla se usa en el entregable 2 y se referencia desde el entregable 4.

---

## Riesgos del proceso

| Riesgo | Mitigación |
|---|---|
| Las Células 2 y 3 entregan tarde | Avanzar la matriz extendida y la verificación documental en paralelo, dejando solo las columnas de hallazgos abiertas. |
| Los hallazgos llegan sin severidad | Devolverlos para clasificación; no estimar severidad en lugar de la célula origen. |
| El código cambia durante el proceso | Congelar commit de corte. Cualquier cambio posterior se evalúa en una segunda iteración. |
| Discrepancias documentales no se resuelven | Escalar al stakeholder y registrar la decisión como aceptada o postergada. |

---

> Este procedimiento es la guía operativa de la Célula 1. Los entregables son los archivos siguientes en esta carpeta.
