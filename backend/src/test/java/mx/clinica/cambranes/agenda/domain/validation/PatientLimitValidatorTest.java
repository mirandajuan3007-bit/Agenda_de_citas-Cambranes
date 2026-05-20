package mx.clinica.cambranes.agenda.domain.validation;

import mx.clinica.cambranes.agenda.domain.repository.AppointmentRepository;
import mx.clinica.cambranes.agenda.domain.validation.rules.PatientLimitValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PatientLimitValidatorTest {

    private AppointmentRepository repo;
    private PatientLimitValidator validator;

    @BeforeEach
    void setUp() {
        repo = mock(AppointmentRepository.class);
        validator = new PatientLimitValidator(repo);
        ReflectionTestUtils.setField(validator, "maxActive", 3);
    }

    @Test
    void permiteDosCitasActivasParaPaciente() {
        when(repo.countScheduledByPatient(any(), any())).thenReturn(2L);
        ValidationContext ctx = ctx(7L);
        assertThat(validator.validate(ctx)).isEmpty();
    }

    @Test
    void rechazaCuartaCitaParaPaciente() {
        when(repo.countScheduledByPatient(any(), any())).thenReturn(3L);
        ValidationContext ctx = ctx(7L);
        assertThat(validator.validate(ctx)).hasSize(1);
        assertThat(validator.validate(ctx))
                .extracting(ValidationError::getType).contains("patient");
    }

    @Test
    void noValidaSiNoHayPaciente() {
        ValidationContext ctx = ValidationContext.builder()
                .therapistId(1L).roomId(1L)
                .startAt(LocalDateTime.of(2026, 5, 13, 10, 0))
                .endAt(LocalDateTime.of(2026, 5, 13, 11, 0))
                .build();
        assertThat(validator.validate(ctx)).isEmpty();
    }

    private ValidationContext ctx(Long patientId) {
        return ValidationContext.builder()
                .patientId(patientId).therapistId(1L).roomId(1L)
                .startAt(LocalDateTime.of(2026, 5, 13, 10, 0))
                .endAt(LocalDateTime.of(2026, 5, 13, 11, 0))
                .build();
    }
}
