/**
 * @file context/AppContext.tsx
 * Estado global de la aplicación usando React Context + useReducer.
 *
 * Arquitectura:
 *   - AppContext provee datos y métodos a todos los componentes.
 *   - useReducer gestiona transiciones de estado de forma predecible.
 *   - Cada mutación (crear/cancelar/reprogramar) llama al servicio correspondiente
 *     y luego despacha una acción para que React re-renderice con datos frescos.
 *   - Los datos vienen SIEMPRE de localStorage via getData(), nunca de estado local.
 *
 * Flujo de datos:
 *   Component → context method → service → storage.saveData() → dispatch → re-render
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  AppData,
  User,
  ViewName,
  CreateAppointmentInput,
  RescheduleInput,
  NewPatientInput,
  Appointment,
  Patient,
} from '../types';
import { getData } from '../data/storage';
import * as appointmentService from '../services/appointments';
import * as patientService from '../services/patients';

// ─── Estado del contexto ────────────────────────────────────────────────────

interface AppState {
  /** Todos los datos persistidos (citas, pacientes, terapeutas, etc.). */
  data: AppData;
  /** Usuario autenticado actualmente. null = no autenticado. */
  currentUser: User | null;
  /** Vista activa en la navegación principal. */
  currentView: ViewName;
}

// ─── Acciones del reducer ───────────────────────────────────────────────────

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'NAVIGATE'; payload: ViewName }
  | { type: 'REFRESH_DATA' };

/**
 * Reducer puro que define todas las transiciones de estado.
 * No tiene efectos secundarios — solo recalcula el estado siguiente.
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, currentView: 'dashboard' };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'NAVIGATE':
      return { ...state, currentView: action.payload };
    case 'REFRESH_DATA':
      // Volver a leer localStorage después de cualquier mutación
      return { ...state, data: getData() };
    default:
      return state;
  }
}

// ─── Valor del contexto (API pública) ───────────────────────────────────────

interface AppContextValue {
  // Estado
  data: AppData;
  currentUser: User | null;
  currentView: ViewName;

  // Autenticación
  /** Intenta autenticar. Devuelve true si las credenciales son correctas. */
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Navegación
  navigate: (view: ViewName) => void;

  // Mutaciones de citas — cada una llama al servicio y luego hace REFRESH_DATA
  /**
   * Crea una nueva cita (RF-01). La validación debe realizarse ANTES de llamar
   * a esta función (en el componente de wizard, paso 3).
   */
  createAppointment: (input: CreateAppointmentInput) => Appointment;

  /**
   * Cancela una cita (RF-09). Solo citas con statusId=1 pueden cancelarse.
   * La cita no se elimina; cambia a statusId=2.
   */
  cancelAppointment: (appointmentId: number, reason: string) => void;

  /** Marca una cita como completada (statusId=4). Solo desde statusId=1. */
  completeAppointment: (appointmentId: number) => void;

  /**
   * Reprograma una cita (RF-08). Archiva la original (statusId=3) y crea una nueva.
   * La validación con `excludeAppointmentId` debe realizarse ANTES de llamar esto.
   */
  rescheduleAppointment: (originalId: number, input: RescheduleInput) => Appointment;

  // Mutaciones de pacientes
  /**
   * Crea un paciente nuevo y genera su folio (RF-04).
   * Se llama durante el wizard de nueva cita cuando el paciente es de primera vez.
   */
  createPatient: (input: NewPatientInput) => Patient;

  /** Fuerza re-lectura del store (útil después de resetToSeed en dev). */
  refresh: () => void;
}

// ─── Creación del contexto ──────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

/**
 * Proveedor del estado global. Envuelve toda la aplicación en main.tsx.
 * Inicializa el estado leyendo localStorage al montar.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    data: getData(),
    currentUser: null,
    currentView: 'dashboard',
  });

  // Re-leer datos al montar (por si otra pestaña los modificó)
  useEffect(() => {
    dispatch({ type: 'REFRESH_DATA' });
  }, []);

  // ── Autenticación ──────────────────────────────────────────────────────

  const login = useCallback((email: string, password: string): boolean => {
    const user = state.data.users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  }, [state.data.users]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ── Navegación ─────────────────────────────────────────────────────────

  const navigate = useCallback((view: ViewName) => {
    dispatch({ type: 'NAVIGATE', payload: view });
  }, []);

  // ── Mutaciones de citas ────────────────────────────────────────────────

  const createAppointment = useCallback(
    (input: CreateAppointmentInput): Appointment => {
      const appt = appointmentService.createAppointment(input, state.currentUser!.id);
      dispatch({ type: 'REFRESH_DATA' });
      return appt;
    },
    [state.currentUser]
  );

  const cancelAppointment = useCallback(
    (appointmentId: number, reason: string): void => {
      appointmentService.cancelAppointment(appointmentId, reason, state.currentUser!.id);
      dispatch({ type: 'REFRESH_DATA' });
    },
    [state.currentUser]
  );

  const completeAppointment = useCallback(
    (appointmentId: number): void => {
      appointmentService.completeAppointment(appointmentId, state.currentUser!.id);
      dispatch({ type: 'REFRESH_DATA' });
    },
    [state.currentUser]
  );

  const rescheduleAppointment = useCallback(
    (originalId: number, input: RescheduleInput): Appointment => {
      const newAppt = appointmentService.rescheduleAppointment(originalId, input, state.currentUser!.id);
      dispatch({ type: 'REFRESH_DATA' });
      return newAppt;
    },
    [state.currentUser]
  );

  // ── Mutaciones de pacientes ────────────────────────────────────────────

  const createPatient = useCallback(
    (input: NewPatientInput): Patient => {
      const patient = patientService.createPatient(input, state.currentUser!.id);
      dispatch({ type: 'REFRESH_DATA' });
      return patient;
    },
    [state.currentUser]
  );

  const refresh = useCallback(() => {
    dispatch({ type: 'REFRESH_DATA' });
  }, []);

  // ── Valor del contexto ─────────────────────────────────────────────────

  const value: AppContextValue = {
    data: state.data,
    currentUser: state.currentUser,
    currentView: state.currentView,
    login,
    logout,
    navigate,
    createAppointment,
    cancelAppointment,
    completeAppointment,
    rescheduleAppointment,
    createPatient,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook de acceso ─────────────────────────────────────────────────────────

/**
 * Hook para acceder al contexto de la aplicación desde cualquier componente.
 * Lanza un error descriptivo si se usa fuera del AppProvider.
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de <AppProvider>');
  }
  return ctx;
}
