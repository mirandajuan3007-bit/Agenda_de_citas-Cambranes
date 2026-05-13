package mx.clinica.cambranes.agenda.domain.state;

import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;

/**
 * Estado del que no se sale: CANCELLED, RESCHEDULED y COMPLETED.
 * Cualquier intento de transicion lanza excepcion explicita.
 */
public abstract class TerminalState implements AppointmentState {

    protected abstract String label();

    @Override
    public AppointmentStatus cancel(Appointment appt) {
        throw new IllegalStateTransitionException(
                "La cita " + appt.getId() + " esta " + label() + " y no puede cancelarse.");
    }

    @Override
    public AppointmentStatus complete(Appointment appt) {
        throw new IllegalStateTransitionException(
                "La cita " + appt.getId() + " esta " + label() + " y no puede completarse.");
    }

    @Override
    public AppointmentStatus reschedule(Appointment appt) {
        throw new IllegalStateTransitionException(
                "La cita " + appt.getId() + " esta " + label() + " y no puede reprogramarse.");
    }
}
