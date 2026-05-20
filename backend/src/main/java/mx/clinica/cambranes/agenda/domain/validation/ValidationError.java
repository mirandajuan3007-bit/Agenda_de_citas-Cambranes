package mx.clinica.cambranes.agenda.domain.validation;

public record ValidationError(String type, String message) {
    public static ValidationError of(String type, String message) {
        return new ValidationError(type, message);
    }
}
