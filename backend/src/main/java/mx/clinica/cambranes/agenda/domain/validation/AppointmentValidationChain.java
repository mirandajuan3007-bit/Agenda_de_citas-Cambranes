package mx.clinica.cambranes.agenda.domain.validation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Chain of Responsibility: ejecuta los validadores en orden y acumula
 * todos los errores. Spring inyecta la lista respetando @Order, asi que
 * agregar una regla nueva es solo crear un nuevo @Component que implemente
 * AppointmentValidator — el chain lo recoge solo.
 */
@Component
@RequiredArgsConstructor
public class AppointmentValidationChain {

    private final List<AppointmentValidator> validators;

    public List<ValidationError> run(ValidationContext ctx) {
        List<ValidationError> all = new ArrayList<>();
        for (AppointmentValidator v : validators) {
            all.addAll(v.validate(ctx));
        }
        return all;
    }
}
