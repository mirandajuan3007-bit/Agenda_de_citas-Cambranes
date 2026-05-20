/**
 * @file components/modals/AppointmentDetailModal.tsx
 * Modal de detalle de cita (RF-06).
 *
 * Muestra toda la información de una cita:
 *   - Datos del paciente, terapeuta, sala, tipo de sesión
 *   - Fecha, hora, duración
 *   - Estado (badge) — si está atrasada muestra banner rojo (RF-07)
 *   - Motivo de cancelación (si aplica)
 *   - Folio de reagendado (si es rescheduled)
 *
 * Acciones disponibles según estado:
 *   - SCHEDULED (1): Reagendar | Cancelar
 *   - COMPLETED (4), CANCELLED (2), RESCHEDULED (3): solo lectura
 *
 * Conexión con store (localStorage):
 *   data.appointments, data.patients, data.therapists,
 *   data.rooms, data.sessionTypes, data.appointmentStatuses
 */

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/Badge';
import { RescheduleModal } from './RescheduleModal';
import { CancelModal } from './CancelModal';
import { formatDate, formatTime, isOverdue } from '../../utils/helpers';
import { DEMO_NOW } from '../../data/seed';

interface AppointmentDetailModalProps {
  appointmentId: number;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/** Fila de detalle con etiqueta y valor. */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
      <span style={{ width: 130, color: 'var(--gray-500)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  );
}

/**
 * Modal de detalle de cita.
 *
 * Lee la cita del store en cada render (data proviene del contexto,
 * que re-carga localStorage tras cada mutación vía REFRESH_DATA).
 *
 * La condición "overdue" (RF-07) se evalúa en el cliente con isOverdue();
 * nunca se almacena en la base de datos.
 */
export function AppointmentDetailModal({ appointmentId, onClose, onSuccess }: AppointmentDetailModalProps) {
  const { data, completeAppointment } = useApp();
  const now = new Date(DEMO_NOW);

  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Leer datos frescos del store en cada render
  const appointment = data.appointments.find((a) => a.id === appointmentId);
  if (!appointment) return null;

  const patient = data.patients.find((p) => p.id === appointment.patientId);
  const therapist = data.therapists.find((t) => t.id === appointment.therapistId);
  const room = data.rooms.find((r) => r.id === appointment.roomId);
  const sessionType = data.sessionTypes.find((s) => s.id === appointment.sessionTypeId);
  const overdue = isOverdue(appointment.statusId, appointment.startAt, now);

  const isScheduled = appointment.statusId === 1;

  async function handleComplete() {
    try {
      await completeAppointment(appointmentId);
      onSuccess('Cita marcada como completada.');
      onClose();
    } catch (e) {
      // no-op
    }
  }

  // Si hay un modal hijo abierto, renderizarlo en su lugar
  if (showReschedule) {
    return (
      <RescheduleModal
        appointment={appointment}
        onClose={() => setShowReschedule(false)}
        onSuccess={(msg) => { setShowReschedule(false); onSuccess(msg); onClose(); }}
      />
    );
  }
  if (showCancel) {
    return (
      <CancelModal
        appointment={appointment}
        onClose={() => setShowCancel(false)}
        onSuccess={(msg) => { setShowCancel(false); onSuccess(msg); onClose(); }}
      />
    );
  }

  return (
    <Modal
      title={`Cita #${appointment.id}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {isScheduled && (
            <button className="btn btn-success" onClick={handleComplete}>
              <i className="fas fa-check" /> Completar
            </button>
          )}
          {isScheduled && (
            <button className="btn btn-warning" onClick={() => setShowReschedule(true)}>
              <i className="fas fa-calendar-alt" /> Reagendar
            </button>
          )}
          {isScheduled && (
            <button className="btn btn-danger" onClick={() => setShowCancel(true)}>
              <i className="fas fa-times" /> Cancelar
            </button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Banner de atraso (RF-07) */}
        {overdue && (
          <div className="alert alert-danger" style={{ marginBottom: 8 }}>
            <i className="fas fa-exclamation-circle" />
            Esta cita está atrasada — el horario programado ya pasó y no ha sido atendida.
          </div>
        )}

        {/* Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ width: 130, color: 'var(--gray-500)', fontSize: 14, flexShrink: 0 }}>Estado</span>
          <StatusBadge appointment={appointment} now={now} />
        </div>

        <DetailRow label="Paciente" value={patient?.fullName ?? '—'} />
        <DetailRow label="Folio paciente" value={<span style={{ fontFamily: 'monospace' }}>{patient?.folio ?? '—'}</span>} />
        <DetailRow label="Terapeuta" value={therapist?.fullName ?? '—'} />
        <DetailRow label="Sala" value={room ? `${room.name} — ${room.location}` : '—'} />
        <DetailRow label="Tipo de sesión" value={sessionType?.name ?? '—'} />
        <DetailRow label="Fecha" value={formatDate(appointment.startAt)} />
        <DetailRow label="Hora" value={`${formatTime(appointment.startAt)} – ${formatTime(appointment.endAt)}`} />
        <DetailRow label="Duración" value={`${appointment.durationMinutes} minutos`} />

        {appointment.comments && (
          <DetailRow label="Comentarios" value={appointment.comments} />
        )}

        {/* Información de cancelación */}
        {appointment.statusId === 2 && appointment.cancelledReason && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ color: 'var(--gray-500)', marginBottom: 4 }}>Motivo de cancelación:</div>
            <div style={{ fontStyle: 'italic' }}>{appointment.cancelledReason}</div>
          </div>
        )}

        {/* Referencia a cita original si es reagendada */}
        {appointment.rescheduledFromId && (
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
            Reagendada desde cita #{appointment.rescheduledFromId}
          </div>
        )}
      </div>
    </Modal>
  );
}
