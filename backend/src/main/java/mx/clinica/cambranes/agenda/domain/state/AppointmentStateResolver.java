package mx.clinica.cambranes.agenda.domain.state;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.model.Appointment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Devuelve el objeto AppointmentState que corresponde a una cita dada.
 * Mantiene el indice en memoria — Spring inyecta los estados como lista.
 */
@Component
public class AppointmentStateResolver {

    private final Map<Short, AppointmentState> byId;

    public AppointmentStateResolver(List<AppointmentState> states) {
        this.byId = states.stream().collect(Collectors.toMap(AppointmentState::id, Function.identity()));
    }

    public AppointmentState resolve(Appointment a) {
        AppointmentState s = byId.get(a.getStatus().getId());
        if (s == null) {
            throw new IllegalStateTransitionException(
                    "Estado desconocido: " + a.getStatus().getId());
        }
        return s;
    }
}
