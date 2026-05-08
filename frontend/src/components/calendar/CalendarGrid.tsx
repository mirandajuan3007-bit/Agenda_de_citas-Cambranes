/**
 * @file components/calendar/CalendarGrid.tsx
 * Grilla principal del calendario semanal (lunes–viernes).
 *
 * Estructura visual:
 *   ┌────────────┬───────────────────────────────────────────┐
 *   │  (vacío)   │  Lun 27  │  Mar 28  │  Mié 29  │  ...    │
 *   ├────────────┼──────────┴──────────┴──────────┴─────────┤
 *   │  09:00     │  [columnas de citas — position:relative]  │
 *   │  09:30     │                                           │
 *   │   ...      │                                           │
 *   │  17:30     │                                           │
 *   └────────────┴───────────────────────────────────────────┘
 *
 * Cada columna de día:
 *   - Tiene alto fijo = CALENDAR_HEIGHT_PX (765px).
 *   - Líneas horizontales cada 30 min (= 45px).
 *   - Línea roja "ahora" si la columna es hoy.
 *   - Los bloques de cita se posicionan absolutamente.
 *   - Click en área vacía → pre-rellena fecha/hora en el modal.
 *
 * Algoritmo de layout: computeCalendarLayout() en helpers.ts
 *   divide el ancho de la columna entre citas que se solapan.
 */

import { useMemo } from 'react';
import type { Appointment, AppData } from '../../types';
import {
  WORK_START_MIN,
  WORK_END_MIN,
  PX_PER_MIN,
  CALENDAR_HEIGHT_PX,
  computeCalendarLayout,
  toLocalISO,
} from '../../utils/helpers';
import { AppointmentBlock } from './AppointmentBlock';
import { useApp } from '../../context/AppContext';

interface CalendarGridProps {
  /** Array de 5 Date objects (lunes–viernes de la semana visible). */
  days: Date[];
  appointments: Appointment[];
  /** 'YYYY-MM-DD' del día de hoy (demo). */
  today: string;
  /** Timestamp "ahora" simulado. */
  now: Date;
  onViewAppointment: (id: number) => void;
  /** Callback cuando el usuario hace click en un slot vacío del calendario. */
  onClickSlot: (date: string, time: string) => void;
}

// Etiquetas de hora que se muestran en la columna izquierda (cada 30 min).
const TIME_LABELS: string[] = (() => {
  const labels: string[] = [];
  for (let min = WORK_START_MIN; min <= WORK_END_MIN; min += 30) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    labels.push(`${h}:${m}`);
  }
  return labels;
})();

/** Convierte minutos desde medianoche a píxeles dentro de la grilla. */
function minutesToPx(totalMinutes: number): number {
  return (totalMinutes - WORK_START_MIN) * PX_PER_MIN;
}

// ─── Columna de etiquetas de hora ───────────────────────────────────────────

function TimeColumn() {
  return (
    <div className="cal-time-col">
      {TIME_LABELS.map((label) => (
        <div key={label} className="cal-time-label">{label}</div>
      ))}
    </div>
  );
}

// ─── Líneas de la grilla (cada 30 min) ──────────────────────────────────────

/** Dibuja las líneas horizontales de la grilla dentro de una columna de día. */
function GridLines() {
  return (
    <>
      {TIME_LABELS.map((label, i) => (
        <div
          key={label}
          className={`cal-grid-line ${i % 2 === 0 ? 'cal-grid-line-hour' : 'cal-grid-line-half'}`}
          style={{ top: minutesToPx(WORK_START_MIN + i * 30) }}
        />
      ))}
    </>
  );
}

// ─── Línea roja "ahora" ──────────────────────────────────────────────────────

interface NowLineProps {
  now: Date;
}

/**
 * Línea horizontal roja que indica la hora actual dentro de la columna de hoy.
 * Solo se renderiza si `now` cae dentro del horario laboral.
 */
function NowLine({ now }: NowLineProps) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < WORK_START_MIN || nowMin > WORK_END_MIN) return null;
  return <div className="cal-now-line" style={{ top: minutesToPx(nowMin) }} />;
}

// ─── Columna de un día ───────────────────────────────────────────────────────

