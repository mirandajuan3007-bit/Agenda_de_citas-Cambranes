import { DEMO_NOW, SEED_DATA } from '../data/seed';
import type {
  AppData,
  Appointment,
  AppointmentStatus,
  AuditLog,
  ConflictError,
  Patient,
  Room,
  SessionType,
  Therapist,
  User,
} from '../types';
import { addMinutes, formatTime, WORK_END_MIN, WORK_START_MIN } from '../utils/helpers';

const DATA_KEY = 'agenda-demo-data';
const USER_KEY = 'currentUser';

type CreateAppointmentPayload = {
  patientId: number;
  therapistId: number;
  roomId: number;
  sessionTypeId: 1 | 2;
  startAt: string;
  durationMinutes: number;
  comments?: string;
  cuota?: number | null;
  paymentProofPath?: string | null;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seedData(): AppData {
  return clone(SEED_DATA);
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<AppData>;
  return Array.isArray(data.users)
    && Array.isArray(data.patients)
    && Array.isArray(data.therapists)
    && Array.isArray(data.rooms)
    && Array.isArray(data.appointmentStatuses)
    && Array.isArray(data.sessionTypes)
    && Array.isArray(data.appointments)
    && Array.isArray(data.auditLogs)
    && typeof data.nextPatientId === 'number'
    && typeof data.nextAppointmentId === 'number'
    && typeof data.nextAuditId === 'number';
}

function createError(message: string, status = 400, details: ConflictError[] = []): Error & { status: number; details: ConflictError[] } {
  const error = new Error(message) as Error & { status: number; details: ConflictError[] };
  error.status = status;
  error.details = details;
  return error;
}

export function readLocalData(): AppData {
  if (typeof localStorage === 'undefined') return seedData();
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) return seedData();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isAppData(parsed) ? parsed : seedData();
  } catch {
    return seedData();
  }
}

export function writeLocalData(data: AppData): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function initLocalData(): AppData {
  const data = readLocalData();
  writeLocalData(data);
  return data;
}

function currentUserId(): number {
  if (typeof localStorage === 'undefined') return 1;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return 1;
  try {
    const user = JSON.parse(raw) as { id?: number };
    return typeof user.id === 'number' ? user.id : 1;
  } catch {
    return 1;
  }
}

function dedupeConflicts(conflicts: ConflictError[]): ConflictError[] {
  return conflicts.filter((conflict, index) => conflicts.findIndex((item) => item.message === conflict.message) === index);
}

function validateWorkingWindow(startAt: string, endAt: string): ConflictError[] {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [{ type: 'working_hours', message: 'La fecha de la cita es invalida.' }];
  }

  const day = start.getDay();
  if (day === 0 || day === 6) {
    return [{ type: 'working_hours', message: 'Las citas solo pueden agendarse de lunes a viernes.' }];
  }

  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  if (startMin < WORK_START_MIN) {
    return [{ type: 'working_hours', message: 'La cita no puede iniciar antes de las 09:00.' }];
  }
  if (endMin > WORK_END_MIN) {
    return [{ type: 'working_hours', message: 'La cita no puede terminar despues de las 17:30.' }];
  }
  if (startMin >= endMin) {
    return [{ type: 'working_hours', message: 'La hora de inicio debe ser menor que la hora de finalizacion.' }];
  }
  return [];
}

function validateAvailability(
  data: AppData,
  startAt: string,
  endAt: string,
  therapistId: number,
  roomId: number,
  patientId: number | null,
  excludeAppointmentId: number | null = null
): ConflictError[] {
  const newStart = new Date(startAt);
  const newEnd = new Date(endAt);
  const conflicts: ConflictError[] = [];

  for (const appointment of data.appointments) {
    if (excludeAppointmentId !== null && appointment.id === excludeAppointmentId) continue;
    if (appointment.statusId === 2 || appointment.statusId === 3) continue;

    const existingStart = new Date(appointment.startAt);
    const existingEnd = new Date(appointment.endAt);
    const overlaps = newStart < existingEnd && existingStart < newEnd;
    if (!overlaps) continue;

    if (appointment.therapistId === therapistId) {
      conflicts.push({
        type: 'therapist',
        message: `El terapeuta ya tiene una cita de ${formatTime(appointment.startAt)} a ${formatTime(appointment.endAt)}.`,
      });
    }
    if (appointment.roomId === roomId) {
      conflicts.push({
        type: 'room',
        message: `La sala ya esta ocupada de ${formatTime(appointment.startAt)} a ${formatTime(appointment.endAt)}.`,
      });
    }
    if (patientId !== null && appointment.patientId === patientId) {
      conflicts.push({
        type: 'patient',
        message: `El paciente ya tiene una cita de ${formatTime(appointment.startAt)} a ${formatTime(appointment.endAt)}.`,
      });
    }
  }

  return dedupeConflicts(conflicts);
}

