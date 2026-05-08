/**
 * @file components/modals/NewAppointmentModal.tsx
 * Wizard de creación de nueva cita (RF-01, RF-02, RF-03, RF-04).
 *
 * Pasos:
 *   1. Tipo de sesión (Individual / Grupal)
 *   2. Paciente (buscar existente o crear nuevo)
 *   3. Horario (fecha, hora, terapeuta, sala) + validación RF-03 en tiempo real
 *   4. Resumen — confirmación antes de guardar
 *   5. Éxito — muestra el folio asignado (RF-04)
 *
 * RF-03 — Validación de disponibilidad:
 *   validateAvailability() se llama en el paso 3 cada vez que cambia
 *   fecha, hora, terapeuta o sala. Si hay conflicto se muestra el error
 *   y se bloquea el avance.
 *
 * RF-04 — ID único de paciente:
 *   createPatient() genera folio PAC-XXXX usando nextPatientId del store.
 *
 * Conexión con localStorage:
 *   createAppointment() y createPatient() llaman a saveData() al final.
 *   El contexto dispara REFRESH_DATA para que la UI refleje los cambios.
 */

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { runFullValidation } from '../../services/validation';
import { addMinutes, toLocalISO } from '../../utils/helpers';
import type { ConflictError } from '../../types';

// Duración en minutos por tipo de sesión
const SESSION_DURATIONS: Record<number, number> = { 1: 60, 2: 90 };

interface NewAppointmentModalProps {
  /** Fecha pre-rellenada desde el click en el calendario (YYYY-MM-DD). */
  initialDate?: string;
  /** Hora pre-rellenada desde el click en el calendario (HH:MM). */
  initialTime?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

// ─── Estado del wizard ───────────────────────────────────────────────────────

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  sessionTypeId: number;         // paso 1
  patientId: number | null;      // paso 2
  isNewPatient: boolean;
  newPatientName: string;
  newPatientPhone: string;
  newPatientEmail: string;
  date: string;                  // paso 3
  time: string;
  therapistId: number | null;
  roomId: number | null;
  comments: string;
  conflicts: ConflictError[];
  createdFolio: string;          // paso 5
  createdApptId: number;
}

const INITIAL_STATE = (initialDate = '', initialTime = ''): WizardState => ({
  step: 1,
  sessionTypeId: 1,
  patientId: null,
  isNewPatient: false,
  newPatientName: '',
  newPatientPhone: '',
  newPatientEmail: '',
  date: initialDate,
  time: initialTime,
  therapistId: null,
  roomId: null,
  comments: '',
  conflicts: [],
  createdFolio: '',
  createdApptId: 0,
});

// ─── Paso 1: Tipo de sesión ──────────────────────────────────────────────────

interface Step1Props {
  sessionTypeId: number;
  onChange: (id: number) => void;
}

