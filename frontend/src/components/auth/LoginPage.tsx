/**
 * @file components/auth/LoginPage.tsx
 * Pantalla de inicio de sesión.
 * Valida las credenciales contra el store via AppContext.login().
 * Si el login es exitoso, el contexto cambia `currentUser` y el componente
 * raíz (App.tsx) renderiza la shell principal automáticamente.
 */

import { useState, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';

/** Formulario de login con validación local de credenciales. */
export function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('secretaria@clinica.mx');
  const [password, setPassword] = useState('secretaria123');
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    const ok = login(email.trim(), password);
    if (!ok) setError(true);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon-wrap">
            <i className="fas fa-calendar-heart" />
          </div>
          <h1>AgendaCitas</h1>
          <p>Clínica Psicológica Cambranes</p>
        </div>

        <div className="login-hint">
          <p><strong>Secretaria:</strong> secretaria@clinica.mx / secretaria123</p>
          <p><strong>Coordinador:</strong> coordinador@clinica.mx / coordinador123</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="l-email">Correo electrónico</label>
            <input
              id="l-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@clinica.mx"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="l-pass">Contraseña</label>
            <input
              id="l-pass"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="form-error mb-2">Credenciales incorrectas. Intenta de nuevo.</p>}
          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
            <i className="fas fa-sign-in-alt" /> Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
