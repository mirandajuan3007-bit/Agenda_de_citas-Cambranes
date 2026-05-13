/**
 * @file context/AppContext.tsx
 * Estado global. El backend Spring Boot es ahora la fuente de verdad;
 * este contexto orquesta el login, mantiene el usuario actual en
 * localStorage y refresca el cache local tras cada mutacion.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
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
import { getData, hydrateAll } from '../data/storage';
import * as appointmentService from '../services/appointments';
import * as patientService from '../services/patients';
import { api } from '../services/api';

// ─── Reducer ────────────────────────────────────────────────────────────────

interface AppState {
  data: AppData;
  currentUser: User | null;
  currentView: ViewName;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'NAVIGATE'; payload: ViewName }
  | { type: 'REFRESH_DATA' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':    return { ...state, currentUser: action.payload, currentView: 'dashboard' };
    case 'LOGOUT':   return { ...state, currentUser: null };
    case 'NAVIGATE': return { ...state, currentView: action.payload };
    case 'REFRESH_DATA': return { ...state, data: getData() };
    default: return state;
  }
}

// ─── Context API ────────────────────────────────────────────────────────────

interface AppContextValue {
  data: AppData;
  currentUser: User | null;
  currentView: ViewName;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  navigate: (view: ViewName) => void;
  createAppointment:     (input: CreateAppointmentInput) => Promise<Appointment>;
  cancelAppointment:     (appointmentId: number, reason: string) => Promise<void>;
  completeAppointment:   (appointmentId: number) => Promise<void>;
  rescheduleAppointment: (originalId: number, input: RescheduleInput) => Promise<Appointment>;
  createPatient:         (input: NewPatientInput) => Promise<Patient>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

const STORAGE_USER_KEY = 'currentUser';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    data: getData(),
    currentUser: null,
    currentView: 'dashboard',
  });
  const [loading, setLoading] = useState(false);

  // Restaurar sesion previa al cargar y traer datos del backend.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) {
      try {
        const u = JSON.parse(raw) as User;
        dispatch({ type: 'LOGIN', payload: u });
        setLoading(true);
        hydrateAll()
          .then(() => dispatch({ type: 'REFRESH_DATA' }))
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await hydrateAll();
    dispatch({ type: 'REFRESH_DATA' });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    let user: User;
    try {
      user = await api.login(email, password);
    } catch (err: any) {
      // 401/404 = credenciales invalidas (esperado). Cualquier otra cosa
      // (fetch falla, 5xx, etc) se propaga para que el caller pueda
      // mostrar un mensaje diferente al usuario.
      if (err?.status === 401 || err?.status === 404) return false;
      throw err;
    }
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
    setLoading(true);
    try {
      await hydrateAll();
      dispatch({ type: 'REFRESH_DATA' });
    } finally {
      setLoading(false);
    }
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const navigate = useCallback((view: ViewName) => {
    dispatch({ type: 'NAVIGATE', payload: view });
  }, []);

  const createAppointment = useCallback(async (input: CreateAppointmentInput) => {
    const a = await appointmentService.createAppointment(input);
    dispatch({ type: 'REFRESH_DATA' });
    return a;
  }, []);

  const cancelAppointment = useCallback(async (id: number, reason: string) => {
    await appointmentService.cancelAppointment(id, reason);
    dispatch({ type: 'REFRESH_DATA' });
  }, []);

  const completeAppointment = useCallback(async (id: number) => {
    await appointmentService.completeAppointment(id);
    dispatch({ type: 'REFRESH_DATA' });
  }, []);

  const rescheduleAppointment = useCallback(async (id: number, input: RescheduleInput) => {
    const a = await appointmentService.rescheduleAppointment(id, input);
    dispatch({ type: 'REFRESH_DATA' });
    return a;
  }, []);

  const createPatient = useCallback(async (input: NewPatientInput) => {
    const p = await patientService.createPatient(input);
    dispatch({ type: 'REFRESH_DATA' });
    return p;
  }, []);

  const value: AppContextValue = {
    data: state.data,
    currentUser: state.currentUser,
    currentView: state.currentView,
    loading,
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

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
