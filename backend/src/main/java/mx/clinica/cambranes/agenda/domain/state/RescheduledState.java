package mx.clinica.cambranes.agenda.domain.state;

import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;
import org.springframework.stereotype.Component;

@Component
public class RescheduledState extends TerminalState {
    @Override protected String label() { return "reprogramada"; }
    @Override public short id() { return AppointmentStatus.RESCHEDULED; }
}
