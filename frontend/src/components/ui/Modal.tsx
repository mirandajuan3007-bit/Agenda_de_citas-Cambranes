/**
 * @file components/ui/Modal.tsx
 * Componente base para todos los modales del sistema.
 * Maneja: renderizado sobre backdrop, scroll interno, cierre con Escape y click en backdrop.
 */

import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  /** children del body del modal */
  children: ReactNode;
  /** Botones del footer (Atrás, Confirmar, etc.) */
  footer?: ReactNode;
  /** 'modal-lg' para formularios más anchos */
  size?: 'default' | 'lg';
}

/**
 * Modal base con overlay. Cierra al presionar Escape o hacer click fuera.
 * Los hijos se renderizan en el área scrollable del body.
 */
export function Modal({ title, onClose, children, footer, size = 'default' }: ModalProps) {
  // Cerrar con tecla Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-box ${size === 'lg' ? 'modal-lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
