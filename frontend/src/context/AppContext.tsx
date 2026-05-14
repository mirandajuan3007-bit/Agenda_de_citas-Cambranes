/**
 * @file context/AppContext.tsx
 * Adaptador que compone AuthProvider + DataProvider y expone useApp() como
 * facade hacia ambos. El estado real vive en cada contexto especializado
 * (AuthContext = identidad, DataContext = dominio).
 *
 * Esto preserva compatibilidad con los componentes existentes (`useApp`)
 * mientras los nuevos componentes pueden consumir `useAuth` o `useData`
 * directamente si solo necesitan un subset.
 */

import { type ReactNode } from 'react';
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
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );
}

interface AppContextValue {
  data: AppData;
  currentUser: User | null;
  currentView: ViewName;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  navigate: (view: ViewName) => void;
  refresh: () => Promise<void>;
  createAppointment:     (input: CreateAppointmentInput) => Promise<Appointment>;
  cancelAppointment:     (appointmentId: number, reason: string) => Promise<void>;
  completeAppointment:   (appointmentId: number) => Promise<void>;
  rescheduleAppointment: (originalId: number, input: RescheduleInput) => Promise<Appointment>;
  createPatient:         (input: NewPatientInput) => Promise<Patient>;
}

export function useApp(): AppContextValue {
  const auth = useAuth();
  const data = useData();
  return {
    data: data.data,
    currentUser: auth.currentUser,
    currentView: data.currentView,
    loading: data.loading,
    login: auth.login,
    logout: auth.logout,
    navigate: data.navigate,
    refresh: data.refresh,
    createAppointment: data.createAppointment,
    cancelAppointment: data.cancelAppointment,
    completeAppointment: data.completeAppointment,
    rescheduleAppointment: data.rescheduleAppointment,
    createPatient: data.createPatient,
  };
}
