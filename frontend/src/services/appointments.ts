/**
 * @file services/appointments.ts
 * Operaciones CRUD sobre la entidad `appointments` del store.
 *
 * Todas las funciones siguen el patrón:
 *   1. getData()   — leer el store completo desde localStorage
 *   2. mutar el objeto en memoria
 *   3. saveData()  — persistir el estado actualizado
 *   4. Retornar el resultado para que el contexto actualice el estado de React
 *
 * Reglas de negocio implementadas:
 *   - RF-01: Creación de citas (dos tipos)
 *   - RF-08: Reprogramación (archiva original, crea nueva)
 *   - RF-09: Cancelación (solo cambia estado, nunca elimina)
 *   - Las citas nunca se borran físicamente del store.
 */

import type { Appointment, CreateAppointmentInput, RescheduleInput } from '../types';
import { getData, saveData } from '../data/storage';
import { toLocalISO, addMinutes } from '../utils/helpers';

// ─── Crear cita (RF-01) ─────────────────────────────────────────────────────

/**
 * Crea una nueva cita con estado SCHEDULED (statusId=1) y la persiste en el store.
 *
 * Flujo:
 *   1. Lee el store actual.
 *   2. Genera un ID autoincremental (simula SERIAL de PostgreSQL).
 *   3. Construye el objeto Appointment con estado inicial "Programada".
 *   4. Agrega la cita al array `appointments`.
 *   5. Registra la acción en `auditLogs`.
 *   6. Incrementa `nextAppointmentId`.
 *   7. Persiste con saveData().
 *
 * @param input     - Datos validados de la nueva cita
 * @param userId    - ID del usuario (secretaria/coordinador) que la crea
 * @returns La cita recién creada con su ID asignado
 */
export function createAppointment(input: CreateAppointmentInput, userId: number): Appointment {
  const data = getData();
  const id = data.nextAppointmentId;

  const appointment: Appointment = {
    id,
    patientId: input.patientId,
    therapistId: input.therapistId,
    roomId: input.roomId,
    sessionTypeId: input.sessionTypeId,
    startAt: input.startAt,
    endAt: input.endAt,
    durationMinutes: input.durationMinutes,
    statusId: 1, // SCHEDULED — siempre inicia programada
    createdBy: userId,
    createdAt: toLocalISO(new Date()),
    cancelledReason: null,
    cancelledAt: null,
    paymentProofPath: input.paymentProofPath ?? null,
    cuota: input.cuota ?? null,
    comments: input.comments ?? '',
  };

  data.appointments.push(appointment);
  data.auditLogs.push({
    id: data.nextAuditId++,
    entityType: 'appointment',
    entityId: id,
    action: 'CREATE',
    payload: { patientId: input.patientId, startAt: input.startAt },
    performedBy: userId,
    performedAt: toLocalISO(new Date()),
  });
  data.nextAppointmentId++;

  saveData(data);
  return appointment;
}

// ─── Cancelar cita (RF-09) ──────────────────────────────────────────────────

/**
 * Cancela una cita cambiando su estado a CANCELLED (statusId=2).
 *
 * IMPORTANTE: La cita NO se elimina del store. Solo cambia de estado.
 * Al cancelarse, el horario queda disponible automáticamente porque
 * `validateAvailability` ignora las citas con statusId=2.
 *
 * Flujo:
 *   1. Lee el store, localiza la cita por ID.
 *   2. Cambia `statusId` a 2 (CANCELLED).
 *   3. Guarda el motivo y la fecha de cancelación.
 *   4. Registra en auditLogs.
 *   5. Persiste.
 *
 * @param appointmentId - ID de la cita a cancelar
 * @param reason        - Motivo de cancelación (obligatorio, RF-09)
 * @param userId        - ID del usuario que realiza la acción
 * @throws Si la cita no existe o no está en estado SCHEDULED
 */
export function cancelAppointment(
  appointmentId: number,
  reason: string,
  userId: number
): void {
  const data = getData();
  const appt = data.appointments.find((a) => a.id === appointmentId);

  if (!appt) throw new Error(`Cita con ID ${appointmentId} no encontrada.`);
  if (appt.statusId !== 1) throw new Error('Solo se pueden cancelar citas en estado Programada.');

  appt.statusId = 2;
  appt.cancelledReason = reason;
  appt.cancelledAt = toLocalISO(new Date());
  appt.updatedAt = toLocalISO(new Date());

  data.auditLogs.push({
    id: data.nextAuditId++,
    entityType: 'appointment',
    entityId: appointmentId,
    action: 'CANCEL',
    payload: { reason },
    performedBy: userId,
    performedAt: toLocalISO(new Date()),
  });

  saveData(data);
}

// ─── Reprogramar cita (RF-08) ───────────────────────────────────────────────

