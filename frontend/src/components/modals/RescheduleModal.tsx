/**
 * @file components/modals/RescheduleModal.tsx
 * Modal de reagendado de cita (RF-08).
 *
 * Flujo:
 *   1. Muestra la cita original (fecha/hora actual).
 *   2. Usuario elige nueva fecha y hora.
 *   3. Al confirmar → llama a rescheduleAppointment() del servicio.
 *
 * Cómo evita el bug de falso conflicto (RF-03):
 *   rescheduleAppointment() llama a validateAvailability() pasando
 *   excludeAppointmentId = appointment.id, lo que excluye la cita
 *   original del chequeo de solapamiento aunque aún esté SCHEDULED.
 *
 * Resultado en localStorage:
 *   - Cita original: statusId → 3 (RESCHEDULED)
 *   - Nueva cita: statusId = 1 (SCHEDULED), rescheduledFromId = originalId
 */

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { runFullValidation } from '../../services/validation';
import { useApp } from '../../context/AppContext';
import { addMinutes, formatDate, formatTime, toLocalISO } from '../../utils/helpers';
import type { Appointment, ConflictError } from '../../types';

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Modal de reagendado.
 *
 * La validación previa (sin guardar) usa validateAvailability con
 * excludeAppointmentId para mostrar errores antes de confirmar.
 * El servicio repite la validación internamente al guardar.
 */
export function RescheduleModal({ appointment, onClose, onSuccess }: RescheduleModalProps) {
  const { rescheduleAppointment } = useApp();

  // Calcular valores iniciales a partir de la cita original
  const originalDate = appointment.startAt.slice(0, 10);
  const originalTime = appointment.startAt.slice(11, 16);

  const [date, setDate] = useState(originalDate);
  const [time, setTime] = useState(originalTime);
  const [conflicts, setConflicts] = useState<ConflictError[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Valida disponibilidad en tiempo real cuando el usuario cambia fecha u hora.
   * Excluye la cita original para no generar falso conflicto consigo misma.
   */
  function handleDateTimeChange(newDate: string, newTime: string) {
    setDate(newDate);
    setTime(newTime);
    setConflicts([]);

    if (!newDate || !newTime) return;
    const startAt = `${newDate}T${newTime}:00`;
    const endAt = addMinutes(startAt, appointment.durationMinutes);

    const errors = runFullValidation({
      startAt, endAt,
      therapistId: appointment.therapistId,
      roomId: appointment.roomId,
      patientId: appointment.patientId,
      excludeAppointmentId: appointment.id,
    });
    setConflicts(errors);
  }

  function handleConfirm() {
    if (conflicts.length > 0) return;
    setLoading(true);
    try {
      const startAt = `${date}T${time}:00`;
      rescheduleAppointment(appointment.id, { startAt });
      onSuccess('Cita reagendada correctamente.');
      onClose();
    } catch (e) {
      setConflicts([{ type: 'therapist', message: (e as Error).message }]);
      setLoading(false);
    }
  }

  const hasChanged = date !== originalDate || time !== originalTime;
  const canConfirm = hasChanged && conflicts.length === 0;

  return (
    <Modal
      title="Reagendar cita"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={!canConfirm || loading}>
            {loading ? 'Guardando…' : 'Confirmar reagendado'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Fecha/hora actual */}
        <div className="alert alert-info" style={{ background: 'var(--primary-light)', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          <strong>Cita original:</strong> {formatDate(appointment.startAt)} a las {formatTime(appointment.startAt)}
        </div>

        {/* Nueva fecha */}
        <div className="form-group">
          <label className="form-label">Nueva fecha <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            type="date"
            className="form-control"
            value={date}
            min={toLocalISO(new Date()).slice(0, 10)}
            onChange={(e) => handleDateTimeChange(e.target.value, time)}
          />
        </div>

        {/* Nueva hora */}
        <div className="form-group">
          <label className="form-label">Nueva hora <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            type="time"
            className="form-control"
            value={time}
            min="09:00"
            max="17:30"
            step={1800}
            onChange={(e) => handleDateTimeChange(date, e.target.value)}
          />
        </div>

        {/* Errores de disponibilidad */}
        {conflicts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {conflicts.map((c, i) => (
              <div key={i} className="alert alert-danger" style={{ padding: '8px 12px', fontSize: 13 }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }} />
                {c.message}
              </div>
            ))}
          </div>
        )}

        {hasChanged && conflicts.length === 0 && (
          <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: 13 }}>
            <i className="fas fa-check-circle" style={{ marginRight: 6 }} />
            Horario disponible
          </div>
        )}
      </div>
    </Modal>
  );
}
