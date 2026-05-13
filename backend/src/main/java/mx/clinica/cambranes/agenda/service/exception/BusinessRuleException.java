package mx.clinica.cambranes.agenda.service.exception;

import lombok.Getter;
import mx.clinica.cambranes.agenda.domain.validation.ValidationError;

import java.util.List;

@Getter
public class BusinessRuleException extends RuntimeException {
    private final List<ValidationError> errors;

    public BusinessRuleException(List<ValidationError> errors) {
        super("Conflicto al validar la cita.");
        this.errors = errors;
    }
}
