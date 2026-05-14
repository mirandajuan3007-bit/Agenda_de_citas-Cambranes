package mx.clinica.cambranes.agenda.domain.validation;

import mx.clinica.cambranes.agenda.domain.model.*;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentRepository;
import mx.clinica.cambranes.agenda.domain.validation.rules.OverlapValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OverlapValidatorTest {

    private AppointmentRepository repo;
    private OverlapValidator validator;

    @BeforeEach
    void setUp() {
        repo = mock(AppointmentRepository.class);
        validator = new OverlapValidator(repo);
    }

    @Test
    void sinSolapeNoReportaErrores() {
        when(repo.findOverlapping(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any()))
                .thenReturn(List.of());

        ValidationContext ctx = ctx(1L, 1L, 1L);
        assertThat(validator.validate(ctx)).isEmpty();
    }

    @Test
    void solapeDeTerapeutaReportaError() {
        Appointment existing = appt(99L, 1L, 2L, 9L,
                LocalDateTime.of(2026, 5, 13, 10, 0),
                LocalDateTime.of(2026, 5, 13, 11, 0));
        when(repo.findOverlapping(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any()))
                .thenReturn(List.of(existing));

        ValidationContext ctx = ctx(7L, 1L, 5L);
        List<ValidationError> errors = validator.validate(ctx);
        assertThat(errors).extracting(ValidationError::getType).contains("therapist");
    }

    @Test
    void solapeDeSalaReportaError() {
        Appointment existing = appt(99L, 5L, 9L, 1L,
                LocalDateTime.of(2026, 5, 13, 10, 0),
                LocalDateTime.of(2026, 5, 13, 11, 0));
        when(repo.findOverlapping(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any()))
                .thenReturn(List.of(existing));

        ValidationContext ctx = ctx(2L, 3L, 1L);
        List<ValidationError> errors = validator.validate(ctx);
        assertThat(errors).extracting(ValidationError::getType).contains("room");
    }

    @Test
    void solapeDePacienteReportaError() {
        Appointment existing = appt(99L, 7L, 9L, 9L,
                LocalDateTime.of(2026, 5, 13, 10, 0),
                LocalDateTime.of(2026, 5, 13, 11, 0));
        when(repo.findOverlapping(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any()))
                .thenReturn(List.of(existing));

        ValidationContext ctx = ctx(7L, 3L, 5L);
        List<ValidationError> errors = validator.validate(ctx);
        assertThat(errors).extracting(ValidationError::getType).contains("patient");
    }

    private ValidationContext ctx(Long patientId, Long therapistId, Long roomId) {
        return ValidationContext.builder()
                .patientId(patientId).therapistId(therapistId).roomId(roomId)
                .startAt(LocalDateTime.of(2026, 5, 13, 10, 0))
                .endAt(LocalDateTime.of(2026, 5, 13, 11, 0))
                .build();
    }

    private Appointment appt(Long id, Long patientId, Long therapistId, Long roomId,
                              LocalDateTime start, LocalDateTime end) {
        Patient p = new Patient();   p.setId(patientId);
        Therapist t = new Therapist(); t.setId(therapistId);
        Room r = new Room();         r.setId(roomId);
        Appointment a = Appointment.builder()
                .patient(p).therapist(t).room(r)
                .startAt(start).endAt(end).durationMinutes(60)
                .build();
        a.setId(id);
        return a;
    }
}
