# Entregable 2 — Lista consolidada de hallazgos

> **Cabecera de control**
>
> | Campo | Valor |
> |---|---|
> | Célula | Célula 1 — Integradora |
> | Fecha de corte | 2026-05-07 |
> | Rama | `contexto_ia` |
> | Versión | 1.0 — registro inicial. Pendiente integración Célula 2 y Célula 3 |

---

## 1. Propósito

Consolida en un único registro **todos los hallazgos** detectados durante la validación del módulo, vengan de:

- La verificación documental cruzada de la Célula 1.
- Los reportes funcionales de la Célula 2.
- Los reportes técnicos de la Célula 3.

Cada hallazgo lleva un identificador, severidad, requisito afectado y decisión.

---

## 2. Convenciones

### 2.1. Numeración

| Prefijo | Origen |
|---|---|
| `H-C1-NNN` | Detectado por la Célula 1 (cruce documental, inventario). |
| `H-C2-NNN` | Reportado por la Célula 2 (funcional / UX). |
| `H-C3-NNN` | Reportado por la Célula 3 (técnico / diseño). |
| `OC-NNN` | Observación de conflicto entre células (a resolver antes de cerrar). |
| `D-NN` | Discrepancia documental (referencia interna a la matriz). |

### 2.2. Severidad

| Severidad | Criterio |
|---|---|
| Crítica | Bloquea operación de la agenda o produce datos inválidos. |
| Alta | Afecta una funcionalidad principal pero hay alternativa manual. |
| Media | Diferencia entre diseño e implementación que no rompe operación. |
| Baja | Cosmético, documental o de convención. |

### 2.3. Tipo

- **Funcional** — comportamiento del sistema frente al usuario.
- **Técnica** — diseño, esquema, configuración, infraestructura.
- **Documental** — desviación de convención, referencia rota, archivo faltante.
- **Cambio no documentado** — implementación sin respaldo en requisitos/diseño.
- **Deuda de implementación** — diseño/requisito sin implementación.

### 2.4. Decisión

- **Corregir antes del cierre** — bloquea la entrega.
- **Aceptar como deuda** — se acepta y se registra para sprint futuro.
- **Postergar** — análisis adicional necesario.
- **Escalar a stakeholder** — requiere decisión externa.

### 2.5. Estado

`Abierto` → `En análisis` → `Resuelto` / `Aceptado` / `Postergado`.

---

## 3. Plantilla de hallazgo

```markdown
### H-CX-NNN — <Título corto y específico>

- Origen: Célula X (referencia al reporte)
- Requisito afectado: RF-XX o RNF-XX (o "Transversal")
- Severidad: Crítica / Alta / Media / Baja
- Tipo: Funcional / Técnica / Documental / Cambio no documentado / Deuda
- Descripción: <qué se observó, en qué condiciones>
- Evidencia: <ruta archivo:linea, captura, log, query>
- Impacto: <qué se rompe, quién se ve afectado>
- Decisión propuesta: Corregir / Aceptar / Postergar / Escalar
- Dueño: <persona o rol>
- Estado: Abierto / En análisis / Resuelto / Aceptado / Postergado
- Notas: <observaciones adicionales o vínculos a otros hallazgos>
```

---

## 4. Hallazgos detectados por la Célula 1 (cruce documental)

### H-C1-001 — Discrepancia de nombre de estado entre RF-02 y diseño/implementación

- Origen: Célula 1 — verificación documental cruzada
- Requisito afectado: RF-02 (y por arrastre RF-01, RF-08, RF-09)
- Severidad: Media
- Tipo: Documental
- Descripción: el documento `docs/02_requirements/rf02_requirement_description.md` usa el nombre `Pendiente` como estado inicial de la cita. El diseño `docs/05_final/diseño_base_de_datos.md` y la implementación (`enums/AppointmentStatusCode.java`, `V2__seed.sql`) usan `SCHEDULED`. La implementación es coherente entre sí; el documento es el desalineado.
- Evidencia: comparar literal `Pendiente` en RF-02 con `('SCHEDULED', 'Cita programada')` en `V2__seed.sql:7`.
- Impacto: confusión al leer el documento; una persona nueva podría implementar otro estado.
- Decisión propuesta: Corregir antes del cierre (actualizar documento de RF-02 para que use `SCHEDULED` o aclarar la traducción visual).
- Dueño: autor original de RF-02 / Célula 1
- Estado: Abierto
- Notas: equivale a la discrepancia D-01 de la matriz base.

