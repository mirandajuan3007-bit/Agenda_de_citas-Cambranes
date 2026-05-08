/**
 * @file components/layout/Sidebar.tsx
 * Barra lateral de navegación principal.
 * Llama a context.navigate() al hacer click en cada item.
 */

import { useApp } from '../../context/AppContext';
import type { ViewName } from '../../types';

interface NavItemProps {
  view: ViewName;
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

/** Item individual del menú lateral. */
function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <i className={`fas ${icon}`} />
      {label}
    </button>
  );
}

/** Sidebar completo con marca, navegación y datos del usuario activo. */
export function Sidebar() {
  const { currentView, currentUser, navigate, logout } = useApp();

  const navItems: { view: ViewName; icon: string; label: string }[] = [
    { view: 'dashboard', icon: 'fa-th-large',    label: 'Dashboard' },
    { view: 'agenda',    icon: 'fa-calendar-alt', label: 'Agenda' },
    { view: 'patients',  icon: 'fa-users',         label: 'Pacientes' },
  ];

  return (
    <aside className="sidebar">
      {/* Marca */}
      <div className="sidebar-brand">
        <div className="brand-icon"><i className="fas fa-calendar-heart" /></div>
        <div>
          <div className="brand-name">AgendaCitas</div>
          <div className="brand-sub">Clínica Cambranes</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <div className="nav-section">Principal</div>
        {navItems.slice(0, 2).map((item) => (
          <NavItem
            key={item.view}
            {...item}
            active={currentView === item.view}
            onClick={() => navigate(item.view)}
          />
        ))}
        <div className="nav-section">Gestión</div>
        {navItems.slice(2).map((item) => (
          <NavItem
            key={item.view}
            {...item}
            active={currentView === item.view}
            onClick={() => navigate(item.view)}
          />
        ))}
      </nav>

      {/* Usuario activo */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="s-avatar">{currentUser?.fullName[0]}</div>
          <div className="s-user-info">
            <div className="s-user-name">{currentUser?.fullName}</div>
            <div className="s-user-role">
              {currentUser?.role === 'secretaria' ? 'Secretaria' : 'Coordinador'}
            </div>
          </div>
          <button className="btn-logout-sm" onClick={logout} title="Cerrar sesión">
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </div>
    </aside>
  );
}