/**
 * Reprograma una cita existente:
 *   1. Archiva la cita original cambiando su estado a RESCHEDULED (statusId=3).
 *   2. Crea una nueva cita con el nuevo horario en estado SCHEDULED (statusId=1).
 *
 * Esta operación es ATÓMICA en memoria: si falla al crear la nueva cita,
 * la cita original no se modifica (se revierte). En una BD real, se usaría
 * una transacción SQL.
 *
 * Por qué se archiva en lugar de modificar:
 * - Garantiza trazabilidad completa del historial de reprogramaciones.
 * - Cumple la regla de negocio: "las citas no se sobrescriben" (system_context.md).
 * - La nueva cita referencia a la original via `rescheduledFromId`.
 *
 * Relación con la validación (RF-03):
 *   La cita original TODAVÍA tiene statusId=1 cuando se llama a esta función
 *   (aún no se ha archivado). Por eso `validateAvailability` recibe el ID de
 *   la cita original como `excludeAppointmentId`, para no auto-conflictuar.
 *
 * @param originalId - ID de la cita a reprogramar
 * @param input      - Nuevo horario y recursos
 * @param userId     - ID del usuario que realiza la acción
 * @returns La nueva cita creada
 * @throws Si la cita no existe o no puede reprogramarse
 */
export function rescheduleAppointment(
  originalId: number,
  input: RescheduleInput,
  userId: number
): Appointment {
  const data = getData();
  const original = data.appointments.find((a) => a.id === originalId);

  if (!original) throw new Error(`Cita con ID ${originalId} no encontrada.`);
  if (original.statusId !== 1) {
    throw new Error('Solo se pueden reprogramar citas en estado Programada.');
  }

  // Paso 1: Archivar la cita original
  original.statusId = 3; // RESCHEDULED
  original.updatedAt = toLocalISO(new Date());

  // Paso 2: Crear nueva cita reutilizando terapeuta/sala/duración del original
  const newId = data.nextAppointmentId;
  const newEndAt = addMinutes(input.startAt, original.durationMinutes);
  const newAppointment: Appointment = {
    id: newId,
    patientId: original.patientId,
    therapistId: original.therapistId,
    roomId: original.roomId,
    sessionTypeId: original.sessionTypeId,
    startAt: input.startAt,
    endAt: newEndAt,
    durationMinutes: original.durationMinutes,
    statusId: 1, // SCHEDULED
    createdBy: userId,
    createdAt: toLocalISO(new Date()),
    cancelledReason: null,
    cancelledAt: null,
    paymentProofPath: original.paymentProofPath,
    cuota: original.cuota,
    comments: original.comments,
    rescheduledFromId: originalId,
  };

  data.appointments.push(newAppointment);
  data.auditLogs.push({
    id: data.nextAuditId++,
    entityType: 'appointment',
    entityId: originalId,
    action: 'RESCHEDULE',
    payload: { newAppointmentId: newId, newStartAt: input.startAt },
    performedBy: userId,
    performedAt: toLocalISO(new Date()),
  });
  data.nextAppointmentId++;

  saveData(data);
  return newAppointment;
}

// ─── Completar cita ────────────────────────────────────────────────────────

/**
 * Marca una cita como COMPLETED (statusId=4).
 * Solo se puede completar si está en estado SCHEDULED (statusId=1).
 *
 * @param appointmentId - ID de la cita a completar
 * @param userId        - ID del usuario que realiza la acción
 * @throws Si la cita no existe o no está en estado SCHEDULED
 */
export function completeAppointment(appointmentId: number, userId: number): void {
  const data = getData();
  const appt = data.appointments.find((a) => a.id === appointmentId);

  if (!appt) throw new Error(`Cita con ID ${appointmentId} no encontrada.`);
  if (appt.statusId !== 1) throw new Error('Solo se pueden completar citas en estado Programada.');

  appt.statusId = 4;
  appt.updatedAt = toLocalISO(new Date());

  data.auditLogs.push({
    id: data.nextAuditId++,
    entityType: 'appointment',
    entityId: appointmentId,
    action: 'UPDATE',
    payload: { newStatus: 'COMPLETED' },
    performedBy: userId,
    performedAt: toLocalISO(new Date()),
  });

  saveData(data);
}

// ─── Helpers de consulta ────────────────────────────────────────────────────

/**
 * Busca una cita por ID en el store.
 * @returns La cita o undefined si no existe
 */
export function findAppointment(id: number): Appointment | undefined {
  return getData().appointments.find((a) => a.id === id);
}

/**
 * Devuelve todas las citas de un día específico, ordenadas por hora de inicio.
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 */
export function getAppointmentsByDate(dateStr: string): Appointment[] {
  return getData()
    .appointments.filter((a) => a.startAt.startsWith(dateStr))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/**
 * Devuelve todas las citas de un paciente ordenadas por fecha descendente.
 */
export function getAppointmentsByPatient(patientId: number): Appointment[] {
  return getData()
    .appointments.filter((a) => a.patientId === patientId)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
}
