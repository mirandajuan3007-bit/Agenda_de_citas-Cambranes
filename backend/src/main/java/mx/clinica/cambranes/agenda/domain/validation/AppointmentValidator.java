package mx.clinica.cambranes.agenda.domain.validation;

import java.util.List;

/**
 * Strategy: cada validador evalua UNA regla de negocio. Todas comparten
 * la misma firma para que el chain las pueda invocar polimorficamente.
 */
public interface AppointmentValidator {
    List<ValidationError> validate(ValidationContext ctx);
}