function countScheduledAppointments(data: AppData, patientId: number, excludeAppointmentId: number | null = null): number {
  return data.appointments.filter((appointment) => {
    if (excludeAppointmentId !== null && appointment.id === excludeAppointmentId) return false;
    return appointment.patientId === patientId && appointment.statusId === 1;
  }).length;
}

function validationErrors(
  data: AppData,
  startAt: string,
  endAt: string,
  therapistId: number,
  roomId: number,
  patientId: number | null,
  excludeAppointmentId: number | null = null
): ConflictError[] {
  const conflicts = [
    ...validateWorkingWindow(startAt, endAt),
    ...validateAvailability(data, startAt, endAt, therapistId, roomId, patientId, excludeAppointmentId),
  ];

  if (patientId !== null && countScheduledAppointments(data, patientId, excludeAppointmentId) >= 3) {
    conflicts.push({
      type: 'patient',
      message: 'El paciente ya tiene 3 citas programadas. Cancele o complete una antes de agendar otra.',
    });
  }

  return dedupeConflicts(conflicts);
}

function buildAudit(data: AppData, input: Omit<AuditLog, 'id' | 'performedAt' | 'performedBy'>): void {
  data.auditLogs.push({
    id: data.nextAuditId,
    performedAt: DEMO_NOW,
    performedBy: currentUserId(),
    ...input,
  });
  data.nextAuditId += 1;
}

function findAppointmentOrThrow(data: AppData, id: number): Appointment {
  const appointment = data.appointments.find((item) => item.id === id);
  if (!appointment) throw createError('Cita no encontrada.', 404);
  return appointment;
}

function findPatientOrThrow(data: AppData, id: number): Patient {
  const patient = data.patients.find((item) => item.id === id);
  if (!patient) throw createError('Paciente no encontrado.', 404);
  return patient;
}

function findTherapistOrThrow(data: AppData, id: number): Therapist {
  const therapist = data.therapists.find((item) => item.id === id);
  if (!therapist) throw createError('Terapeuta no encontrado.', 404);
  return therapist;
}

function findRoomOrThrow(data: AppData, id: number): Room {
  const room = data.rooms.find((item) => item.id === id);
  if (!room) throw createError('Sala no encontrada.', 404);
  return room;
}

function findSessionTypeOrThrow(data: AppData, id: number): SessionType {
  const sessionType = data.sessionTypes.find((item) => item.id === id);
  if (!sessionType) throw createError('Tipo de sesion no encontrado.', 404);
  return sessionType;
}

function patientFolio(nextPatientId: number): string {
  return `PAC-${String(nextPatientId).padStart(4, '0')}`;
}

function scheduledAppointment(payload: CreateAppointmentPayload, appointmentId: number): Appointment {
  return {
    id: appointmentId,
    patientId: payload.patientId,
    therapistId: payload.therapistId,
    roomId: payload.roomId,
    sessionTypeId: payload.sessionTypeId,
    startAt: payload.startAt,
    endAt: addMinutes(payload.startAt, payload.durationMinutes),
    durationMinutes: payload.durationMinutes,
    statusId: 1,
    createdBy: currentUserId(),
    createdAt: DEMO_NOW,
    cancelledReason: null,
    cancelledAt: null,
    paymentProofPath: payload.paymentProofPath ?? null,
    cuota: payload.cuota ?? null,
    comments: payload.comments ?? '',
  };
}

