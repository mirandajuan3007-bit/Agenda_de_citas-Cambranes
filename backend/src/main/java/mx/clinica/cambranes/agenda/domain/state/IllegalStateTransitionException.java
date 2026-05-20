package mx.clinica.cambranes.agenda.domain.state;

public class IllegalStateTransitionException extends RuntimeException {
    public IllegalStateTransitionException(String message) { super(message); }
}
