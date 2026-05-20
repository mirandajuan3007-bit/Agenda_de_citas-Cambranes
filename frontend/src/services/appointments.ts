/**
 * @file services/appointments.ts
 * Adaptador async que reenvia las operaciones de cita al backend Spring Boot.
 * Tras cada mutacion exitosa refresca el cache local para que las lecturas
 * sincronas en pantalla queden al dia.
 */

import type { Appointment, CreateAppointmentInput, RescheduleInput } from '../types';
import { api } from './api';
import { getData, hydrateAll } from '../data/storage';

function toPayload(input: CreateAppointmentInput) {
  return {
    patientId: input.patientId,
    therapistId: input.therapistId,
    roomId: input.roomId,
    sessionTypeId: input.sessionTypeId,
    startAt: input.startAt,
    durationMinutes: input.durationMinutes,
    comments: input.comments ?? '',
    cuota: input.cuota ?? null,
    paymentProofPath: input.paymentProofPath ?? null,
  };
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const created = await api.createAppointment(toPayload(input));
  await hydrateAll();
  return created;
}

export async function cancelAppointment(appointmentId: number, reason: string): Promise<void> {
  await api.cancelAppointment(appointmentId, reason);
  await hydrateAll();
}

export async function rescheduleAppointment(
  originalId: number,
  input: RescheduleInput
): Promise<Appointment> {
  const next = await api.rescheduleAppointment(originalId, input.startAt);
  await hydrateAll();
  return next;
}

export async function completeAppointment(appointmentId: number): Promise<void> {
  await api.completeAppointment(appointmentId);
  await hydrateAll();
}

// ── Lecturas sincronas (sobre el cache) ─────────────────────────────────────

export function findAppointment(id: number): Appointment | undefined {
  return getData().appointments.find((a) => a.id === id);
}

export function getAppointmentsByDate(dateStr: string): Appointment[] {
  return getData()
    .appointments.filter((a) => a.startAt.startsWith(dateStr))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function getAppointmentsByPatient(patientId: number): Appointment[] {
  return getData()
    .appointments.filter((a) => a.patientId === patientId)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
}
