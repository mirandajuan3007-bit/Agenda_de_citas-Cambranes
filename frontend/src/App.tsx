/**
 * @file App.tsx
 * Componente raíz de la aplicación.
 *
 * Responsabilidades:
 *   - Decide si mostrar LoginPage o el shell de la app según `currentUser`.
 *   - Gestiona qué modal está abierto (nueva cita, detalle, ninguno).
 *   - Centraliza los toasts: todas las operaciones que mutan datos llaman
 *     a showToast() aquí y lo propagan como callback a los componentes hijos.
 *   - Orquesta la navegación entre vistas (Dashboard / Agenda / Pacientes)
 *     via el contexto global.
 *
 * Árbol de componentes:
 *   App
 *   ├── LoginPage (si no autenticado)
 *   └── Shell (si autenticado)
 *       ├── Sidebar
 *       ├── Header
 *       ├── DashboardView | CalendarView | PatientsView
 *       ├── ToastContainer
 *       └── [Modales: NewAppointmentModal | AppointmentDetailModal]
 */

import { useApp } from './context/AppContext';
import { useToast } from './hooks/useToast';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { PatientsView } from './components/patients/PatientsView';
import { NewAppointmentModal } from './components/modals/NewAppointmentModal';
import { AppointmentDetailModal } from './components/modals/AppointmentDetailModal';
import { ToastContainer } from './components/ui/Toast';
import { useState } from 'react';

// ─── Tipos de modal ──────────────────────────────────────────────────────────

type ModalState =
  | { kind: 'none' }
  | { kind: 'new'; date?: string; time?: string }
  | { kind: 'detail'; appointmentId: number };

// ─── Shell autenticado ───────────────────────────────────────────────────────

/**
 * Shell principal de la aplicación (solo se renderiza cuando hay sesión activa).
 *
 * Maneja el estado de modales con un discriminated union para
 * garantizar que solo un modal esté abierto a la vez.
 */
function AppShell() {
  const { currentView, data, navigate } = useApp();
  const { toasts, showToast } = useToast();
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  function openNewAppointment(date?: string, time?: string) {
    setModal({ kind: 'new', date, time });
  }

  function openDetail(id: number) {
    setModal({ kind: 'detail', appointmentId: id });
  }

  function closeModal() {
    setModal({ kind: 'none' });
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Header currentView={currentView} onNewAppointment={() => openNewAppointment()} />

        <main className="app-content">
          {currentView === 'dashboard' && (
            <DashboardView
              onViewAppointment={openDetail}
              onNewAppointment={() => openNewAppointment()}
              onNavigateToAgenda={() => navigate('agenda')}
            />
          )}

          {currentView === 'agenda' && (
            <CalendarView
              appointments={data.appointments}
              onViewAppointment={openDetail}
              onNewAppointment={openNewAppointment}
            />
          )}

          {currentView === 'patients' && (
            <PatientsView
              onViewAppointment={openDetail}
              onNewAppointment={() => openNewAppointment()}
            />
          )}
        </main>
      </div>

      {/* Modales */}
      {modal.kind === 'new' && (
        <NewAppointmentModal
          initialDate={modal.date}
          initialTime={modal.time}
          onClose={closeModal}
          onSuccess={(msg) => { showToast(msg, 'success'); closeModal(); }}
        />
      )}

      {modal.kind === 'detail' && (
        <AppointmentDetailModal
          appointmentId={modal.appointmentId}
          onClose={closeModal}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ─── Componente raíz ─────────────────────────────────────────────────────────

/**
 * App — punto de entrada de la UI.
 *
 * Lee currentUser del contexto (persistido en localStorage).
 * Si no hay sesión → LoginPage.
 * Si hay sesión → AppShell.
 */
export function App() {
  const { currentUser } = useApp();
  return currentUser ? <AppShell /> : <LoginPage />;
}
