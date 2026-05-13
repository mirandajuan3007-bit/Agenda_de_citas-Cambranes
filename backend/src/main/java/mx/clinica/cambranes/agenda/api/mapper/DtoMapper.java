package mx.clinica.cambranes.agenda.api.mapper;

import mx.clinica.cambranes.agenda.api.dto.*;
import mx.clinica.cambranes.agenda.domain.model.*;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public PatientDto toDto(Patient p) {
        return new PatientDto(p.getId(), p.getFolio(), p.getFullName(),
                p.getPhone(), p.getEmail(), p.getBirthDate(), p.getCreatedAt());
    }

    public TherapistDto toDto(Therapist t) {
        return new TherapistDto(t.getId(), t.getFullName(), t.getSpecialty(),
                t.getRoom() != null ? t.getRoom().getId() : null, t.getActive());
    }

    public RoomDto toDto(Room r) {
        return new RoomDto(r.getId(), r.getName(), r.getLocation());
    }

    public SessionTypeDto toDto(SessionType s) {
        return new SessionTypeDto(s.getId(), s.getName());
    }

    public AppointmentStatusDto toDto(AppointmentStatus s) {
        return new AppointmentStatusDto(s.getId(), s.getCode(), s.getDescription());
    }

    public UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole());
    }

    public AuditLogDto toDto(AuditLog log) {
        return new AuditLogDto(
                log.getId(), log.getEntityType(), log.getEntityId(), log.getAction(),
                log.getPayload(),
                log.getPerformedBy() != null ? log.getPerformedBy().getId() : null,
                log.getPerformedAt()
        );
    }

    public AppointmentDto toDto(Appointment a) {
        return new AppointmentDto(
                a.getId(),
                a.getPatient().getId(),
                a.getTherapist().getId(),
                a.getRoom().getId(),
                a.getSessionType().getId(),
                a.getStartAt(),
                a.getEndAt(),
                a.getDurationMinutes(),
                a.getStatus().getId(),
                a.getStatus().getCode(),
                a.getCreatedBy() != null ? a.getCreatedBy().getId() : null,
                a.getCreatedAt(),
                a.getUpdatedAt(),
                a.getCancelledReason(),
                a.getCancelledAt(),
                a.getPaymentProofPath(),
                a.getCuota(),
                a.getComments(),
                a.getRescheduledFrom() != null ? a.getRescheduledFrom().getId() : null
        );
    }
}