function Step1({ sessionTypeId, onChange }: Step1Props) {
  const { data } = useApp();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, margin: 0 }}>
        Selecciona el tipo de sesión que se realizará.
      </p>
      {data.sessionTypes.map((st) => (
        <label key={st.id} className={`option-card ${sessionTypeId === st.id ? 'selected' : ''}`}>
          <input
            type="radio"
            name="sessionType"
            value={st.id}
            checked={sessionTypeId === st.id}
            onChange={() => onChange(st.id)}
            style={{ display: 'none' }}
          />
          <i className={`fas ${st.id === 1 ? 'fa-user' : 'fa-users'}`} style={{ fontSize: 20, color: 'var(--primary)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{st.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{SESSION_DURATIONS[st.id]} minutos</div>
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Paso 2: Paciente ────────────────────────────────────────────────────────

interface Step2Props {
  patientId: number | null;
  isNewPatient: boolean;
  newPatientName: string;
  newPatientPhone: string;
  newPatientEmail: string;
  onChange: (fields: Partial<WizardState>) => void;
}

function Step2({ patientId, isNewPatient, newPatientName, newPatientPhone, newPatientEmail, onChange }: Step2Props) {
  const { data } = useApp();
  const [query, setQuery] = useState('');

  const filtered = data.patients.filter((p) => {
    const q = query.toLowerCase();
    return p.fullName.toLowerCase().includes(q) || p.folio.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Toggle: existente / nuevo */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className={`btn btn-sm ${!isNewPatient ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange({ isNewPatient: false, patientId: null })}
        >
          Paciente existente
        </button>
        <button
          className={`btn btn-sm ${isNewPatient ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange({ isNewPatient: true, patientId: null })}
        >
          <i className="fas fa-plus" /> Nuevo paciente
        </button>
      </div>

      {isNewPatient ? (
        /* Formulario de nuevo paciente */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input
              type="text"
              className="form-control"
              value={newPatientName}
              onChange={(e) => onChange({ newPatientName: e.target.value })}
              placeholder="Nombre y apellidos"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono *</label>
            <input
              type="tel"
              className="form-control"
              value={newPatientPhone}
              onChange={(e) => onChange({ newPatientPhone: e.target.value })}
              placeholder="10 dígitos"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email (opcional)</label>
            <input
              type="email"
              className="form-control"
              value={newPatientEmail}
              onChange={(e) => onChange({ newPatientEmail: e.target.value })}
            />
          </div>
        </div>
      ) : (
        /* Buscador de paciente existente */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="search-wrapper">
            <i className="fas fa-search search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o folio…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                Sin resultados
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className={`patient-option ${patientId === p.id ? 'selected' : ''}`}
                  onClick={() => onChange({ patientId: p.id })}
                >
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{p.fullName}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{p.folio}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Paso 3: Horario ─────────────────────────────────────────────────────────

interface Step3Props {
  state: WizardState;
  onChange: (fields: Partial<WizardState>) => void;
  onValidate: (fullState: WizardState) => void;
}

function Step3({ state, onChange, onValidate }: Step3Props) {
  const { data } = useApp();

  function handleField(fields: Partial<WizardState>) {
    const updated = { ...state, ...fields };
    onChange(fields);
    if (updated.date && updated.time && updated.therapistId && updated.roomId) {
      onValidate(updated);
    } else {
      onChange({ ...fields, conflicts: [] });
    }
  }

  function handleTherapistChange(therapistId: number | null) {
    const t = data.therapists.find((x) => x.id === therapistId);
    handleField({ therapistId, roomId: t?.roomId ?? null });
  }

  const selectedRoom = data.rooms.find((r) => r.id === state.roomId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Fecha *</label>
          <input
            type="date"
            className="form-control"
            value={state.date}
            min={toLocalISO(new Date()).slice(0, 10)}
            onChange={(e) => handleField({ date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Hora *</label>
          <input
            type="time"
            className="form-control"
            value={state.time}
            min="09:00"
            max="17:00"
            step={1800}
            onChange={(e) => handleField({ time: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Terapeuta *</label>
        <select
          className="form-control"
          value={state.therapistId ?? ''}
          onChange={(e) => handleTherapistChange(Number(e.target.value) || null)}
        >
          <option value="">— Seleccionar —</option>
          {data.therapists.map((t) => {
            const room = data.rooms.find((r) => r.id === t.roomId);
            return (
              <option key={t.id} value={t.id}>{t.fullName} — {room?.name}</option>
            );
          })}
        </select>
      </div>

      {selectedRoom && (
        <div className="alert alert-info" style={{ padding: '8px 12px', fontSize: 13 }}>
          <i className="fas fa-door-open" style={{ marginRight: 6 }} />
          Sala asignada: <strong>{selectedRoom.name}</strong> — {selectedRoom.location}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Comentarios</label>
        <textarea
          className="form-control"
          rows={2}
          value={state.comments}
          onChange={(e) => onChange({ comments: e.target.value })}
          placeholder="Notas adicionales (opcional)"
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Errores de disponibilidad (RF-03) */}
      {state.conflicts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {state.conflicts.map((c, i) => (
            <div key={i} className="alert alert-danger" style={{ padding: '8px 12px', fontSize: 13 }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }} />
              {c.message}
            </div>
          ))}
        </div>
      )}
      {state.date && state.time && state.therapistId && state.roomId && state.conflicts.length === 0 && (
        <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: 13 }}>
          <i className="fas fa-check-circle" style={{ marginRight: 6 }} />
          Horario disponible
        </div>
      )}
    </div>
  );
}

// ─── Paso 4: Resumen ─────────────────────────────────────────────────────────

interface Step4Props {
  state: WizardState;
}

function Step4({ state }: Step4Props) {
  const { data } = useApp();
  const patient = state.isNewPatient
    ? state.newPatientName
    : data.patients.find((p) => p.id === state.patientId)?.fullName ?? '—';
  const therapist = data.therapists.find((t) => t.id === state.therapistId)?.fullName ?? '—';
  const room = data.rooms.find((r) => r.id === state.roomId);
  const sessionType = data.sessionTypes.find((s) => s.id === state.sessionTypeId);
  const duration = SESSION_DURATIONS[state.sessionTypeId];

  function Row({ label, value }: { label: string; value: string }) {
    return (
      <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
        <span style={{ width: 130, color: 'var(--gray-500)', flexShrink: 0 }}>{label}</span>
        <span style={{ fontWeight: 500 }}>{value}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, margin: '0 0 8px' }}>
        Revisa los datos antes de confirmar.
      </p>
      <Row label="Tipo de sesión" value={sessionType?.name ?? '—'} />
      <Row label="Paciente" value={patient} />
      <Row label="Terapeuta" value={therapist} />
      <Row label="Sala" value={room ? `${room.name} — ${room.location}` : '—'} />
      <Row label="Fecha" value={state.date} />
      <Row label="Hora" value={`${state.time} (${duration} min)`} />
      {state.comments && <Row label="Comentarios" value={state.comments} />}
    </div>
  );
}

// ─── Paso 5: Éxito ───────────────────────────────────────────────────────────

interface Step5Props {
  folio: string;
  appointmentId: number;
}

function Step5({ folio, appointmentId }: Step5Props) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-check" style={{ fontSize: 28, color: 'var(--success)' }} />
      </div>
      <h3 style={{ margin: 0, color: 'var(--gray-800)' }}>¡Cita agendada!</h3>
      <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: 14 }}>
        La cita #{appointmentId} fue registrada exitosamente.
      </p>
      {folio && (
        <div style={{ padding: '10px 20px', background: 'var(--primary-light)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Folio del paciente</div>
          <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{folio}</div>
        </div>
      )}
    </div>
  );
}

// ─── Wizard principal ─────────────────────────────────────────────────────────

const STEP_TITLES = ['Tipo de sesión', 'Paciente', 'Horario', 'Resumen', '¡Listo!'];

export function NewAppointmentModal({ initialDate, initialTime, onClose, onSuccess }: NewAppointmentModalProps) {
  const { createAppointment, createPatient } = useApp();
  const [state, setState] = useState<WizardState>(() => INITIAL_STATE(initialDate, initialTime));

  function update(fields: Partial<WizardState>) {
    setState((s) => ({ ...s, ...fields }));
  }

  /**
   * Ejecuta validateAvailability() con los datos del paso 3.
   * No persiste nada — solo actualiza state.conflicts para mostrar errores.
   */
  function runValidation(s: WizardState) {
    const startAt = `${s.date}T${s.time}:00`;
    const duration = SESSION_DURATIONS[s.sessionTypeId];
    const endAt = addMinutes(startAt, duration);
    const errors = runFullValidation({
      startAt, endAt,
      therapistId: s.therapistId!,
      roomId: s.roomId!,
      patientId: s.patientId,
    });
    setState((prev) => ({ ...prev, conflicts: errors }));
  }

  /** Avanza al siguiente paso con validaciones por paso. */
  function handleNext() {
    if (state.step === 1) {
      update({ step: 2 });
    } else if (state.step === 2) {
      if (!state.isNewPatient && !state.patientId) return;
      if (state.isNewPatient && (!state.newPatientName.trim() || !state.newPatientPhone.trim())) return;
      update({ step: 3 });
    } else if (state.step === 3) {
      if (!state.date || !state.time || !state.therapistId || !state.roomId) return;
      if (state.conflicts.length > 0) return;
      update({ step: 4 });
    } else if (state.step === 4) {
      handleConfirm();
    }
  }

  function handleBack() {
    if (state.step > 1 && state.step < 5) {
      update({ step: (state.step - 1) as WizardState['step'] });
    }
  }

  /**
   * Guarda la cita en localStorage:
   *   1. Si es paciente nuevo → context.createPatient() → obtiene patientId y folio.
   *   2. context.createAppointment() → persiste en localStorage y dispara REFRESH_DATA.
   */
  function handleConfirm() {
    let patientId = state.patientId!;
    let folio = '';

    if (state.isNewPatient) {
      const newPat = createPatient({
        fullName: state.newPatientName,
        phone: state.newPatientPhone,
        email: state.newPatientEmail,
      });
      patientId = newPat.id;
      folio = newPat.folio;
    }

    const startAt = `${state.date}T${state.time}:00`;
    const duration = SESSION_DURATIONS[state.sessionTypeId];
    const endAt = addMinutes(startAt, duration);

    try {
      const appt = createAppointment({
        patientId,
        therapistId: state.therapistId!,
        roomId: state.roomId!,
        sessionTypeId: state.sessionTypeId as 1 | 2,
        startAt,
        endAt,
        durationMinutes: duration,
        comments: state.comments,
      });
      setState((s) => ({ ...s, step: 5, createdFolio: folio, createdApptId: appt.id }));
      onSuccess('Cita creada correctamente.');
    } catch (e) {
      update({ conflicts: [{ type: 'therapist', message: (e as Error).message }] });
    }
  }

  // Determinar si puede avanzar en cada paso
  function canAdvance(): boolean {
    if (state.step === 1) return true;
    if (state.step === 2) {
      if (state.isNewPatient) return state.newPatientName.trim().length > 1 && state.newPatientPhone.trim().length >= 7;
      return state.patientId !== null;
    }
    if (state.step === 3) return !!state.date && !!state.time && !!state.therapistId && !!state.roomId && state.conflicts.length === 0;
    if (state.step === 4) return true;
    return false;
  }

  if (state.step === 5) {
    return (
      <Modal title="Nueva cita" onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Cerrar</button>}>
        <Step5 folio={state.createdFolio} appointmentId={state.createdApptId} />
      </Modal>
    );
  }

  return (
    <Modal
      title={`Nueva cita — Paso ${state.step}: ${STEP_TITLES[state.step - 1]}`}
      onClose={onClose}
      footer={
        <>
          {state.step > 1 && (
            <button className="btn btn-secondary" onClick={handleBack}>Atrás</button>
          )}
          <button className="btn btn-primary" onClick={handleNext} disabled={!canAdvance()}>
            {state.step === 4 ? 'Confirmar' : 'Siguiente'}
          </button>
        </>
      }
    >
      {/* Barra de progreso */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= state.step ? 'var(--primary)' : 'var(--gray-200)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      {state.step === 1 && <Step1 sessionTypeId={state.sessionTypeId} onChange={(id) => update({ sessionTypeId: id })} />}
      {state.step === 2 && (
        <Step2
          patientId={state.patientId}
          isNewPatient={state.isNewPatient}
          newPatientName={state.newPatientName}
          newPatientPhone={state.newPatientPhone}
          newPatientEmail={state.newPatientEmail}
          onChange={update}
        />
      )}
      {state.step === 3 && <Step3 state={state} onChange={update} onValidate={runValidation} />}
      {state.step === 4 && <Step4 state={state} />}
    </Modal>
  );
}
