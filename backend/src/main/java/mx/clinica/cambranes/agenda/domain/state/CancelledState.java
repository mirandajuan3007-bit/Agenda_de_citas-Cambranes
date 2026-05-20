package mx.clinica.cambranes.agenda.domain.state;

import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;
import org.springframework.stereotype.Component;

@Component
public class CancelledState extends TerminalState {
    @Override protected String label() { return "cancelada"; }
    @Override public short id() { return AppointmentStatus.CANCELLED; }
}
