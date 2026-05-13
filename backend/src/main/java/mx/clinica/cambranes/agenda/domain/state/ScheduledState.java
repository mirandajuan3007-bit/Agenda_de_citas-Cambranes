package mx.clinica.cambranes.agenda.domain.state;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentStatusRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledState implements AppointmentState {

    private final AppointmentStatusRepository statusRepository;

    @Override public short id() { return AppointmentStatus.SCHEDULED; }

    @Override
    public AppointmentStatus cancel(Appointment appt) {
        return statusRepository.getReferenceById(AppointmentStatus.CANCELLED);
    }

    @Override
    public AppointmentStatus complete(Appointment appt) {
        return statusRepository.getReferenceById(AppointmentStatus.COMPLETED);
    }

    @Override
    public AppointmentStatus reschedule(Appointment appt) {
        return statusRepository.getReferenceById(AppointmentStatus.RESCHEDULED);
    }
}
