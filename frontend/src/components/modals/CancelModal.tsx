/**
 * @file components/modals/CancelModal.tsx
 * Modal de cancelación de cita (RF-09).
 *
 * Flujo:
 *   1. Usuario escribe el motivo de cancelación (requerido).
 *   2. Confirma → llama a cancelAppointment(id, reason, userId) del servicio.
 *   3. El servicio cambia statusId=2, guarda cancelledReason y cancelledAt en localStorage.
 *   4. Context dispara REFRESH_DATA → UI se actualiza.
 *
 * Restricciones:
 *   - Solo se puede cancelar si statusId === 1 (SCHEDULED).
 *   - El motivo es obligatorio (mínimo 5 caracteres).
 *   - La cita NO se elimina físicamente, solo cambia de estado.
 */

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import type { Appointment } from '../../types';

interface CancelModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Modal de cancelación con campo de motivo obligatorio.
 *
 * Usa context.cancelAppointment() que internamente llama al servicio y
 * dispara REFRESH_DATA para que la UI se actualice.
 */
export function CancelModal({ appointment, onClose, onSuccess }: CancelModalProps) {
  const { cancelAppointment } = useApp();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (reason.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await cancelAppointment(appointment.id, reason.trim());
      onSuccess('Cita cancelada correctamente.');
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Cancelar cita"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Volver
          </button>
          <button className="btn btn-danger" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle" />
          Esta acción no se puede deshacer. La cita quedará marcada como cancelada.
        </div>

        <div className="form-group">
          <label className="form-label">Motivo de cancelación <span style={{ color: 'var(--danger)' }}>*</span></label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Escribe el motivo de la cancelación…"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            style={{ resize: 'vertical' }}
          />
          {error && <div className="form-error">{error}</div>}
        </div>
      </div>
    </Modal>
  );
}
