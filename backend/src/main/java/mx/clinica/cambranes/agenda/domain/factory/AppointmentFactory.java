package mx.clinica.cambranes.agenda.domain.factory;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.CreateAppointmentRequest;
import mx.clinica.cambranes.agenda.domain.model.*;
import mx.clinica.cambranes.agenda.domain.repository.AppointmentStatusRepository;
import org.springframework.stereotype.Component;

/**
 * Factory: encapsula la construccion de Appointment con sus invariantes
 * (estado inicial SCHEDULED, endAt derivado de duracion, etc.) para que
 * los services no tengan que conocer esos detalles.
 */
@Component
@RequiredArgsConstructor
public class AppointmentFactory {

    private final AppointmentStatusRepository statusRepository;

    public Appointment newScheduled(
            CreateAppointmentRequest req,
            Patient patient,
            Therapist therapist,
            Room room,
            SessionType sessionType,
            User createdBy
    ) {
        AppointmentStatus scheduled = statusRepository.getReferenceById(AppointmentStatus.SCHEDULED);
        return Appointment.builder()
                .patient(patient)
                .therapist(therapist)
                .room(room)
                .sessionType(sessionType)
                .startAt(req.startAt())
                .endAt(req.startAt().plusMinutes(req.durationMinutes()))
                .durationMinutes(req.durationMinutes())
                .status(scheduled)
                .createdBy(createdBy)
                .cuota(req.cuota())
                .comments(req.comments() == null ? "" : req.comments())
                .paymentProofPath(req.paymentProofPath())
                .build();
    }

    /**
     * Cita nueva producto de una reprogramacion: hereda recursos del original,
     * solo cambia startAt/endAt.
     */
    public Appointment fromReschedule(Appointment original, java.time.LocalDateTime newStartAt, User by) {
        AppointmentStatus scheduled = statusRepository.getReferenceById(AppointmentStatus.SCHEDULED);
        return Appointment.builder()
                .patient(original.getPatient())
                .therapist(original.getTherapist())
                .room(original.getRoom())
                .sessionType(original.getSessionType())
                .startAt(newStartAt)
                .endAt(newStartAt.plusMinutes(original.getDurationMinutes()))
                .durationMinutes(original.getDurationMinutes())
                .status(scheduled)
                .createdBy(by)
                .cuota(original.getCuota())
                .comments(original.getComments())
                .paymentProofPath(original.getPaymentProofPath())
                .rescheduledFrom(original)
                .build();
    }
}
