/**
 * @file hooks/useToast.ts
 * Hook para mostrar notificaciones temporales (toasts).
 *
 * Uso: const { toasts, showToast } = useToast();
 *   - `toasts` se pasa al componente <ToastContainer> para renderizarlos.
 *   - `showToast('msg', 'success')` dispara una notificación que desaparece a los 3.5 s.
 *
 * El estado de toasts vive en el componente raíz (App.tsx) para que sea
 * global y se pueda mostrar desde cualquier modal o vista.
 */

import { useState, useCallback } from 'react';
import type { ToastMessage } from '../types';

let nextId = 1;

/**
 * Gestiona una lista de mensajes toast con auto-dismiss.
 * Devuelve el array actual de toasts y una función para agregar nuevos.
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Muestra un mensaje toast que desaparece después de 3500 ms.
   *
   * @param message - Texto a mostrar
   * @param type    - Tipo visual: 'success' | 'error' | 'info'
   */
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, showToast };
}
