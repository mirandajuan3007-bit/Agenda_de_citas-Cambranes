/**
 * @file services/patients.ts
 * Operaciones sobre la entidad `patients` del store.
 *
 * Implementa RF-04 (generación automática de ID de paciente) y
 * RF-05 (guardar datos del paciente e historial de citas).
 */

import type { Patient, NewPatientInput } from '../types';
import { getData, saveData } from '../data/storage';
import { toLocalISO } from '../utils/helpers';

/**
 * Crea un nuevo paciente y genera su folio único (RF-04).
 *
 * El folio sigue el formato "PAC-XXXX" donde XXXX es el ID con ceros a la izquierda.
 * Simula el comportamiento de una secuencia SERIAL en PostgreSQL.
 *
 * Flujo:
 *   1. Lee el store y obtiene el siguiente ID disponible.
 *   2. Genera el folio "PAC-{id padded to 4 digits}".
 *   3. Construye el objeto Patient.
 *   4. Lo agrega al array `patients` y actualiza `nextPatientId`.
 *   5. Registra en auditLogs.
 *   6. Persiste con saveData().
 *
 * @param input  - Datos básicos del nuevo paciente
 * @param userId - ID del usuario que registra al paciente
 * @returns El paciente creado con folio asignado
 */
export function createPatient(input: NewPatientInput, userId: number): Patient {
  const data = getData();
  const id = data.nextPatientId;
  const folio = `PAC-${String(id).padStart(4, '0')}`;

  const patient: Patient = {
    id,
    folio,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? '',
    birthDate: '',
    createdAt: toLocalISO(new Date()),
  };

  data.patients.push(patient);
  data.auditLogs.push({
    id: data.nextAuditId++,
    entityType: 'patient',
    entityId: id,
    action: 'CREATE',
    payload: { folio, fullName: patient.fullName },
    performedBy: userId,
    performedAt: toLocalISO(new Date()),
  });
  data.nextPatientId++;

  saveData(data);
  return patient;
}

/**
 * Busca pacientes por nombre o folio (búsqueda insensible a mayúsculas).
 * Usado en el wizard de nueva cita para seleccionar paciente existente (RF-01, flow B).
 *
 * @param query - Texto de búsqueda
 * @returns Array de pacientes que coinciden (máximo 8 resultados)
 */
export function searchPatients(query: string): Patient[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getData()
    .patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.folio.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

/**
 * Busca un paciente por ID exacto.
 * @returns El paciente o undefined si no existe
 */
export function findPatient(id: number): Patient | undefined {
  return getData().patients.find((p) => p.id === id);
}

/**
 * Devuelve todos los pacientes ordenados por fecha de creación descendente.
 */
export function getAllPatients(): Patient[] {
  return [...getData().patients].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
