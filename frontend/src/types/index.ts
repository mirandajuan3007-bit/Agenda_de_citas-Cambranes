/**
 * @file types/index.ts
 * Contiene todas las interfaces y tipos TypeScript del sistema.
 * Espeja el esquema de base de datos definido en docs/05_final/diseño_base_de_datos.md
 */

// ─── Entidades del dominio ──────────────────────────────────────────────────

/** Personal administrativo con acceso al sistema (secretaria / coordinador). */
export interface User {
  id: number;
  email: string;
  /** Contraseña en texto plano. En producción debe ser hash bcrypt/argon2. */
  password: string;
  fullName: string;
  role: 'secretaria' | 'coordinador';
}

/** Paciente registrado en el sistema. Genera un folio único al crearse. */
export interface Patient {
  id: number;
  /** Identificador legible. Formato: PAC-0001. Generado automáticamente (RF-04). */
  folio: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  createdAt: string;
}

/** Terapeuta disponible para atender citas. Tiene una sala fija asignada. */
export interface Therapist {
  id: number;
  fullName: string;
  specialty: string;
  /** Sala permanentemente asignada. Regla de negocio del sistema. */
  roomId: number;
  active: boolean;
}

/** Consultorio físico donde ocurre la cita. Cada terapeuta tiene uno fijo. */
export interface Room {
  id: number;
  name: string;
  location: string;
}

/**
 * Estado documental de una cita.
 * "Atrasada" NO es un estado — es una condición visual calculada (RF-07).
 */
export interface AppointmentStatus {
  id: StatusId;
  code: 'SCHEDULED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
  description: string;
}

/** Tipo de sesión que clasifica el flujo de negocio de la cita. */
export interface SessionType {
  id: SessionTypeId;
  name: string;
}

/**
 * Entidad central del dominio. Representa una cita agendada.
 * Las citas NUNCA se eliminan físicamente; solo cambian de estado.
 */
export interface Appointment {
  id: number;
  patientId: number;
  therapistId: number;
  roomId: number;
  sessionTypeId: SessionTypeId;
  /** Fecha y hora de inicio en formato "YYYY-MM-DDTHH:mm:ss" (hora LOCAL, sin zona). */
  startAt: string;
  /** Fecha y hora de fin en formato "YYYY-MM-DDTHH:mm:ss" (hora LOCAL, sin zona). */
  endAt: string;
  durationMinutes: number;
  statusId: StatusId;
  createdBy: number;
  createdAt: string;
  updatedAt?: string;
  cancelledReason: string | null;
  cancelledAt: string | null;
  paymentProofPath: string | null;
  cuota: number | null;
  comments: string;
  /** Referencia a la cita original cuando esta es producto de una reprogramación. */
  rescheduledFromId?: number;
}

/** Registro de auditoría de acciones relevantes sobre entidades. */
export interface AuditLog {
  id: number;
  entityType: 'appointment' | 'patient';
  entityId: number;
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'RESCHEDULE';
  payload: Record<string, unknown>;
  performedBy: number;
  performedAt: string;
}

// ─── Tipos auxiliares ───────────────────────────────────────────────────────

/** IDs válidos para el catálogo de estados de cita. */
export type StatusId = 1 | 2 | 3 | 4;

/** IDs válidos para el catálogo de tipos de sesión. */
export type SessionTypeId = 1 | 2;

/** Vistas disponibles en la navegación principal. */
export type ViewName = 'dashboard' | 'agenda' | 'patients';

// ─── Estructura del store (localStorage) ───────────────────────────────────

/**
 * Estructura completa del store persistido en localStorage.
 * Equivale al conjunto de tablas de la base de datos relacional.
 */
export interface AppData {
  users: User[];
  patients: Patient[];
  therapists: Therapist[];
  rooms: Room[];
  appointmentStatuses: AppointmentStatus[];
  sessionTypes: SessionType[];
  appointments: Appointment[];
  auditLogs: AuditLog[];
  /** Secuencia autoincremental para IDs de pacientes. */
  nextPatientId: number;
  /** Secuencia autoincremental para IDs de citas. */
  nextAppointmentId: number;
  nextAuditId: number;
}

// ─── DTOs / Input types ─────────────────────────────────────────────────────

/** Datos requeridos para crear una nueva cita (RF-01). */
export interface CreateAppointmentInput {
  patientId: number;
  therapistId: number;
  roomId: number;
  sessionTypeId: SessionTypeId;
  /** Formato "YYYY-MM-DDTHH:mm:ss" hora local. */
  startAt: string;
  /** Formato "YYYY-MM-DDTHH:mm:ss" hora local. */
  endAt: string;
  durationMinutes: number;
  comments?: string;
  cuota?: number | null;
  paymentProofPath?: string | null;
}

/**
 * Datos para reprogramar una cita (RF-08).
 * Solo se cambia la fecha/hora; terapeuta, sala y duración se heredan del original.
 */
export interface RescheduleInput {
  startAt: string;
}

/** Datos del nuevo paciente (RF-04, RF-05). */
export interface NewPatientInput {
  fullName: string;
  phone: string;
  email?: string;
}

// ─── Tipos de UI ────────────────────────────────────────────────────────────

/** Resultado de la validación de disponibilidad (RF-03). */
export interface ConflictError {
  type: 'therapist' | 'room' | 'patient' | 'working_hours';
  message: string;
}

/** Estado del wizard de nueva cita. */
export interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  sessionTypeId: SessionTypeId | null;
  /** Paciente seleccionado (existente) o null si es nuevo. */
  selectedPatient: Patient | null;
  /** Datos del paciente nuevo (solo cuando sessionTypeId === 1). */
  newPatientInput: NewPatientInput | null;
  schedule: {
    therapistId: number;
    date: string;
    startTime: string;
    durationMinutes: number;
    comments: string;
    cuota: string;
  } | null;
  /** Datos finales después de confirmar (paso 5). */
  result: { appointment: Appointment; patient: Patient } | null;
  /** Fecha/hora pre-cargada al hacer click en el calendario. */
  preDate?: string;
  preTime?: string;
}

/** Mensaje de notificación toast. */
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
