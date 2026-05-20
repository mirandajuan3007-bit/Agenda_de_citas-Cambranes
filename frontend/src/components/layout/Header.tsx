/**
 * @file components/layout/Header.tsx
 * Barra superior con el título de la vista activa, la fecha actual y el botón "Nueva Cita".
 */

import { DEMO_TODAY } from '../../data/seed';
import type { ViewName } from '../../types';

interface HeaderProps {
  currentView: ViewName;
  onNewAppointment: () => void;
}

const VIEW_META: Record<ViewName, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard',   subtitle: 'Resumen del día' },
  agenda:    { title: 'Agenda',       subtitle: 'Vista semanal de citas' },
  patients:  { title: 'Pacientes',   subtitle: 'Gestión de pacientes registrados' },
};

/** Encabezado fijo de la aplicación con metainformación de la vista activa. */
export function Header({ currentView, onNewAppointment }: HeaderProps) {
  const { title, subtitle } = VIEW_META[currentView];

  const dateLabel = new Date(DEMO_TODAY + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="app-header">
      <div className="header-left">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="header-right">
        <div className="header-date">
          <i className="fas fa-calendar" style={{ marginRight: 6, color: 'var(--gray-400)' }} />
          {dateLabel}
        </div>
        <button className="btn btn-primary btn-sm" onClick={onNewAppointment}>
          <i className="fas fa-plus" /> Nueva Cita
        </button>
      </div>
    </header>
  );
}
