/**
 * @file services/validation.ts
 * Implementa RF-03: Validar disponibilidad de recursos antes de crear o reprogramar citas.
 *
 * Este servicio es el punto central de todas las reglas de negocio de disponibilidad.
 * Debe llamarse ANTES de guardar cualquier cita (nueva o reprogramada).
 *
 * Reglas que valida:
 *   1. Un terapeuta no puede tener dos citas solapadas.
 *   2. Una sala no puede tener dos citas solapadas.
 *   3. Un paciente no puede tener dos citas solapadas.
 *   4. El horario debe estar dentro del horario laboral (lun–vie, 9:00–17:30).
 *   5. Un paciente no puede tener más de 3 citas en estado SCHEDULED simultáneamente.
 */

import type { ConflictError } from '../types';
import { getData } from '../data/storage';
import { formatTime, WORK_START_MIN, WORK_END_MIN } from '../utils/helpers';

// ─── Validación de horario laboral ─────────────────────────────────────────

/**
 * Verifica que el rango de la cita esté dentro del horario laboral de la clínica.
 *
 * Reglas verificadas:
 * - El día debe ser lunes a viernes (0=dom y 6=sáb son inválidos).
 * - La hora de inicio no puede ser anterior a 09:00.
 * - La hora de fin no puede ser posterior a 17:30.
 * - La hora de inicio debe ser menor que la de fin.
 *
 * @param startAt - Timestamp de inicio "YYYY-MM-DDTHH:mm:ss" (hora local)
 * @param endAt   - Timestamp de fin "YYYY-MM-DDTHH:mm:ss" (hora local)
 * @returns ConflictError o null si no hay error
 */
export function validateWorkingHours(
  startAt: string,
  endAt: string
): ConflictError | null {
  const start = new Date(startAt);
  const end = new Date(endAt);

  const day = start.getDay(); // 0=dom, 6=sáb
  if (day === 0 || day === 6) {
    return { type: 'working_hours', message: 'Las citas solo pueden agendarse de lunes a viernes.' };
  }

  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();

  if (startMin < WORK_START_MIN) {
    return { type: 'working_hours', message: 'La cita no puede iniciar antes de las 09:00.' };
  }
  if (endMin > WORK_END_MIN) {
    return { type: 'working_hours', message: 'La cita no puede terminar después de las 17:30.' };
  }
  if (startMin >= endMin) {
    return { type: 'working_hours', message: 'La hora de inicio debe ser menor que la hora de finalización.' };
  }

  return null;
}

// ─── Validación de disponibilidad (RF-03 principal) ────────────────────────

/**
 * Verifica que no existan conflictos de horario para terapeuta, sala y paciente.
 *
 * Cómo funciona:
 * 1. Obtiene todas las citas activas del store (excluye CANCELLED=2 y RESCHEDULED=3).
 * 2. Si se pasa `excludeAppointmentId`, excluye esa cita de la comparación.
 *    Esto es CRÍTICO al reprogramar: la cita original tiene statusId=1 (SCHEDULED)
 *    todavía cuando se valida el nuevo horario. Sin excluirla, siempre daría conflicto
 *    si el terapeuta/sala/paciente es el mismo, aunque el horario sea distinto.
 * 3. Para cada cita activa, verifica solapamiento de intervalos usando la fórmula:
 *    `nuevoInicio < finExistente && inicioExistente < nuevoFin`
 * 4. Si hay solapamiento, agrega un ConflictError por cada recurso afectado.
 *
 * @param startAt             - Timestamp de inicio del nuevo horario (hora local)
 * @param endAt               - Timestamp de fin del nuevo horario (hora local)
 * @param therapistId         - ID del terapeuta a asignar
 * @param roomId              - ID de la sala (se deriva del terapeuta)
 * @param patientId           - ID del paciente (null para paciente nuevo sin citas)
 * @param excludeAppointmentId - ID de la cita a excluir (pasar al reprogramar)
 * @returns Array de conflictos. Vacío = sin conflictos = se puede guardar.
 */
