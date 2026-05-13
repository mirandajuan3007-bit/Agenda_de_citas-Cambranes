package mx.clinica.cambranes.agenda.domain.validation.rules;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentRepository;
import mx.clinica.cambranes.agenda.domain.validation.AppointmentValidator;
import mx.clinica.cambranes.agenda.domain.validation.ValidationContext;
import mx.clinica.cambranes.agenda.domain.validation.ValidationError;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Detecta solapamientos de terapeuta, sala y paciente en una sola consulta.
 */
@Component
@Order(20)
@RequiredArgsConstructor
public class OverlapValidator implements AppointmentValidator {

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");
    private final AppointmentRepository appointmentRepository;

    @Override
    public List<ValidationError> validate(ValidationContext ctx) {
        List<Appointment> overlapping = appointmentRepository.findOverlapping(
                ctx.getStartAt(), ctx.getEndAt(), ctx.getExcludeAppointmentId());

        Set<ValidationError> errors = new LinkedHashSet<>();
        for (Appointment a : overlapping) {
            String range = a.getStartAt().format(HHMM) + " a " + a.getEndAt().format(HHMM);
            if (a.getTherapist().getId().equals(ctx.getTherapistId())) {
                errors.add(ValidationError.of("therapist",
                        "El terapeuta ya tiene una cita de " + range + "."));
            }
            if (a.getRoom().getId().equals(ctx.getRoomId())) {
                errors.add(ValidationError.of("room",
                        "La sala ya esta ocupada de " + range + "."));
            }
            if (ctx.getPatientId() != null && a.getPatient().getId().equals(ctx.getPatientId())) {
                errors.add(ValidationError.of("patient",
                        "El paciente ya tiene una cita de " + range + "."));
            }
        }
        return new ArrayList<>(errors);
    }
}
