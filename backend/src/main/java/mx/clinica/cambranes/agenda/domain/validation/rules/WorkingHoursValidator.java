package mx.clinica.cambranes.agenda.domain.validation.rules;

import mx.clinica.cambranes.agenda.domain.validation.AppointmentValidator;
import mx.clinica.cambranes.agenda.domain.validation.ValidationContext;
import mx.clinica.cambranes.agenda.domain.validation.ValidationError;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(10)
public class WorkingHoursValidator implements AppointmentValidator {

    private final LocalTime workStart;
    private final LocalTime workEnd;

    public WorkingHoursValidator(
            @Value("${app.business.working-hours.start}") String start,
            @Value("${app.business.working-hours.end}")   String end) {
        this.workStart = LocalTime.parse(start);
        this.workEnd   = LocalTime.parse(end);
    }

    @Override
    public List<ValidationError> validate(ValidationContext ctx) {
        List<ValidationError> errors = new ArrayList<>();

        DayOfWeek day = ctx.getStartAt().getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            errors.add(ValidationError.of("working_hours",
                    "Las citas solo pueden agendarse de lunes a viernes."));
        }
        if (ctx.getStartAt().toLocalTime().isBefore(workStart)) {
            errors.add(ValidationError.of("working_hours",
                    "La cita no puede iniciar antes de las " + workStart + "."));
        }
        if (ctx.getEndAt().toLocalTime().isAfter(workEnd)) {
            errors.add(ValidationError.of("working_hours",
                    "La cita no puede terminar despues de las " + workEnd + "."));
        }
        if (!ctx.getStartAt().isBefore(ctx.getEndAt())) {
            errors.add(ValidationError.of("working_hours",
                    "La hora de inicio debe ser anterior a la de finalizacion."));
        }
        return errors;
    }
}