### H-C1-002 — Referencias internas incorrectas en RF-05

- Origen: Célula 1 — verificación documental cruzada
- Requisito afectado: RF-05
- Severidad: Media
- Tipo: Documental
- Descripción: el documento de RF-05 hace referencias internas a "RF-06" como generación de ID y a "RF-07" como creación de citas, pero esos números corresponden a "Consultar detalles" y "Identificación visual de citas atrasadas", respectivamente.
- Evidencia: lectura del documento RF-05 vs la lista oficial de RF.
- Impacto: lectura del documento engaña al lector sobre dependencias entre requisitos.
- Decisión propuesta: Corregir antes del cierre (actualizar referencias).
- Dueño: autor original de RF-05 / Célula 1
- Estado: Abierto
- Notas: equivale a D-02.

### H-C1-003 — Archivo de diseño RF-05 fuera de convención

- Origen: Célula 1 — inventario
- Requisito afectado: RF-05
- Severidad: Baja
- Tipo: Documental
- Descripción: el archivo existe como `docs/04_design/rf05.database_desing.md`. La convención del proyecto es `rf##_database_design.md`.
- Evidencia: listado de `docs/04_design/`.
- Impacto: rompe trazabilidad automática y validadores que dependan del nombre canónico.
- Decisión propuesta: Corregir antes del cierre (renombrar a `rf05_database_design.md`).
- Dueño: Célula 1
- Estado: Abierto
- Notas: equivale a D-03.

### H-C1-004 — RF-03 implementado sin documento de requisito ni diseño

- Origen: Célula 1 — inventario
- Requisito afectado: RF-03
- Severidad: Alta
- Tipo: Cambio no documentado
- Descripción: la lógica de validación de disponibilidad de recursos está implementada en `service/AvailabilityService.java`, pero no existe documento de requisito ni de diseño. RF-03 es transversal y crítico (validación de terapeuta, sala y paciente).
- Evidencia: ausencia de archivo `rf03_requirement_description.md`. Implementación visible en `AvailabilityService#assertResourcesFree`.
- Impacto: la lógica más crítica del módulo no tiene respaldo documental. Cambios futuros pueden romper invariantes no escritas.
- Decisión propuesta: Corregir antes del cierre (formalizar documento de requisito y de diseño basados en la implementación actual).
- Dueño: Célula 1 + Célula 3
- Estado: Abierto
- Notas: parte de D-04.

### H-C1-005 — RF-04 implementado sin documento de requisito ni diseño

- Origen: Célula 1 — inventario
- Requisito afectado: RF-04
- Severidad: Media
- Tipo: Cambio no documentado
- Descripción: la generación automática de folio (`PAC-YYYYMMDD-NNNN`) está implementada en `service/FolioGenerator.java`, pero RF-04 no tiene documento ni diseño formal.
- Evidencia: `FolioGenerator.java`. Restricción `UNIQUE` en `patients.folio` en `V1__schema.sql:16`.
- Impacto: bajo a nivel operativo; alto a nivel trazabilidad.
- Decisión propuesta: Corregir antes del cierre (formalizar el RF-04 con el patrón documentado).
- Dueño: Célula 1
- Estado: Abierto
- Notas: parte de D-04.

### H-C1-006 — RF-11 sin documento y sin implementación

- Origen: Célula 1 — inventario
- Requisito afectado: RF-11
- Severidad: Alta (si la confirmación por correo es requisito de negocio) / Baja (si fue descartada)
- Tipo: Deuda de implementación
- Descripción: no existen documentos ni implementación de "Confirmación final por correo electrónico". No hay paquete de mailing en el backend ni dependencia `spring-boot-starter-mail`.
- Evidencia: ausencia total de archivos.
- Impacto: depende de la decisión del negocio.
- Decisión propuesta: Escalar a stakeholder (definir si RF-11 es requisito vigente o descartado).
- Dueño: Stakeholder + Célula 1
- Estado: Abierto
- Notas: parte de D-04.

### H-C1-007 — Esquema vigente extiende el diseño de BD documentado

- Origen: Célula 1 — comparación schema vs diseño
- Requisito afectado: RF-08, RF-09, transversal
- Severidad: Baja
- Tipo: Cambio no documentado (mejora)
- Descripción: el `V1__schema.sql` agrega campos y constraints no presentes en `diseño_base_de_datos.md`: `cancelled_by`, `rescheduled_to_id`, `fee`, `chk_appt_duration`. Son mejoras alineadas con los RF-08 y RF-09.
- Evidencia: `V1__schema.sql:54-76` vs `diseño_base_de_datos.md` sección 4.7.
- Impacto: bajo. Son mejoras coherentes; falta reflejarlas en el diseño.
- Decisión propuesta: Aceptar como deuda documental (actualizar diseño BD para incluirlas).
- Dueño: Célula 3 + Célula 1
- Estado: Abierto
- Notas: equivale a D-05.

