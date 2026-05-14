package mx.clinica.cambranes.agenda.domain.validation;

import mx.clinica.cambranes.agenda.domain.validation.rules.WorkingHoursValidator;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WorkingHoursValidatorTest {

    private final WorkingHoursValidator validator = new WorkingHoursValidator("09:00", "17:30");

    @Test
    void aceptaCitaEnHorarioLaboralLunesAViernes() {
        // Miercoles 13 de mayo 2026 a las 10:00, dura 60 min
        ValidationContext ctx = ctx(LocalDateTime.of(2026, 5, 13, 10, 0),
                                    LocalDateTime.of(2026, 5, 13, 11, 0));
        assertThat(validator.validate(ctx)).isEmpty();
    }

    @Test
    void rechazaCitaEnSabado() {
        ValidationContext ctx = ctx(LocalDateTime.of(2026, 5, 16, 10, 0),
                                    LocalDateTime.of(2026, 5, 16, 11, 0));
        List<ValidationError> errors = validator.validate(ctx);
        assertThat(errors).extracting(ValidationError::getType).contains("working_hours");
        assertThat(errors).extracting(ValidationError::getMessage)
                .anyMatch(m -> m.contains("lunes a viernes"));
    }

    @Test
    void rechazaCitaEnDomingo() {
        ValidationContext ctx = ctx(LocalDateTime.of(2026, 5, 17, 10, 0),
                                    LocalDateTime.of(2026, 5, 17, 11, 0));
        assertThat(validator.validate(ctx)).isNotEmpty();
    }

    @Test
    void rechazaInicioAntesDeLas9() {
        ValidationContext ctx = ctx(LocalDateTime.of(2026, 5, 13, 8, 30),
                                    LocalDateTime.of(2026, 5, 13, 9, 30));
        assertThat(validator.validate(ctx)).extracting(ValidationError::getMessage)
                .anyMatch(m -> m.contains("antes de las"));
    }

    @Test
    void rechazaFinDespuesDeLas17_30() {
        ValidationContext ctx = ctx(LocalDateTime.of(2026, 5, 13, 17, 0),
                                    LocalDateTime.of(2026, 5, 13, 18, 0));
        assertThat(validator.validate(ctx)).extracting(ValidationError::getMessage)
                .anyMatch(m -> m.contains("despues de las"));
    }

    @Test
    void rechazaInicioPosteriorAFin() {
        ValidationContext ctx = ctx(LocalDateTime.of(2026, 5, 13, 11, 0),
                                    LocalDateTime.of(2026, 5, 13, 10, 0));
        assertThat(validator.validate(ctx)).extracting(ValidationError::getMessage)
                .anyMatch(m -> m.contains("hora de inicio"));
    }

    private ValidationContext ctx(LocalDateTime start, LocalDateTime end) {
        return ValidationContext.builder()
                .patientId(1L).therapistId(1L).roomId(1L)
                .startAt(start).endAt(end).build();
    }
}
