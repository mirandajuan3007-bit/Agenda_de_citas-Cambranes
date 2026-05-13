/**
 * @file data/storage.ts
 * Cache en memoria de la aplicacion.
 *
 * Cuando la API remota existe, hydrateAll() la usa como fuente de verdad.
 * Si la API no esta disponible, el cliente cae en modo demo local y este
 * cache se alimenta desde localStorage usando los datos sembrados.
 */

import type { AppData } from '../types';
import { api } from '../services/api';
import { initLocalData, writeLocalData } from '../services/localApi';

const EMPTY: AppData = {
  users: [],
  patients: [],
  therapists: [],
  rooms: [],
  appointmentStatuses: [],
  sessionTypes: [],
  appointments: [],
  auditLogs: [],
  nextPatientId: 1,
  nextAppointmentId: 1,
  nextAuditId: 1,
};

let cache: AppData = EMPTY;

/** Lectura sincrona del cache. */
export function getData(): AppData { return cache; }

/** Mutacion local (raro; se usa en pruebas y para forzar refresco). */
export function saveData(data: AppData): void {
  cache = data;
  writeLocalData(data);
}

/** Inicializa el cache leyendo el estado actual del backend. */
export async function hydrateAll(): Promise<AppData> {
  const [patients, therapists, rooms, sessionTypes, appointmentStatuses, appointments] =
    await Promise.all([
      api.patients(),
      api.therapists(),
      api.rooms(),
      api.sessionTypes(),
      api.appointmentStatuses(),
      api.appointments(),
    ]);

  cache = {
    ...cache,
    patients,
    therapists,
    rooms,
    sessionTypes,
    appointmentStatuses,
    appointments,
  };
  return cache;
}

/** Inicializa el cache desde el store local del demo. */
export function initStorage(): void {
  cache = initLocalData();
}
