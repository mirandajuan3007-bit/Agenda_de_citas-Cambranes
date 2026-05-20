/**
 * @file components/calendar/CalendarView.tsx
 * Vista de la agenda en formato de calendario semanal (lunes a viernes).
 *
 * Estructura:
 *   CalendarView (barra de herramientas + grilla)
 *     └── CalendarGrid (columnas de días + bloques de citas)
 *           └── AppointmentBlock (bloque individual de cita)
 *
 * Navegación semanal:
 *   - Estado `weekStart` guarda el lunes de la semana visible.
 *   - Los botones Atrás/Adelante mueven en bloques de 7 días.
 *   - "Hoy" restaura la semana que contiene DEMO_TODAY.
 */

import { useState } from 'react';
import { getWeekStart, getWeekDays } from '../../utils/helpers';
import { DEMO_TODAY, DEMO_NOW } from '../../data/seed';
import { CalendarGrid } from './CalendarGrid';
import type { Appointment } from '../../types';

interface CalendarViewProps {
  appointments: Appointment[];
  onViewAppointment: (id: number) => void;
  onNewAppointment: (date?: string, time?: string) => void;
}

/** Vista semanal del calendario con navegación de semanas. */
export function CalendarView({ appointments, onViewAppointment, onNewAppointment }: CalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(DEMO_TODAY + 'T12:00:00')));

  const days = getWeekDays(weekStart);
  const weekEnd = days[4];

  // Etiqueta de la semana actual ("27 abr. – 1 may. 2026")
  const label = `${weekStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  function prevWeek() {
    setWeekStart((ws) => { const d = new Date(ws); d.setDate(d.getDate() - 7); return d; });
  }
  function nextWeek() {
    setWeekStart((ws) => { const d = new Date(ws); d.setDate(d.getDate() + 7); return d; });
  }
  function goToToday() {
    setWeekStart(getWeekStart(new Date(DEMO_TODAY + 'T12:00:00')));
  }

  return (
    <div>
      {/* Barra de herramientas */}
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="btn-icon" onClick={prevWeek} title="Semana anterior"><i className="fas fa-chevron-left" /></button>
          <button className="btn btn-secondary btn-sm" onClick={goToToday}>Hoy</button>
          <button className="btn-icon" onClick={nextWeek} title="Semana siguiente"><i className="fas fa-chevron-right" /></button>
          <h3>{label}</h3>
        </div>
        <div className="calendar-legend">
          <span><span className="legend-dot" style={{ background: '#BFDBFE' }} />Programada</span>
          <span><span className="legend-dot" style={{ background: '#FECACA' }} />Atrasada</span>
          <span><span className="legend-dot" style={{ background: '#BBF7D0' }} />Finalizada</span>
          <span><span className="legend-dot" style={{ background: '#E5E7EB' }} />Cancelada</span>
        </div>
      </div>

      {/* Grilla del calendario */}
      <div className="calendar-wrapper">
        <div className="calendar-scroll">
          <CalendarGrid
            days={days}
            appointments={appointments}
            today={DEMO_TODAY}
            now={new Date(DEMO_NOW)}
            onViewAppointment={onViewAppointment}
            onClickSlot={(date, time) => onNewAppointment(date, time)}
          />
        </div>
      </div>
    </div>
  );
}
