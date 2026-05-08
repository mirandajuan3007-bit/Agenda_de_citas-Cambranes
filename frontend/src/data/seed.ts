/**
 * @file data/seed.ts
 * Datos iniciales del sistema. Se cargan en localStorage la primera vez que
 * la aplicación se abre, simulando el estado inicial de la base de datos.
 *
 * Corresponde a: semana del 27 de abril de 2026 (lunes).
 * Fecha simulada del sistema: 2026-04-27 — hora simulada: 10:45 AM.
 */

import type { AppData } from '../types';

/** Fecha "hoy" usada en toda la app para demo. Cambiar aquí si se necesita probar otra fecha. */
export const DEMO_TODAY = '2026-04-27';

/** Hora simulada del sistema (para calcular citas "atrasadas" en el demo). */
export const DEMO_NOW = `${DEMO_TODAY}T10:45:00`;

export const SEED_DATA: AppData = {
  // ─── Usuarios del sistema ──────────────────────────────────────────────
  users: [
    {
      id: 1,
      email: 'secretaria@clinica.mx',
      password: 'secretaria123',
      fullName: 'María García López',
      role: 'secretaria',
    },
    {
      id: 2,
      email: 'coordinador@clinica.mx',
      password: 'coordinador123',
      fullName: 'Dr. Roberto Méndez',
      role: 'coordinador',
    },
  ],

  // ─── Pacientes ─────────────────────────────────────────────────────────
  patients: [
    { id: 1, folio: 'PAC-0001', fullName: 'Ana Torres Ramos',      phone: '555-123-4567', email: 'ana.torres@email.com',  birthDate: '1990-03-15', createdAt: '2026-01-10T10:00:00' },
    { id: 2, folio: 'PAC-0002', fullName: 'Carlos Ruiz Mendoza',   phone: '555-234-5678', email: 'carlos.ruiz@email.com', birthDate: '1985-07-22', createdAt: '2026-02-05T10:00:00' },
    { id: 3, folio: 'PAC-0003', fullName: 'Elena Vázquez Cruz',    phone: '555-345-6789', email: 'elena.v@email.com',     birthDate: '1995-11-08', createdAt: '2026-03-12T10:00:00' },
    { id: 4, folio: 'PAC-0004', fullName: 'Miguel Herrera Santos', phone: '555-456-7890', email: 'miguel.h@email.com',    birthDate: '1978-05-30', createdAt: '2026-04-01T10:00:00' },
    { id: 5, folio: 'PAC-0005', fullName: 'Lucía Morales Fuentes', phone: '555-567-8901', email: 'lucia.m@email.com',     birthDate: '2000-09-14', createdAt: '2026-04-10T10:00:00' },
  ],

  // ─── Terapeutas (3 fijos, cada uno con sala asignada) ──────────────────
  therapists: [
    { id: 1, fullName: 'Dra. Laura Sánchez Pérez',     specialty: 'Psicología clínica',          roomId: 1, active: true },
    { id: 2, fullName: 'Psic. Jorge Flores Gutiérrez', specialty: 'Terapia cognitivo-conductual', roomId: 2, active: true },
    { id: 3, fullName: 'Dra. Patricia Mora Delgado',   specialty: 'Terapia familiar sistémica',  roomId: 3, active: true },
  ],

  // ─── Salas (3 consultorios, uno por terapeuta) ─────────────────────────
  rooms: [
    { id: 1, name: 'Sala 1', location: 'Planta baja · Ala norte' },
    { id: 2, name: 'Sala 2', location: 'Planta baja · Ala sur' },
    { id: 3, name: 'Sala 3', location: 'Primer piso' },
  ],

  // ─── Catálogos ─────────────────────────────────────────────────────────
  appointmentStatuses: [
    { id: 1, code: 'SCHEDULED',   description: 'Programada' },
    { id: 2, code: 'CANCELLED',   description: 'Cancelada' },
    { id: 3, code: 'RESCHEDULED', description: 'Reprogramada' },
    { id: 4, code: 'COMPLETED',   description: 'Finalizada' },
  ],

  sessionTypes: [
    { id: 1, name: 'Evaluación inicial' },
    { id: 2, name: 'Sesión terapéutica' },
  ],

  // ─── Citas de la semana del 27 abr — 1 may 2026 ───────────────────────
  // Lunes 27 (hoy): id 1-5
  // Martes 28: id 6, 7, 14
  // Miércoles 29: id 8, 9, 15
  // Jueves 30: id 10, 11, 16
  // Viernes 1 may: id 12, 13
  appointments: [
    // ── Lunes 27 ───────────────────────────────────────────────────────
    // Cita id:1 — 9:00-10:00 — COMPLETADA (antes de la hora simulada 10:45)
    { id: 1,  patientId: 1, therapistId: 1, roomId: 1, sessionTypeId: 2, startAt: '2026-04-27T09:00:00', endAt: '2026-04-27T10:00:00', durationMinutes: 60, statusId: 4, createdBy: 1, createdAt: '2026-04-20T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: 'Seguimiento de ansiedad' },
    // Cita id:2 — 9:30-10:30 — SCHEDULED pero inicio ya pasó → ATRASADA (RF-07)
    { id: 2,  patientId: 2, therapistId: 2, roomId: 2, sessionTypeId: 2, startAt: '2026-04-27T09:30:00', endAt: '2026-04-27T10:30:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-20T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    // Cita id:3 — 9:00-9:45 — COMPLETADA
    { id: 3,  patientId: 3, therapistId: 3, roomId: 3, sessionTypeId: 1, startAt: '2026-04-27T09:00:00', endAt: '2026-04-27T09:45:00', durationMinutes: 45, statusId: 4, createdBy: 1, createdAt: '2026-04-20T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: null, comments: 'Primera consulta' },
    // Cita id:4 — 11:00-12:00 — Futura (aún no atrasada)
    { id: 4,  patientId: 4, therapistId: 1, roomId: 1, sessionTypeId: 2, startAt: '2026-04-27T11:00:00', endAt: '2026-04-27T12:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-21T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    // Cita id:5 — 14:00-15:30 — Futura
    { id: 5,  patientId: 5, therapistId: 2, roomId: 2, sessionTypeId: 1, startAt: '2026-04-27T14:00:00', endAt: '2026-04-27T15:30:00', durationMinutes: 90, statusId: 1, createdBy: 1, createdAt: '2026-04-22T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: null, comments: 'Paciente nueva, evaluación completa' },

    // ── Martes 28 ──────────────────────────────────────────────────────
    { id: 6,  patientId: 1, therapistId: 1, roomId: 1, sessionTypeId: 2, startAt: '2026-04-28T10:00:00', endAt: '2026-04-28T11:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-21T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    { id: 7,  patientId: 3, therapistId: 3, roomId: 3, sessionTypeId: 2, startAt: '2026-04-28T15:00:00', endAt: '2026-04-28T16:30:00', durationMinutes: 90, statusId: 1, createdBy: 1, createdAt: '2026-04-21T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    { id: 14, patientId: 2, therapistId: 2, roomId: 2, sessionTypeId: 2, startAt: '2026-04-28T09:00:00', endAt: '2026-04-28T10:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-22T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: 'Seguimiento TCC' },

    // ── Miércoles 29 ───────────────────────────────────────────────────
    // id:8 — CANCELADA (para mostrar ejemplo de cancelación)
    { id: 8,  patientId: 2, therapistId: 1, roomId: 1, sessionTypeId: 2, startAt: '2026-04-29T09:30:00', endAt: '2026-04-29T10:30:00', durationMinutes: 60, statusId: 2, createdBy: 1, createdAt: '2026-04-22T10:00:00', cancelledReason: 'Paciente solicitó cancelación por emergencia personal', cancelledAt: '2026-04-27T08:00:00', paymentProofPath: null, cuota: 500, comments: '' },
    { id: 9,  patientId: 5, therapistId: 3, roomId: 3, sessionTypeId: 2, startAt: '2026-04-29T11:00:00', endAt: '2026-04-29T12:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-22T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    { id: 15, patientId: 4, therapistId: 2, roomId: 2, sessionTypeId: 2, startAt: '2026-04-29T14:00:00', endAt: '2026-04-29T15:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-22T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },

    // ── Jueves 30 ──────────────────────────────────────────────────────
    { id: 10, patientId: 4, therapistId: 2, roomId: 2, sessionTypeId: 2, startAt: '2026-04-30T10:00:00', endAt: '2026-04-30T11:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-23T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    { id: 11, patientId: 1, therapistId: 3, roomId: 3, sessionTypeId: 2, startAt: '2026-04-30T14:00:00', endAt: '2026-04-30T15:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-23T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: 'Sesión familiar incluida' },
    { id: 16, patientId: 3, therapistId: 1, roomId: 1, sessionTypeId: 2, startAt: '2026-04-30T09:00:00', endAt: '2026-04-30T10:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-24T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },

    // ── Viernes 1 mayo ─────────────────────────────────────────────────
    { id: 12, patientId: 2, therapistId: 1, roomId: 1, sessionTypeId: 2, startAt: '2026-05-01T09:00:00', endAt: '2026-05-01T10:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-24T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
    { id: 13, patientId: 3, therapistId: 2, roomId: 2, sessionTypeId: 2, startAt: '2026-05-01T11:00:00', endAt: '2026-05-01T12:00:00', durationMinutes: 60, statusId: 1, createdBy: 1, createdAt: '2026-04-24T10:00:00', cancelledReason: null, cancelledAt: null, paymentProofPath: null, cuota: 500, comments: '' },
  ],

  auditLogs: [
    { id: 1, entityType: 'appointment', entityId: 8, action: 'CANCEL', payload: { reason: 'Emergencia personal' }, performedBy: 1, performedAt: '2026-04-27T08:00:00' },
  ],

  nextPatientId: 6,
  nextAppointmentId: 17,
  nextAuditId: 2,
};
