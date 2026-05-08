/**
 * @file components/ui/Toast.tsx
 * Contenedor de notificaciones toast. Se renderiza una sola vez en App.tsx.
 * Recibe el array de toasts del hook useToast y los muestra apilados.
 */

import type { ToastMessage } from '../../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

const ICONS: Record<ToastMessage['type'], string> = {
  success: 'fa-check-circle',
  error: 'fa-times-circle',
  info: 'fa-info-circle',
};

/** Renderiza la lista de toasts activos en la esquina inferior derecha. */
export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <i className={`fas ${ICONS[t.type]}`} />
          {t.message}
        </div>
      ))}
    </div>
  );
}