export function validateAvailability(
  startAt: string,
  endAt: string,
  therapistId: number,
  roomId: number,
  patientId: number | null,
  excludeAppointmentId: number | null = null
): ConflictError[] {
  const data = getData();
  const newStart = new Date(startAt);
  const newEnd = new Date(endAt);
  const found: ConflictError[] = [];

  // Filtrar las citas que participan en la validación:
  // - Excluir la cita que se está reprogramando (si aplica)
  // - Excluir citas canceladas (statusId=2) y reprogramadas/archivadas (statusId=3)
  //   ya que no ocupan el recurso
  const activeAppointments = data.appointments.filter((a) => {
    if (excludeAppointmentId !== null && a.id === excludeAppointmentId) return false;
    return a.statusId !== 2 && a.statusId !== 3;
  });

  for (const a of activeAppointments) {
    const existStart = new Date(a.startAt);
    const existEnd = new Date(a.endAt);

    // Fórmula de solapamiento de intervalos:
    // Dos intervalos [s1, e1) y [s2, e2) se solapan si: s1 < e2 Y s2 < e1
    const overlaps = newStart < existEnd && existStart < newEnd;
    if (!overlaps) continue;

    // Verificar cada recurso por separado para dar mensajes específicos
    if (a.therapistId === therapistId) {
      found.push({
        type: 'therapist',
        message: `El terapeuta ya tiene una cita de ${formatTime(a.startAt)} a ${formatTime(a.endAt)}.`,
      });
    }
    if (a.roomId === roomId) {
      found.push({
        type: 'room',
        message: `La sala ya está ocupada de ${formatTime(a.startAt)} a ${formatTime(a.endAt)}.`,
      });
    }
    if (patientId !== null && a.patientId === patientId) {
      found.push({
        type: 'patient',
        message: `El paciente ya tiene una cita de ${formatTime(a.startAt)} a ${formatTime(a.endAt)}.`,
      });
    }
  }

  // Deduplicar mensajes (puede haber el mismo mensaje desde diferentes citas)
  return found.filter(
    (c, i) => found.findIndex((x) => x.message === c.message) === i
  );
}

// ─── Límite de citas activas por paciente ───────────────────────────────────

/**
 * Cuenta las citas en estado SCHEDULED (id=1) de un paciente.
 * Un paciente no puede tener más de 3 citas pendientes (RF-01 regla 6).
 *
 * @param patientId           - ID del paciente
 * @param excludeAppointmentId - ID a excluir (usar al reprogramar)
 * @returns Número de citas programadas actualmente
 */
export function countScheduledAppointments(
  patientId: number,
  excludeAppointmentId: number | null = null
): number {
  return getData().appointments.filter((a) => {
    if (excludeAppointmentId !== null && a.id === excludeAppointmentId) return false;
    return a.patientId === patientId && a.statusId === 1;
  }).length;
}

/**
 * Ejecuta todas las validaciones de negocio para crear o reprogramar una cita.
 * Combina validación de horario laboral + disponibilidad de recursos.
 *
 * @param params.startAt             - Timestamp de inicio (hora local)
 * @param params.endAt               - Timestamp de fin (hora local)
 * @param params.therapistId         - ID del terapeuta
 * @param params.roomId              - ID de la sala
 * @param params.patientId           - ID del paciente (null si es nuevo)
 * @param params.excludeAppointmentId - ID a excluir (al reprogramar)
 * @returns Array de todos los conflictos encontrados
 */
export function runFullValidation(params: {
  startAt: string;
  endAt: string;
  therapistId: number;
  roomId: number;
  patientId: number | null;
  excludeAppointmentId?: number;
}): ConflictError[] {
  const { startAt, endAt, therapistId, roomId, patientId, excludeAppointmentId = null } = params;
  const errors: ConflictError[] = [];

  const hoursError = validateWorkingHours(startAt, endAt);
  if (hoursError) errors.push(hoursError);

  const availabilityErrors = validateAvailability(
    startAt,
    endAt,
    therapistId,
    roomId,
    patientId,
    excludeAppointmentId
  );
  errors.push(...availabilityErrors);

  return errors;
}
