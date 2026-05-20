/**
 * @file services/api.ts
 * Cliente HTTP para hablar con el backend Spring Boot.
 * Si la API no esta disponible, el frontend entra en modo demo local
 * usando los datos sembrados del prototipo.
 */

import type { Appointment, AppointmentStatus, ConflictError, Patient, Room, SessionType, Therapist, User } from '../types';
import { localApi } from './localApi';

const BASE: string = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';
const TOKEN_KEY = 'authToken';
let connectionMode: 'unknown' | 'remote' | 'local' = 'unknown';

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (token) return { Authorization: `Bearer ${token}` };

  // Fallback de transicion: mientras el frontend antiguo este en uso,
  // el backend acepta X-User-Id ademas del token.
  const raw = localStorage.getItem('currentUser');
  if (!raw) return {};
  try {
    const u = JSON.parse(raw) as { id: number };
    return { 'X-User-Id': String(u.id) };
  } catch { return {}; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';
    let body: any = null;
    let bodyText = '';
    if (contentType.includes('application/json')) {
      try { body = await res.json(); } catch { /* ignore */ }
    } else {
      try { bodyText = await res.text(); } catch { /* ignore */ }
    }
    const msg = body?.message || bodyText || `Error ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.details = body?.details ?? [];
    err.contentType = contentType;
    err.isApiError = body != null;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function shouldUseLocalFallback(err: any): boolean {
  if (err?.status == null) return true;
  if (err.status >= 500) return true;
  return err.status === 404 && err.isApiError !== true;
}

async function withFallback<T>(remote: () => Promise<T>, local: () => Promise<T>): Promise<T> {
  if (connectionMode === 'local') {
    return local();
  }

  try {
    const result = await remote();
    connectionMode = 'remote';
    return result;
  } catch (err) {
    if (!shouldUseLocalFallback(err)) throw err;
    // eslint-disable-next-line no-console
    console.warn('[api] backend no disponible, usando modo demo local');
    connectionMode = 'local';
    return local();
  }
}

// ── DTOs (espejo del backend) ──────────────────────────────────────────────

interface AppointmentDto {
  id: number; patientId: number; therapistId: number; roomId: number;
  sessionTypeId: 1 | 2; startAt: string; endAt: string; durationMinutes: number;
  statusId: 1 | 2 | 3 | 4; statusCode: string; createdBy: number;
  createdAt: string; updatedAt: string | null;
  cancelledReason: string | null; cancelledAt: string | null;
  paymentProofPath: string | null; cuota: number | null; comments: string;
  rescheduledFromId: number | null;
}

interface PatientDto {
  id: number; folio: string; fullName: string;
  phone: string | null; email: string | null;
  birthDate: string | null; createdAt: string;
}

// ── Conversores DTO → tipo del frontend ────────────────────────────────────

function toPatient(p: PatientDto): Patient {
  return {
    id: p.id, folio: p.folio, fullName: p.fullName,
    phone: p.phone ?? '', email: p.email ?? '',
    birthDate: p.birthDate ?? '',
    createdAt: p.createdAt,
  };
}

function toAppointment(a: AppointmentDto): Appointment {
  return {
    id: a.id, patientId: a.patientId, therapistId: a.therapistId, roomId: a.roomId,
    sessionTypeId: a.sessionTypeId, startAt: a.startAt, endAt: a.endAt,
    durationMinutes: a.durationMinutes, statusId: a.statusId,
    createdBy: a.createdBy, createdAt: a.createdAt, updatedAt: a.updatedAt ?? undefined,
    cancelledReason: a.cancelledReason, cancelledAt: a.cancelledAt,
    paymentProofPath: a.paymentProofPath, cuota: a.cuota, comments: a.comments ?? '',
    rescheduledFromId: a.rescheduledFromId ?? undefined,
  };
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  async login(email: string, password: string): Promise<User> {
    return withFallback(
      async () => {
        // Limpiamos cualquier token previo para que la peticion no envie
        // un Authorization invalido (los filtros lo rechazarian).
        setAuthToken(null);
        const resp = await request<{
          token: string;
          expiresInMinutes: number;
          user: { id: number; email: string; fullName: string; role: string };
        }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

        setAuthToken(resp.token);
        const u = resp.user;
        return { id: u.id, email: u.email, password: '', fullName: u.fullName, role: u.role as any };
      },
      () => localApi.login(email, password)
    );
  },

  async patients(): Promise<Patient[]> {
    return withFallback(
      async () => {
        const list = await request<PatientDto[]>('/patients');
        return list.map(toPatient);
      },
      () => localApi.patients()
    );
  },

  async searchPatients(q: string): Promise<Patient[]> {
    if (!q.trim()) return [];
    return withFallback(
      async () => {
        const list = await request<PatientDto[]>(`/patients/search?q=${encodeURIComponent(q)}`);
        return list.map(toPatient);
      },
      () => localApi.searchPatients(q)
    );
  },

  async createPatient(input: { fullName: string; phone: string; email?: string }): Promise<Patient> {
    return withFallback(
      async () => {
        const dto = await request<PatientDto>('/patients', {
          method: 'POST', body: JSON.stringify(input),
        });
        return toPatient(dto);
      },
      () => localApi.createPatient(input)
    );
  },

  async appointments(): Promise<Appointment[]> {
    return withFallback(
      async () => {
        const list = await request<AppointmentDto[]>('/appointments');
        return list.map(toAppointment);
      },
      () => localApi.appointments()
    );
  },

  async checkAppointment(payload: any, excludeId?: number): Promise<ConflictError[]> {
    return withFallback(
      async () => {
        const q = excludeId != null ? `?excludeId=${excludeId}` : '';
        const list = await request<{ type: string; message: string }[]>(`/appointments/check${q}`, {
          method: 'POST', body: JSON.stringify(payload),
        });
        return list.map((c) => ({ type: c.type as any, message: c.message }));
      },
      () => localApi.checkAppointment(payload, excludeId)
    );
  },

  async createAppointment(payload: any): Promise<Appointment> {
    return withFallback(
      async () => {
        const dto = await request<AppointmentDto>('/appointments', {
          method: 'POST', body: JSON.stringify(payload),
        });
        return toAppointment(dto);
      },
      () => localApi.createAppointment(payload)
    );
  },

  async cancelAppointment(id: number, reason: string): Promise<void> {
    return withFallback(
      async () => {
        await request<void>(`/appointments/${id}/cancel`, {
          method: 'POST', body: JSON.stringify({ reason }),
        });
      },
      () => localApi.cancelAppointment(id, reason)
    );
  },

  async completeAppointment(id: number): Promise<void> {
    return withFallback(
      async () => {
        await request<void>(`/appointments/${id}/complete`, { method: 'POST' });
      },
      () => localApi.completeAppointment(id)
    );
  },

  async rescheduleAppointment(id: number, startAt: string): Promise<Appointment> {
    return withFallback(
      async () => {
        const dto = await request<AppointmentDto>(`/appointments/${id}/reschedule`, {
          method: 'POST', body: JSON.stringify({ startAt }),
        });
        return toAppointment(dto);
      },
      () => localApi.rescheduleAppointment(id, startAt)
    );
  },

  async therapists(): Promise<Therapist[]> {
    return withFallback(
      async () => {
        const list = await request<{ id: number; fullName: string; specialty: string; roomId: number; active: boolean }[]>('/therapists');
        return list.map((t) => ({ id: t.id, fullName: t.fullName, specialty: t.specialty, roomId: t.roomId, active: t.active }));
      },
      () => localApi.therapists()
    );
  },

  async rooms(): Promise<Room[]> {
    return withFallback(
      async () => {
        const list = await request<{ id: number; name: string; location: string }[]>('/rooms');
        return list.map((r) => ({ id: r.id, name: r.name, location: r.location ?? '' }));
      },
      () => localApi.rooms()
    );
  },

  async sessionTypes(): Promise<SessionType[]> {
    return withFallback(
      async () => {
        const list = await request<{ id: 1 | 2; name: string }[]>('/session-types');
        return list.map((s) => ({ id: s.id, name: s.name }));
      },
      () => localApi.sessionTypes()
    );
  },

  async appointmentStatuses(): Promise<AppointmentStatus[]> {
    return withFallback(
      async () => {
        const list = await request<{ id: 1 | 2 | 3 | 4; code: any; description: string }[]>('/appointment-statuses');
        return list.map((s) => ({ id: s.id, code: s.code, description: s.description }));
      },
      () => localApi.appointmentStatuses()
    );
  },
};