### H-C1-008 — `audit_logs.payload` definido como `TEXT` y no `JSONB`

- Origen: Célula 1 — comparación schema vs diseño
- Requisito afectado: RNF-04 (observabilidad)
- Severidad: Baja
- Tipo: Documental + Técnica menor
- Descripción: el diseño define `payload JSONB`; la implementación usa `TEXT`.
- Evidencia: `V1__schema.sql:89` vs `diseño_base_de_datos.md` sección 4.8.
- Impacto: pierde indexación y búsqueda estructurada. Probablemente decisión por compatibilidad con H2 en perfil local.
- Decisión propuesta: Postergar (decidir si en perfil PostgreSQL se cambia a `JSONB`).
- Dueño: Célula 3
- Estado: Abierto
- Notas: equivale a D-06.

### H-C1-009 — Falta diagrama entidad-relación

- Origen: Célula 1 — inventario
- Requisito afectado: Transversal
- Severidad: Media
- Tipo: Deuda documental
- Descripción: no existe diagrama ER del módulo. Issue #30 abierta.
- Evidencia: ausencia en `docs/`.
- Impacto: dificulta validar integridad del modelo completo.
- Decisión propuesta: Aceptar como deuda (asignar dueño y plazo).
- Dueño: Célula 3
- Estado: Abierto

### H-C1-010 — Falta diagrama de arquitectura y de casos de uso

