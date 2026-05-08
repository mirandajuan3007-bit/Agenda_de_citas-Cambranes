/**
 * @file components/patients/PatientsView.tsx
 * Vista de gestión de pacientes (RF-05 — historial).
 *
 * Muestra una tabla con todos los pacientes del store.
 * Al hacer click en "Historial" se abre un modal con todas las citas del paciente.
 * La búsqueda filtra por nombre completo o folio (PAC-XXXX).
 *
 * Conexión con store:
 *   data.patients       — lista de pacientes (localStorage)
 *   data.appointments   — para el historial por paciente
 *   data.therapists     — para mostrar nombre del terapeuta en historial
 *   data.sessionTypes   — para mostrar tipo de sesión en historial
 */

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatTime } from '../../utils/helpers';
import { DEMO_NOW } from '../../data/seed';
import { StatusBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import type { Patient, Appointment } from '../../types';

interface PatientsViewProps {
  onViewAppointment: (id: number) => void;
  onNewAppointment: () => void;
}

// ─── Historial de citas de un paciente ──────────────────────────────────────

interface HistoryModalProps {
  patient: Patient;
  appointments: Appointment[];
  now: Date;
  onViewAppointment: (id: number) => void;
  onClose: () => void;
}

/**
 * Modal que muestra todas las citas de un paciente ordenadas por fecha descendente.
 * Incluye estado visual (StatusBadge) y botón para ver detalle de cada cita.
 */
function HistoryModal({ patient, appointments, now, onViewAppointment, onClose }: HistoryModalProps) {
  const { data } = useApp();
  const sorted = [...appointments].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
  );

  return (
    <Modal title={`Historial — ${patient.fullName}`} onClose={onClose} size="lg">
      <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--gray-500)' }}>
        Folio: <strong>{patient.folio}</strong> · {sorted.length} cita{sorted.length !== 1 ? 's' : ''} registrada{sorted.length !== 1 ? 's' : ''}
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-times" />
          <p>Este paciente no tiene citas registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((a) => {
            const therapist = data.therapists.find((t) => t.id === a.therapistId);
            const sessionType = data.sessionTypes.find((s) => s.id === a.sessionTypeId);
            return (
              <div key={a.id} className="today-item" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 80 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDate(a.startAt)}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{formatTime(a.startAt)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{sessionType?.name ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{therapist?.fullName ?? '—'}</div>
                </div>
                <StatusBadge appointment={a} now={now} />
                <button
                  className="btn-icon btn-sm"
                  onClick={() => { onClose(); onViewAppointment(a.id); }}
                  title="Ver detalle"
                  style={{ marginLeft: 6 }}
                >
                  <i className="fas fa-eye" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ─── Fila de paciente en la tabla ────────────────────────────────────────────

interface PatientRowProps {
  patient: Patient;
  appointmentCount: number;
  onShowHistory: () => void;
}

function PatientRow({ patient, appointmentCount, onShowHistory }: PatientRowProps) {
  return (
    <tr>
      <td><span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>{patient.folio}</span></td>
      <td style={{ fontWeight: 500 }}>{patient.fullName}</td>
      <td>{patient.phone}</td>
      <td>{patient.email || <span className="text-gray">—</span>}</td>
      <td style={{ textAlign: 'center' }}>{appointmentCount}</td>
      <td>
        <button className="btn btn-secondary btn-sm" onClick={onShowHistory}>
          <i className="fas fa-history" /> Historial
        </button>
      </td>
    </tr>
  );
}

// ─── Vista principal ─────────────────────────────────────────────────────────

/** Vista de gestión de pacientes con búsqueda y modal de historial. */
export function PatientsView({ onViewAppointment, onNewAppointment }: PatientsViewProps) {
  const { data } = useApp();
  const [query, setQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const now = new Date(DEMO_NOW);

  const filtered = data.patients.filter((p) => {
    const q = query.toLowerCase();
    return p.fullName.toLowerCase().includes(q) || p.folio.toLowerCase().includes(q);
  });

  function getPatientAppointments(patientId: number): Appointment[] {
    return data.appointments.filter((a) => a.patientId === patientId);
  }

  return (
    <div>
      {/* Barra de herramientas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
        <button className="btn btn-primary btn-sm" onClick={onNewAppointment}>
          <i className="fas fa-plus" /> Nueva Cita
        </button>
      </div>

      {/* Tabla de pacientes */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <i className="fas fa-users" />
              <p>{query ? 'Sin resultados para tu búsqueda.' : 'No hay pacientes registrados.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'center' }}>Citas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PatientRow
                    key={p.id}
                    patient={p}
                    appointmentCount={getPatientAppointments(p.id).length}
                    onShowHistory={() => setSelectedPatient(p)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de historial */}
      {selectedPatient && (
        <HistoryModal
          patient={selectedPatient}
          appointments={getPatientAppointments(selectedPatient.id)}
          now={now}
          onViewAppointment={onViewAppointment}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
