package mx.clinica.cambranes.agenda.domain.validation.rules;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentRepository;
import mx.clinica.cambranes.agenda.domain.validation.AppointmentValidator;
import mx.clinica.cambranes.agenda.domain.validation.ValidationContext;
import mx.clinica.cambranes.agenda.domain.validation.ValidationError;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(30)
@RequiredArgsConstructor
public class PatientLimitValidator implements AppointmentValidator {

    private final AppointmentRepository appointmentRepository;

    @Value("${app.business.max-active-appointments-per-patient}")
    private int maxActive;

    @Override
    public List<ValidationError> validate(ValidationContext ctx) {
        if (ctx.getPatientId() == null) return List.of();
        long count = appointmentRepository.countScheduledByPatient(
                ctx.getPatientId(), ctx.getExcludeAppointmentId());
        if (count >= maxActive) {
            return List.of(ValidationError.of("patient",
                    "El paciente ya tiene " + maxActive + " citas programadas. " +
                    "Debe cancelar o completar alguna antes de agendar otra."));
        }
        return List.of();
    }
}
