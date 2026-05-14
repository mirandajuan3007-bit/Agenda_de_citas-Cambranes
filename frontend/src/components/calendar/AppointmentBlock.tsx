/**
 * @file components/calendar/AppointmentBlock.tsx
 * Bloque visual de una cita en la grilla del calendario.
 *
 * Posicionamiento:
 *   - `top` y `height` se calculan en píxeles desde utils/helpers usando PX_PER_MIN.
 *   - `left` y `width` provienen del algoritmo computeCalendarLayout() para manejar solapamientos.
 *
 * Colores (RF-07):
 *   - SCHEDULED + hora pasada → rojo con animación pulse (atrasada)
 *   - SCHEDULED → azul
 *   - COMPLETED → verde
 *   - CANCELLED → gris translúcido
 *   - RESCHEDULED → ámbar translúcido
 */

import { memo } from 'react';
import type { Appointment, AppData } from '../../types';
import { isOverdue, getTopPx, getHeightPx, formatTime } from '../../utils/helpers';
import type { AppointmentLayout } from '../../utils/helpers';

interface AppointmentBlockProps {
  layout: AppointmentLayout;
  data: AppData;
  now: Date;
  /** Padding horizontal entre bloques adyacentes en px */
  gapPx?: number;
  onClick: () => void;
}

/**
 * Determina la clase CSS del bloque según estado y condición de atraso.
 * La condición "overdue" es visual y se calcula aquí, NO viene del store.
 */
function getBlockClass(appt: Appointment, now: Date): string {
  if (isOverdue(appt.statusId, appt.startAt, now)) return 'appt-overdue';
  const map: Record<number, string> = {
    1: 'appt-scheduled',
    2: 'appt-cancelled',
    3: 'appt-rescheduled',
    4: 'appt-completed',
  };
  return map[appt.statusId] ?? 'appt-scheduled';
}

/** Bloque individual de cita posicionado absolutamente en la columna del día. */
function AppointmentBlockImpl({ layout, data, now, gapPx = 3, onClick }: AppointmentBlockProps) {
  const { appointment: a, leftPct, widthPct } = layout;
  const patient = data.patients.find((p) => p.id === a.patientId);
  const top = getTopPx(a.startAt);
  const height = getHeightPx(a.durationMinutes);
  const blockClass = getBlockClass(a, now);

  // Calcular left/width con pequeño gap entre bloques adyacentes
  const colWidth = widthPct;
  const leftStyle = `calc(${leftPct}% + ${gapPx}px)`;
  const widthStyle = `calc(${colWidth}% - ${gapPx * 2}px)`;

  return (
    <div
      className={`appt-block ${blockClass}`}
      style={{ top, height, left: leftStyle, width: widthStyle, minHeight: 24 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={`${patient?.fullName} · ${formatTime(a.startAt)}-${formatTime(a.endAt)}`}
    >
      <div className="appt-time-str">{formatTime(a.startAt)} – {formatTime(a.endAt)}</div>
      {height > 34 && <div className="appt-patient-name">{patient?.fullName ?? '—'}</div>}
      {height > 54 && (
        <div className="appt-type-name">
          {data.sessionTypes.find((s) => s.id === a.sessionTypeId)?.name}
        </div>
      )}
    </div>
  );
}

// Memoizado: solo re-renderiza si cambia la cita, sus dimensiones de layout,
// la hora "ahora" o el handler de click. Importante cuando hay 50+ citas
// en la semana visible.
export const AppointmentBlock = memo(
  AppointmentBlockImpl,
  (prev, next) =>
    prev.layout.appointment === next.layout.appointment &&
    prev.layout.leftPct === next.layout.leftPct &&
    prev.layout.widthPct === next.layout.widthPct &&
    prev.now.getTime() === next.now.getTime() &&
    prev.data === next.data &&
    prev.onClick === next.onClick
);
