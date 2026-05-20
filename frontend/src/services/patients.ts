/**
 * @file services/patients.ts
 * Adaptador async que reenvia las operaciones de paciente al backend.
 */

import type { Patient, NewPatientInput } from '../types';
import { api } from './api';
import { getData, hydrateAll } from '../data/storage';

export async function createPatient(input: NewPatientInput): Promise<Patient> {
  const created = await api.createPatient({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
  });
  await hydrateAll();
  return created;
}

export async function searchPatientsAsync(query: string): Promise<Patient[]> {
  return api.searchPatients(query);
}

/** Busqueda sincrona sobre el cache (suficiente para el autocompletado). */
export function searchPatients(query: string): Patient[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getData()
    .patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.folio.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

export function findPatient(id: number): Patient | undefined {
  return getData().patients.find((p) => p.id === id);
}

export function getAllPatients(): Patient[] {
  return [...getData().patients].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
