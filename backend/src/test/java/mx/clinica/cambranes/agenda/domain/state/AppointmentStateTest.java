package mx.clinica.cambranes.agenda.domain.state;

import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AppointmentStateTest {

    private AppointmentStatusRepository statusRepo;
    private ScheduledState scheduled;
    private CancelledState cancelled;
    private RescheduledState rescheduledState;
    private CompletedState completed;
    private AppointmentStateResolver resolver;

    @BeforeEach
    void setUp() {
        statusRepo = mock(AppointmentStatusRepository.class);
        AppointmentStatus dummy = new AppointmentStatus();
        when(statusRepo.getReferenceById(any())).thenReturn(dummy);

        scheduled = new ScheduledState(statusRepo);
        cancelled = new CancelledState();
        rescheduledState = new RescheduledState();
        completed = new CompletedState();

        resolver = new AppointmentStateResolver(
                List.of(scheduled, cancelled, rescheduledState, completed));
    }

    @Test
    void desdeScheduledSePuedeCancelar() {
        Appointment a = withStatus(AppointmentStatus.SCHEDULED);
        assertThat(scheduled.cancel(a)).isNotNull();
    }

    @Test
    void desdeScheduledSePuedeReprogramar() {
        Appointment a = withStatus(AppointmentStatus.SCHEDULED);
        assertThat(scheduled.reschedule(a)).isNotNull();
    }

    @Test
    void desdeScheduledSePuedeCompletar() {
        Appointment a = withStatus(AppointmentStatus.SCHEDULED);
        assertThat(scheduled.complete(a)).isNotNull();
    }

    @Test
    void cancelarUnaCitaCanceladaLanzaExcepcion() {
        Appointment a = withStatus(AppointmentStatus.CANCELLED);
        a.setId(42L);
        assertThatThrownBy(() -> cancelled.cancel(a))
                .isInstanceOf(IllegalStateTransitionException.class)
                .hasMessageContaining("42")
                .hasMessageContaining("cancelada");
    }

    @Test
    void completarUnaCitaCompletadaLanzaExcepcion() {
        Appointment a = withStatus(AppointmentStatus.COMPLETED);
        a.setId(7L);
        assertThatThrownBy(() -> completed.complete(a))
                .isInstanceOf(IllegalStateTransitionException.class)
                .hasMessageContaining("finalizada");
    }

    @Test
    void reprogramarUnaCitaReprogramadaLanzaExcepcion() {
        Appointment a = withStatus(AppointmentStatus.RESCHEDULED);
        a.setId(7L);
        assertThatThrownBy(() -> rescheduledState.reschedule(a))
                .isInstanceOf(IllegalStateTransitionException.class)
                .hasMessageContaining("reprogramada");
    }

    @Test
    void resolverDevuelveElEstadoCorrectoSegunStatus() {
        Appointment a = withStatus(AppointmentStatus.SCHEDULED);
        assertThat(resolver.resolve(a)).isInstanceOf(ScheduledState.class);

        a = withStatus(AppointmentStatus.CANCELLED);
        assertThat(resolver.resolve(a)).isInstanceOf(CancelledState.class);

        a = withStatus(AppointmentStatus.COMPLETED);
        assertThat(resolver.resolve(a)).isInstanceOf(CompletedState.class);
    }

    @Test
    void resolverConEstadoDesconocidoLanzaExcepcion() {
        Appointment a = withStatus((short) 99);
        assertThatThrownBy(() -> resolver.resolve(a))
                .isInstanceOf(IllegalStateTransitionException.class);
    }

    private Appointment withStatus(short id) {
        AppointmentStatus s = new AppointmentStatus();
        s.setId(id);
        s.setCode("X");
        s.setDescription("X");
        return Appointment.builder().status(s).build();
    }
}