- Origen: Célula 1 — inventario
- Requisito afectado: Transversal
- Severidad: Media
- Tipo: Deuda documental
- Descripción: no existen diagramas de arquitectura (issues #31, #32) ni de casos de uso (issue #29).
- Evidencia: ausencia en `docs/`.
- Impacto: impide verificar separación de capas y cobertura de casos.
- Decisión propuesta: Aceptar como deuda.
- Dueño: Célula 3 + Stakeholder
- Estado: Abierto

---

## 5. Hallazgos pendientes de la Célula 2 (funcional)

> **Esta sección se llena con el reporte de la Célula 2.**
> La Célula 1 espera entradas con la siguiente plantilla.

### H-C2-001 — _Plantilla pendiente de llenar_

- Origen: Célula 2
- Requisito afectado: RF-XX
- Severidad: _por completar por Célula 2_
- Tipo: Funcional
- Descripción: _por completar_
- Evidencia: _por completar_
- Impacto: _por completar_
- Decisión propuesta: _por completar_
- Dueño: _por completar_
- Estado: Pendiente de reporte

> _Esperando reporte. Una vez recibido, los hallazgos H-C2-NNN reemplazarán esta plantilla._

### Áreas que la Célula 2 debe cubrir (lista de control)

- [ ] RF-01 — flujo `EVALUATION` (paciente nuevo).
- [ ] RF-01 — flujo `THERAPY` (paciente existente).
- [ ] RF-01 — regla de máximo 3 citas pendientes.
- [ ] RF-02 — pantalla de resumen aparece antes de confirmar.
- [ ] RF-02 — etiqueta visual del estado inicial (resolver D-01 / H-C1-001).
- [ ] RF-05 — guardar paciente nuevo y paciente existente.
- [ ] RF-06 — consulta desde calendario y desde listado, sin mutación.
- [ ] RF-07 — alerta visual no cambia estado en BD.
- [ ] RF-07 — alerta solo aplica a `SCHEDULED`.
- [ ] RF-08 — atomicidad y no-sobrescritura en reprogramación.
- [ ] RF-09 — no permitir cancelar citas pasadas; registrar motivo.
- [ ] RNF-07 — coherencia visual entre pantallas.
- [ ] RNF-09 — claridad de mensajes de error/éxito.
- [ ] RNF-10 — comportamiento con zoom y diferentes resoluciones.
- [ ] RNF-11 — facilidad de aprendizaje (criterio si se define).

---

## 6. Hallazgos pendientes de la Célula 3 (técnica)

> **Esta sección se llena con el reporte de la Célula 3.**

### H-C3-001 — _Plantilla pendiente de llenar_

- Origen: Célula 3
- Requisito afectado: RF/RNF-XX
- Severidad: _por completar_
- Tipo: Técnica
- Descripción: _por completar_
- Evidencia: _por completar_
- Impacto: _por completar_
- Decisión propuesta: _por completar_
- Dueño: _por completar_
- Estado: Pendiente de reporte

### Áreas que la Célula 3 debe cubrir (lista de control)

- [ ] RF-03 — `AvailabilityService` valida solapamiento por terapeuta, sala, paciente.
- [ ] RF-03 — query de solapamiento filtra por estado activo (`SCHEDULED`).
- [ ] RF-04 — `FolioGenerator` produce folios únicos. Verificar concurrencia y reinicio.
- [ ] Schema vigente vs diseño BD (validar D-05, D-06).
- [ ] RNF-02 — login, logout, control de acceso por rol, BCrypt.
- [ ] RNF-02 — `/actuator/**` solo accesible a `COORDINATOR`.
- [ ] RNF-04 — `/actuator/health` operativo.
- [ ] RNF-04 — formato y nivel de logs.
- [ ] RNF-04 — mecanismo de respaldo de BD.
- [ ] RNF-06 — visibilidad diferenciada por rol en UI/endpoints.
- [ ] Renombrar `rf05.database_desing.md` (H-C1-003).
- [ ] Generar diagramas ER, arquitectura y casos de uso (H-C1-009, H-C1-010).

---

## 7. Tabla maestra (vista resumen)

> Se actualiza con cada nuevo hallazgo. La línea base contiene los hallazgos de Célula 1.

| ID | Origen | Req. | Severidad | Tipo | Decisión propuesta | Estado |
|---|---|---|---|---|---|---|
| H-C1-001 | Célula 1 | RF-02 | Media | Documental | Corregir | Abierto |
| H-C1-002 | Célula 1 | RF-05 | Media | Documental | Corregir | Abierto |
| H-C1-003 | Célula 1 | RF-05 | Baja | Documental | Corregir | Abierto |
| H-C1-004 | Célula 1 | RF-03 | Alta | Cambio no doc. | Corregir | Abierto |
| H-C1-005 | Célula 1 | RF-04 | Media | Cambio no doc. | Corregir | Abierto |
| H-C1-006 | Célula 1 | RF-11 | Alta/Baja | Deuda | Escalar | Abierto |
| H-C1-007 | Célula 1 | Transversal | Baja | Cambio no doc. | Aceptar como deuda | Abierto |
| H-C1-008 | Célula 1 | RNF-04 | Baja | Documental/Técnica | Postergar | Abierto |
| H-C1-009 | Célula 1 | Transversal | Media | Deuda | Aceptar | Abierto |
| H-C1-010 | Célula 1 | Transversal | Media | Deuda | Aceptar | Abierto |

---

## 8. Conteos por severidad y por tipo (corte parcial)

> Solo incluye hallazgos confirmados. Se recalculará al integrar Célula 2 y Célula 3.

| Severidad | Cantidad |
|---|---|
| Crítica | 0 |
| Alta | 2 |
| Media | 5 |
| Baja | 3 |
| **Total** | **10** |

| Tipo | Cantidad |
|---|---|
| Documental | 4 |
| Cambio no documentado | 3 |
| Deuda de implementación | 3 |
| Funcional | 0 (pendiente Célula 2) |
| Técnica | 0 (pendiente Célula 3) |

---

## 9. Observaciones de conflicto entre células

> Esta sección se llena cuando dos células reportan el mismo síntoma con conclusiones contradictorias. Sin entradas a la fecha de corte.

| ID | Hallazgos en conflicto | Descripción | Resolución propuesta | Estado |
|---|---|---|---|---|
| _vacío_ | — | — | — | — |

---

## 10. Próximas acciones de la Célula 1

1. Solicitar formalmente a Célula 2 su reporte funcional, con la lista de control de la sección 5.
2. Solicitar formalmente a Célula 3 su reporte técnico, con la lista de control de la sección 6.
3. Al recibirlos: integrar, normalizar IDs, detectar duplicados y conflictos.
4. Recalcular conteos.
5. Cerrar este entregable con versión 2.0 antes de pasar al entregable 3.

---

## Changelog

| Fecha | Versión | Autor | Cambios |
|---|---|---|---|
| 2026-05-07 | 1.0 | Célula 1 | Registro inicial: 10 hallazgos H-C1-001 a H-C1-010. Plantillas para Célula 2 y Célula 3. |
