package mx.clinica.cambranes.agenda.domain.state;

import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;

/**
 * State pattern: cada estado decide que transiciones acepta. Si una cita
 * esta CANCELLED, su estado responde "no puedes cancelar otra vez" sin
 * que el service tenga que conocer toda la tabla de transiciones.
 */
public interface AppointmentState {

    short id();

    /** El estado al que se llega tras cancelar, o lanza si no es valido. */
    AppointmentStatus cancel(Appointment appt);

    /** El estado al que se llega tras completar, o lanza si no es valido. */
    AppointmentStatus complete(Appointment appt);

    /** El estado al que se llega tras reprogramar la cita original, o lanza si no es valido. */
    AppointmentStatus reschedule(Appointment appt);
}
