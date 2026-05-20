package mx.clinica.cambranes.agenda.domain.event;

import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.User;

/**
 * Eventos de dominio que disparan los services tras una operacion exitosa.
 * El AuditLogListener (Observer) los recibe y los persiste sin acoplarse
 * a los services.
 */
public sealed interface AppointmentEvent {

    Appointment appointment();
    User performedBy();
    String action();
    String payload();

    record Created(Appointment appointment, User performedBy, String payload) implements AppointmentEvent {
        public String action() { return "CREATE"; }
    }

    record Cancelled(Appointment appointment, User performedBy, String payload) implements AppointmentEvent {
        public String action() { return "CANCEL"; }
    }

    record Rescheduled(Appointment appointment, User performedBy, String payload) implements AppointmentEvent {
        public String action() { return "RESCHEDULE"; }
    }

    record Completed(Appointment appointment, User performedBy, String payload) implements AppointmentEvent {
        public String action() { return "UPDATE"; }
    }
}
