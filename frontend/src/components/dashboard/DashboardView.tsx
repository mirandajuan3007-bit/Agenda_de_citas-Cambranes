/**
 * @file components/dashboard/DashboardView.tsx
 * Vista del Dashboard principal.
 *
 * Muestra:
 * - 4 tarjetas de estadísticas (citas hoy, programadas, finalizadas, atrasadas)
 * - Lista de citas del día actual con sus estados
 * - Alertas de citas atrasadas (RF-07)
 * - Resumen de recursos (terapeutas y sus salas)
 *
 * Todos los datos se obtienen de context.data (que viene de localStorage).
 */

import { useApp } from '../../context/AppContext';
import { DEMO_TODAY, DEMO_NOW } from '../../data/seed';
import { isOverdue, formatTime } from '../../utils/helpers';
import { StatusBadge } from '../ui/Badge';
import type { Appointment } from '../../types';

interface DashboardViewProps {
  onViewAppointment: (id: number) => void;
  onNewAppointment: () => void;
  onNavigateToAgenda: () => void;
}

/** Tarjeta de estadística individual. */
function StatCard({ icon, iconClass, label, value }: { icon: string; iconClass: string; label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}><i className={`fas ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

/** Vista completa del Dashboard. */
export function DashboardView({ onViewAppointment, onNewAppointment, onNavigateToAgenda }: DashboardViewProps) {
  const { data } = useApp();
  const now = new Date(DEMO_NOW);

  // Filtrar citas de hoy
  const todayAppts = data.appointments
    .filter((a) => a.startAt.startsWith(DEMO_TODAY))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const overdueAppts = todayAppts.filter((a) => isOverdue(a.statusId, a.startAt, now));
  const scheduledCount = todayAppts.filter((a) => a.statusId === 1).length;
  const completedCount = todayAppts.filter((a) => a.statusId === 4).length;

  return (
    <div>
      {/* Estadísticas */}
      <div className="stats-grid">
        <StatCard icon="fa-calendar-day" iconClass="si-blue"  label="Citas hoy"      value={todayAppts.length} />
        <StatCard icon="fa-clock"        iconClass="si-blue"  label="Programadas"    value={scheduledCount} />
        <StatCard icon="fa-check-circle" iconClass="si-green" label="Finalizadas hoy" value={completedCount} />
        <StatCard icon="fa-exclamation-circle" iconClass="si-red" label="Atrasadas" value={overdueAppts.length} />
      </div>

      <div className="dashboard-grid">
        {/* Citas del día */}
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-calendar-day" style={{ color: 'var(--primary)' }} /> Citas de hoy</h3>
            <button className="btn btn-secondary btn-sm" onClick={onNavigateToAgenda}>
              Ver agenda completa
            </button>
          </div>
          <div className="card-body">
            {todayAppts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-check" />
                <p>No hay citas para hoy</p>
              </div>
            ) : (
              todayAppts.map((a) => <TodayItem key={a.id} appointment={a} data={data} now={now} onView={() => onViewAppointment(a.id)} />)
            )}
          </div>
          <div style={{ padding: '0 18px 14px' }}>
            <button className="add-slot-btn" onClick={onNewAppointment}>
              <i className="fas fa-plus" /> Agendar nueva cita
            </button>
          </div>
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Alertas de atraso (RF-07) */}
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)' }} /> Alertas de atraso</h3>
            </div>
            <div className="card-body">
              {overdueAppts.length === 0 ? (
                <div className="empty-state" style={{ padding: '12px 0' }}>
                  <i className="fas fa-check" style={{ fontSize: 24, color: 'var(--success)' }} />
                  <p>Sin alertas de atraso</p>
                </div>
              ) : (
                overdueAppts.map((a) => {
                  const p = data.patients.find((x) => x.id === a.patientId);
                  return (
                    <div key={a.id} className="today-item">
                      <i className="fas fa-exclamation-circle" style={{ color: 'var(--danger)', marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div className="font-semibold" style={{ fontSize: 13 }}>{p?.fullName}</div>
                        <div className="text-xs text-gray">Inicio: {formatTime(a.startAt)}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => onViewAppointment(a.id)}>Ver</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recursos disponibles */}
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-info-circle" style={{ color: 'var(--primary)' }} /> Recursos hoy</h3>
            </div>
            <div className="card-body">
              {data.therapists.map((t) => {
                const room = data.rooms.find((r) => r.id === t.roomId);
                const count = todayAppts.filter((a) => a.therapistId === t.id && a.statusId === 1).length;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="font-medium" style={{ fontSize: 12 }}>{t.fullName}</div>
                      <div className="text-xs text-gray">{room?.name} · {room?.location}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{count} cita{count !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componente: ítem de cita en la lista de hoy ────────────────────────

interface TodayItemProps {
  appointment: Appointment;
  data: ReturnType<typeof useApp>['data'];
  now: Date;
  onView: () => void;
}

function TodayItem({ appointment: a, data, now, onView }: TodayItemProps) {
  const patient = data.patients.find((p) => p.id === a.patientId);
  const therapist = data.therapists.find((t) => t.id === a.therapistId);
  const sessionType = data.sessionTypes.find((s) => s.id === a.sessionTypeId);

  return (
    <div className="today-item">
      <div className="today-time">{formatTime(a.startAt)}</div>
      <div className="today-info" style={{ flex: 1 }}>
        <h4>{patient?.fullName ?? '—'}</h4>
        <p>{therapist?.fullName} · {sessionType?.name}</p>
      </div>
      <StatusBadge appointment={a} now={now} />
      <button className="btn-icon btn-sm" onClick={onView} title="Ver detalle" style={{ marginLeft: 6 }}>
        <i className="fas fa-eye" />
      </button>
    </div>
  );
}