export const localApi = {
  async login(email: string, password: string): Promise<User> {
    const data = readLocalData();
    const user = data.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      throw createError('Credenciales incorrectas.', 401);
    }
    return { ...clone(user), password: '' };
  },

  async patients(): Promise<Patient[]> {
    return clone(readLocalData().patients);
  },

  async searchPatients(query: string): Promise<Patient[]> {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return clone(
      readLocalData().patients.filter((patient) => (
        patient.fullName.toLowerCase().includes(q) || patient.folio.toLowerCase().includes(q)
      ))
    );
  },

  async createPatient(input: { fullName: string; phone: string; email?: string }): Promise<Patient> {
    const data = readLocalData();
    const patient: Patient = {
      id: data.nextPatientId,
      folio: patientFolio(data.nextPatientId),
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() ?? '',
      birthDate: '',
      createdAt: DEMO_NOW,
    };
    data.patients.push(patient);
    data.nextPatientId += 1;
    buildAudit(data, {
      entityType: 'patient',
      entityId: patient.id,
      action: 'CREATE',
      payload: { fullName: patient.fullName, folio: patient.folio },
    });
    writeLocalData(data);
    return clone(patient);
  },

  async appointments(): Promise<Appointment[]> {
    return clone(readLocalData().appointments);
  },

  async checkAppointment(payload: CreateAppointmentPayload, excludeId?: number): Promise<ConflictError[]> {
    const data = readLocalData();
    const endAt = addMinutes(payload.startAt, payload.durationMinutes);
    return validationErrors(
      data,
      payload.startAt,
      endAt,
      payload.therapistId,
      payload.roomId,
      payload.patientId,
      excludeId ?? null
    );
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const data = readLocalData();
    findPatientOrThrow(data, payload.patientId);
    const therapist = findTherapistOrThrow(data, payload.therapistId);
    findRoomOrThrow(data, payload.roomId);
    findSessionTypeOrThrow(data, payload.sessionTypeId);
    if (therapist.roomId !== payload.roomId) {
      throw createError('La sala seleccionada no corresponde al terapeuta.', 409);
    }

    const nextAppointment = scheduledAppointment(payload, data.nextAppointmentId);
    const conflicts = validationErrors(
      data,
      nextAppointment.startAt,
      nextAppointment.endAt,
      nextAppointment.therapistId,
      nextAppointment.roomId,
      nextAppointment.patientId
    );
    if (conflicts.length > 0) {
      throw createError(conflicts[0].message, 409, conflicts);
    }

    data.appointments.push(nextAppointment);
    data.nextAppointmentId += 1;
    buildAudit(data, {
      entityType: 'appointment',
      entityId: nextAppointment.id,
      action: 'CREATE',
      payload: { patientId: nextAppointment.patientId, startAt: nextAppointment.startAt },
    });
    writeLocalData(data);
    return clone(nextAppointment);
  },

  async cancelAppointment(id: number, reason: string): Promise<void> {
    const data = readLocalData();
    const appointment = findAppointmentOrThrow(data, id);
    if (appointment.statusId !== 1) {
      throw createError('Solo se pueden cancelar citas programadas.', 409);
    }
    if (new Date(appointment.startAt) <= new Date(DEMO_NOW)) {
      throw createError('No se puede cancelar una cita que ya inicio o que ya paso.', 409);
    }
    appointment.statusId = 2;
    appointment.cancelledReason = reason;
    appointment.cancelledAt = DEMO_NOW;
    appointment.updatedAt = DEMO_NOW;
    buildAudit(data, {
      entityType: 'appointment',
      entityId: appointment.id,
      action: 'CANCEL',
      payload: { reason },
    });
    writeLocalData(data);
  },

  async completeAppointment(id: number): Promise<void> {
    const data = readLocalData();
    const appointment = findAppointmentOrThrow(data, id);
    if (appointment.statusId !== 1) {
      throw createError('Solo se pueden finalizar citas programadas.', 409);
    }
    if (new Date(appointment.startAt) > new Date(DEMO_NOW)) {
      throw createError('Solo se pueden finalizar citas que ya iniciaron.', 409);
    }
    appointment.statusId = 4;
    appointment.updatedAt = DEMO_NOW;
    buildAudit(data, {
      entityType: 'appointment',
      entityId: appointment.id,
      action: 'UPDATE',
      payload: { statusId: 4 },
    });
    writeLocalData(data);
  },

  async rescheduleAppointment(id: number, startAt: string): Promise<Appointment> {
    const data = readLocalData();
    const original = findAppointmentOrThrow(data, id);
    if (original.statusId !== 1) {
      throw createError('Solo se pueden reagendar citas programadas.', 409);
    }

    const nextStartAt = startAt;
    const nextEndAt = addMinutes(nextStartAt, original.durationMinutes);
    const conflicts = validationErrors(
      data,
      nextStartAt,
      nextEndAt,
      original.therapistId,
      original.roomId,
      original.patientId,
      original.id
    );
    if (conflicts.length > 0) {
      throw createError(conflicts[0].message, 409, conflicts);
    }

    const appointment: Appointment = {
      ...clone(original),
      id: data.nextAppointmentId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      statusId: 1,
      createdBy: currentUserId(),
      createdAt: DEMO_NOW,
      updatedAt: undefined,
      cancelledReason: null,
      cancelledAt: null,
      rescheduledFromId: original.id,
    };

    original.statusId = 3;
    original.updatedAt = DEMO_NOW;
    data.appointments.push(appointment);
    data.nextAppointmentId += 1;

    buildAudit(data, {
      entityType: 'appointment',
      entityId: original.id,
      action: 'RESCHEDULE',
      payload: { newAppointmentId: appointment.id },
    });
    buildAudit(data, {
      entityType: 'appointment',
      entityId: appointment.id,
      action: 'CREATE',
      payload: { rescheduledFromId: original.id },
    });

    writeLocalData(data);
    return clone(appointment);
  },

  async therapists(): Promise<Therapist[]> {
    return clone(readLocalData().therapists);
  },

  async rooms(): Promise<Room[]> {
    return clone(readLocalData().rooms);
  },

  async sessionTypes(): Promise<SessionType[]> {
    return clone(readLocalData().sessionTypes);
  },

  async appointmentStatuses(): Promise<AppointmentStatus[]> {
    return clone(readLocalData().appointmentStatuses);
  },
};