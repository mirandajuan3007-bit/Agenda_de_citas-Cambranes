/**
 * @file components/auth/LoginPage.tsx
 * Pantalla de inicio de sesión.
 * Valida las credenciales contra el store via AppContext.login().
 * Si el login es exitoso, el contexto cambia `currentUser` y el componente
 * raíz (App.tsx) renderiza la shell principal automáticamente.
 */

import { useState, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';

/** Formulario de login con validacion contra el backend. */
export function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('secretaria@clinica.mx');
  const [password, setPassword] = useState('secretaria123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await login(email.trim(), password);
      if (!ok) setError('Credenciales incorrectas. Intenta de nuevo.');
    } catch (err: any) {
      // Errores no relacionados con credenciales (backend caido, 5xx, etc.)
      const status = err?.status;
      if (status === undefined) {
        setError('No se pudo conectar con el servidor. Verifica que el backend este corriendo.');
      } else {
        setError(`Error del servidor (${status}). Intenta de nuevo en unos segundos.`);
      }
      // eslint-disable-next-line no-console
      console.error('[login] error', err);
    } finally {
      setSubmitting(false);
    }
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
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>
          {error && <p className="form-error mb-2">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? (
              <><i className="fas fa-spinner fa-spin" /> Ingresando…</>
            ) : (
              <><i className="fas fa-sign-in-alt" /> Ingresar</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
