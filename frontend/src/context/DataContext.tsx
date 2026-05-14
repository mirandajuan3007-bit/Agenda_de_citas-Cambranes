/**
 * @file context/DataContext.tsx
 * Cache de datos del backend + navegacion entre vistas + mutaciones.
 *
 * Separado de AuthContext (SRP): aqui vive el dominio, no la identidad.
 * Reacciona al currentUser de AuthContext: cuando aparece, hidrata; cuando
 * se va, limpia.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppData,
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
import { useAuth } from './AuthContext';

interface DataState {
  data: AppData;
  currentView: ViewName;
}

type DataAction =
  | { type: 'NAVIGATE'; payload: ViewName }
  | { type: 'REFRESH' };

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'NAVIGATE': return { ...state, currentView: action.payload };
    case 'REFRESH':  return { ...state, data: getData() };
    default: return state;
  }
}

interface DataContextValue {
  data: AppData;
  currentView: ViewName;
  loading: boolean;
  navigate: (view: ViewName) => void;
  refresh: () => Promise<void>;
  createAppointment:     (input: CreateAppointmentInput) => Promise<Appointment>;
  cancelAppointment:     (appointmentId: number, reason: string) => Promise<void>;
  completeAppointment:   (appointmentId: number) => Promise<void>;
  rescheduleAppointment: (originalId: number, input: RescheduleInput) => Promise<Appointment>;
  createPatient:         (input: NewPatientInput) => Promise<Patient>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(dataReducer, {
    data: getData(),
    currentView: 'dashboard',
  });
  const [loading, setLoading] = useState(false);

  // Hidrata cuando el usuario aparece; limpia cuando desaparece.
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: 'REFRESH' });
      return;
    }
    setLoading(true);
    hydrateAll()
      .then(() => dispatch({ type: 'REFRESH' }))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const refresh = useCallback(async () => {
    await hydrateAll();
    dispatch({ type: 'REFRESH' });
  }, []);

  const navigate = useCallback((view: ViewName) => {
    dispatch({ type: 'NAVIGATE', payload: view });
  }, []);

  const createAppointment = useCallback(async (input: CreateAppointmentInput) => {
    const a = await appointmentService.createAppointment(input);
    dispatch({ type: 'REFRESH' });
    return a;
  }, []);

  const cancelAppointment = useCallback(async (id: number, reason: string) => {
    await appointmentService.cancelAppointment(id, reason);
    dispatch({ type: 'REFRESH' });
  }, []);

  const completeAppointment = useCallback(async (id: number) => {
    await appointmentService.completeAppointment(id);
    dispatch({ type: 'REFRESH' });
  }, []);

  const rescheduleAppointment = useCallback(async (id: number, input: RescheduleInput) => {
    const a = await appointmentService.rescheduleAppointment(id, input);
    dispatch({ type: 'REFRESH' });
    return a;
  }, []);

  const createPatient = useCallback(async (input: NewPatientInput) => {
    const p = await patientService.createPatient(input);
    dispatch({ type: 'REFRESH' });
    return p;
  }, []);

  const value: DataContextValue = {
    data: state.data,
    currentView: state.currentView,
    loading,
    navigate,
    refresh,
    createAppointment,
    cancelAppointment,
    completeAppointment,
    rescheduleAppointment,
    createPatient,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
