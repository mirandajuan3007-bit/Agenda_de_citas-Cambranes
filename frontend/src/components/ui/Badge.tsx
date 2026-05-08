/**
 * @file components/ui/Badge.tsx
 * Componente visual para mostrar el estado de una cita.
 * La clase CSS usada depende del statusId y de si la cita está "atrasada" (RF-07).
 */

import type { Appointment } from '../../types';
import { isOverdue } from '../../utils/helpers';

interface BadgeProps {
  appointment: Appointment;
  /** Momento "ahora" — se puede sobreescribir para testing. */
  now?: Date;
}

/**
 * Muestra la etiqueta de estado de la cita con color apropiado.
 * Si statusId===1 pero la hora de inicio ya pasó, muestra "Atrasada" en rojo.
 */
export function StatusBadge({ appointment, now }: BadgeProps) {
  const overdue = isOverdue(appointment.statusId, appointment.startAt, now);

  if (overdue) {
    return <span className="badge badge-overdue"><i className="fas fa-exclamation-circle" /> Atrasada</span>;
  }

  const map: Record<number, { cls: string; label: string }> = {
    1: { cls: 'badge-scheduled',   label: 'Programada' },
    2: { cls: 'badge-cancelled',   label: 'Cancelada' },
    3: { cls: 'badge-rescheduled', label: 'Reprogramada' },
    4: { cls: 'badge-completed',   label: 'Finalizada' },
  };

  const { cls, label } = map[appointment.statusId] ?? map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}
