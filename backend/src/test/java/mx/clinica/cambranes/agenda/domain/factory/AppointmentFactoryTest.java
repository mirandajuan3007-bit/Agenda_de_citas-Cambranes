package mx.clinica.cambranes.agenda.domain.factory;

import mx.clinica.cambranes.agenda.api.dto.CreateAppointmentRequest;
import mx.clinica.cambranes.agenda.domain.model.*;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AppointmentFactoryTest {

    private AppointmentFactory factory;
    private AppointmentStatus scheduledStatus;

    @BeforeEach
    void setUp() {
        scheduledStatus = AppointmentStatus.builder().id(AppointmentStatus.SCHEDULED).code("SCHEDULED").build();
        AppointmentStatusRepository repo = mock(AppointmentStatusRepository.class);
        when(repo.getReferenceById(any())).thenReturn(scheduledStatus);
        factory = new AppointmentFactory(repo);
    }

    @Test
    void newScheduledCalculaEndAtSegunDuracion() {
        CreateAppointmentRequest req = new CreateAppointmentRequest(
                1L, 2L, 3L, (short) 1,
                LocalDateTime.of(2026, 5, 13, 10, 0),
                60, "una nota", new BigDecimal("250"), null);

        Appointment a = factory.newScheduled(req,
                patient(1L), therapist(2L), room(3L), sessionType((short) 1), user(99L));

        assertThat(a.getStartAt()).isEqualTo(LocalDateTime.of(2026, 5, 13, 10, 0));
        assertThat(a.getEndAt()).isEqualTo(LocalDateTime.of(2026, 5, 13, 11, 0));
        assertThat(a.getDurationMinutes()).isEqualTo(60);
        assertThat(a.getStatus()).isSameAs(scheduledStatus);
        assertThat(a.getComments()).isEqualTo("una nota");
    }

    @Test
    void newScheduledNormalizaCommentsANullComoCadenaVacia() {
        CreateAppointmentRequest req = new CreateAppointmentRequest(
                1L, 2L, 3L, (short) 1,
                LocalDateTime.of(2026, 5, 13, 10, 0),
                60, null, null, null);

        Appointment a = factory.newScheduled(req,
                patient(1L), therapist(2L), room(3L), sessionType((short) 1), user(99L));

        assertThat(a.getComments()).isEqualTo("");
    }

    @Test
    void fromRescheduleHeredaRecursosDelOriginal() {
        Appointment original = Appointment.builder()
                .patient(patient(7L)).therapist(therapist(2L)).room(room(3L))
                .sessionType(sessionType((short) 2))
                .startAt(LocalDateTime.of(2026, 5, 13, 10, 0))
                .endAt(LocalDateTime.of(2026, 5, 13, 11, 30))
                .durationMinutes(90)
                .cuota(new BigDecimal("500"))
                .comments("comentario")
                .build();
        original.setId(123L);

        Appointment nueva = factory.fromReschedule(original,
                LocalDateTime.of(2026, 5, 14, 12, 0), user(99L));

        assertThat(nueva.getPatient()).isSameAs(original.getPatient());
        assertThat(nueva.getTherapist()).isSameAs(original.getTherapist());
        assertThat(nueva.getRoom()).isSameAs(original.getRoom());
        assertThat(nueva.getSessionType()).isSameAs(original.getSessionType());
        assertThat(nueva.getDurationMinutes()).isEqualTo(90);
        assertThat(nueva.getStartAt()).isEqualTo(LocalDateTime.of(2026, 5, 14, 12, 0));
        assertThat(nueva.getEndAt()).isEqualTo(LocalDateTime.of(2026, 5, 14, 13, 30));
        assertThat(nueva.getRescheduledFrom()).isSameAs(original);
        assertThat(nueva.getComments()).isEqualTo("comentario");
    }

    private Patient patient(Long id)    { Patient p = new Patient(); p.setId(id); return p; }
    private Therapist therapist(Long id){ Therapist t = new Therapist(); t.setId(id); return t; }
    private Room room(Long id)          { Room r = new Room(); r.setId(id); return r; }
    private SessionType sessionType(Short id) { SessionType s = new SessionType(); s.setId(id); return s; }
    private User user(Long id)          { User u = new User(); u.setId(id); return u; }
}
