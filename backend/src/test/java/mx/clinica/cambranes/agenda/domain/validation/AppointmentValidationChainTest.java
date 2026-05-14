package mx.clinica.cambranes.agenda.domain.validation;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AppointmentValidationChainTest {

    @Test
    void acumulaErroresDeTodosLosValidadores() {
        AppointmentValidator v1 = ctx -> List.of(ValidationError.of("a", "error A"));
        AppointmentValidator v2 = ctx -> List.of(ValidationError.of("b", "error B"));
        AppointmentValidator v3 = ctx -> List.of();

        AppointmentValidationChain chain = new AppointmentValidationChain(List.of(v1, v2, v3));
        List<ValidationError> errors = chain.run(emptyCtx());

        assertThat(errors).hasSize(2);
        assertThat(errors).extracting(ValidationError::getType).containsExactly("a", "b");
    }

    @Test
    void sinValidadoresNoHayErrores() {
        AppointmentValidationChain chain = new AppointmentValidationChain(List.of());
        assertThat(chain.run(emptyCtx())).isEmpty();
    }

    private ValidationContext emptyCtx() {
        return ValidationContext.builder()
                .patientId(1L).therapistId(1L).roomId(1L)
                .startAt(LocalDateTime.now())
                .endAt(LocalDateTime.now().plusMinutes(60))
                .build();
    }
}