interface DayColumnProps {
  dateStr: string; // 'YYYY-MM-DD'
  isToday: boolean;
  appointments: Appointment[];
  data: AppData;
  now: Date;
  onViewAppointment: (id: number) => void;
  onClickSlot: (date: string, time: string) => void;
}

/**
 * Columna de un día en la grilla del calendario.
 * Calcula el layout de solapamientos con computeCalendarLayout()
 * y renderiza un AppointmentBlock por cada cita.
 *
 * Al hacer click en área vacía, calcula la hora según la posición Y
 * del click y la pasa a onClickSlot para pre-rellenar el modal.
 */
function DayColumn({ dateStr, isToday, appointments, data, now, onViewAppointment, onClickSlot }: DayColumnProps) {
  const layouts = useMemo(() => computeCalendarLayout(appointments), [appointments]);

  /** Convierte la posición Y del click a string 'HH:MM' redondeado a 30 min. */
  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    // Si el click fue en un bloque de cita existente, ignorar
    if ((e.target as HTMLElement).closest('.appt-block')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const yPx = e.clientY - rect.top;
    const clickedMin = Math.round(yPx / PX_PER_MIN + WORK_START_MIN);
    // Redondear al bloque de 30 min más cercano
    const snappedMin = Math.round(clickedMin / 30) * 30;
    const clamped = Math.max(WORK_START_MIN, Math.min(WORK_END_MIN - 30, snappedMin));
    const h = Math.floor(clamped / 60).toString().padStart(2, '0');
    const m = (clamped % 60).toString().padStart(2, '0');
    onClickSlot(dateStr, `${h}:${m}`);
  }

  return (
    <div
      className={`cal-day-col ${isToday ? 'cal-day-today' : ''}`}
      style={{ height: CALENDAR_HEIGHT_PX, position: 'relative' }}
      onClick={handleColumnClick}
    >
      <GridLines />
      {isToday && <NowLine now={now} />}
      {layouts.map((layout) => (
        <AppointmentBlock
          key={layout.appointment.id}
          layout={layout}
          data={data}
          now={now}
          onClick={() => onViewAppointment(layout.appointment.id)}
        />
      ))}
    </div>
  );
}

// ─── Cabecera de días ────────────────────────────────────────────────────────

interface DaysHeaderProps {
  days: Date[];
  today: string;
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

/** Fila de cabecera con nombre y número de cada día de la semana. */
function DaysHeader({ days, today }: DaysHeaderProps) {
  return (
    <div className="cal-header-row">
      <div className="cal-time-col" /> {/* espacio para columna de horas */}
      {days.map((d, i) => {
        const dateStr = toLocalISO(d).slice(0, 10);
        const isToday = dateStr === today;
        return (
          <div key={dateStr} className={`cal-day-header ${isToday ? 'cal-day-header-today' : ''}`}>
            <span className="cal-day-name">{DAY_NAMES[i]}</span>
            <span className={`cal-day-num ${isToday ? 'cal-day-num-today' : ''}`}>
              {d.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

/**
 * CalendarGrid — grilla semanal completa.
 *
 * Obtiene AppData del contexto global para pasarla a cada AppointmentBlock
 * (necesita listas de pacientes, tipos de sesión, etc.).
 *
 * Las citas se filtran por día antes de pasarse a cada DayColumn,
 * evitando que computeCalendarLayout() procese citas de otros días.
 */
export function CalendarGrid({ days, appointments, today, now, onViewAppointment, onClickSlot }: CalendarGridProps) {
  const { data } = useApp();

  return (
    <div className="cal-grid-root">
      <DaysHeader days={days} today={today} />
      <div className="cal-body-row">
        <TimeColumn />
        {days.map((d) => {
          const dateStr = toLocalISO(d).slice(0, 10);
          const dayAppts = appointments.filter((a) => a.startAt.startsWith(dateStr));
          return (
            <DayColumn
              key={dateStr}
              dateStr={dateStr}
              isToday={dateStr === today}
              appointments={dayAppts}
              data={data}
              now={now}
              onViewAppointment={onViewAppointment}
              onClickSlot={onClickSlot}
            />
          );
        })}
      </div>
    </div>
  );
}
