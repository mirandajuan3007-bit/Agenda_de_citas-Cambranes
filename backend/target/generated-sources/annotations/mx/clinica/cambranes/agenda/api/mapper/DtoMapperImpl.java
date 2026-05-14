package mx.clinica.cambranes.agenda.api.mapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import mx.clinica.cambranes.agenda.api.dto.AppointmentDto;
import mx.clinica.cambranes.agenda.api.dto.AppointmentStatusDto;
import mx.clinica.cambranes.agenda.api.dto.AuditLogDto;
import mx.clinica.cambranes.agenda.api.dto.PatientDto;
import mx.clinica.cambranes.agenda.api.dto.RoomDto;
import mx.clinica.cambranes.agenda.api.dto.SessionTypeDto;
import mx.clinica.cambranes.agenda.api.dto.TherapistDto;
import mx.clinica.cambranes.agenda.api.dto.UserDto;
import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;
import mx.clinica.cambranes.agenda.domain.model.AuditLog;
import mx.clinica.cambranes.agenda.domain.model.Patient;
import mx.clinica.cambranes.agenda.domain.model.Room;
import mx.clinica.cambranes.agenda.domain.model.SessionType;
import mx.clinica.cambranes.agenda.domain.model.Therapist;
import mx.clinica.cambranes.agenda.domain.model.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-14T13:40:31-0600",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DtoMapperImpl implements DtoMapper {

    @Override
    public PatientDto toDto(Patient p) {
        if ( p == null ) {
            return null;
        }

        Long id = null;
        String folio = null;
        String fullName = null;
        String phone = null;
        String email = null;
        LocalDate birthDate = null;
        OffsetDateTime createdAt = null;

        id = p.getId();
        folio = p.getFolio();
        fullName = p.getFullName();
        phone = p.getPhone();
        email = p.getEmail();
        birthDate = p.getBirthDate();
        createdAt = p.getCreatedAt();

        PatientDto patientDto = new PatientDto( id, folio, fullName, phone, email, birthDate, createdAt );

        return patientDto;
    }

    @Override
    public TherapistDto toDto(Therapist t) {
        if ( t == null ) {
            return null;
        }

        Long roomId = null;
        Long id = null;
        String fullName = null;
        String specialty = null;
        Boolean active = null;

        roomId = tRoomId( t );
        id = t.getId();
        fullName = t.getFullName();
        specialty = t.getSpecialty();
        active = t.getActive();

        TherapistDto therapistDto = new TherapistDto( id, fullName, specialty, roomId, active );

        return therapistDto;
    }

    @Override
    public RoomDto toDto(Room r) {
        if ( r == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        String location = null;

        id = r.getId();
        name = r.getName();
        location = r.getLocation();

        RoomDto roomDto = new RoomDto( id, name, location );

        return roomDto;
    }

    @Override
    public SessionTypeDto toDto(SessionType s) {
        if ( s == null ) {
            return null;
        }

        Short id = null;
        String name = null;

        id = s.getId();
        name = s.getName();

        SessionTypeDto sessionTypeDto = new SessionTypeDto( id, name );

        return sessionTypeDto;
    }

    @Override
    public AppointmentStatusDto toDto(AppointmentStatus s) {
        if ( s == null ) {
            return null;
        }

        String code = null;
        String description = null;
        Short id = null;

        code = s.getCode();
        description = s.getDescription();
        id = s.getId();

        AppointmentStatusDto appointmentStatusDto = new AppointmentStatusDto( id, code, description );

        return appointmentStatusDto;
    }

    @Override
    public UserDto toDto(User u) {
        if ( u == null ) {
            return null;
        }

        Long id = null;
        String email = null;
        String fullName = null;
        String role = null;

        id = u.getId();
        email = u.getEmail();
        fullName = u.getFullName();
        role = u.getRole();

        UserDto userDto = new UserDto( id, email, fullName, role );

        return userDto;
    }

    @Override
    public AuditLogDto toDto(AuditLog log) {
        if ( log == null ) {
            return null;
        }

        Long performedBy = null;
        Long id = null;
        String entityType = null;
        Long entityId = null;
        String action = null;
        String payload = null;
        OffsetDateTime performedAt = null;

        performedBy = logPerformedById( log );
        id = log.getId();
        entityType = log.getEntityType();
        entityId = log.getEntityId();
        action = log.getAction();
        payload = log.getPayload();
        performedAt = log.getPerformedAt();

        AuditLogDto auditLogDto = new AuditLogDto( id, entityType, entityId, action, payload, performedBy, performedAt );

        return auditLogDto;
    }

    @Override
    public AppointmentDto toDto(Appointment a) {
        if ( a == null ) {
            return null;
        }

        Long patientId = null;
        Long therapistId = null;
        Long roomId = null;
        Short sessionTypeId = null;
        Short statusId = null;
        String statusCode = null;
        Long createdBy = null;
        Long rescheduledFromId = null;
        Long id = null;
        LocalDateTime startAt = null;
        LocalDateTime endAt = null;
        Integer durationMinutes = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;
        String cancelledReason = null;
        OffsetDateTime cancelledAt = null;
        String paymentProofPath = null;
        BigDecimal cuota = null;
        String comments = null;

        patientId = aPatientId( a );
        therapistId = aTherapistId( a );
        roomId = aRoomId( a );
        sessionTypeId = aSessionTypeId( a );
        statusId = aStatusId( a );
        statusCode = aStatusCode( a );
        createdBy = aCreatedById( a );
        rescheduledFromId = aRescheduledFromId( a );
        id = a.getId();
        startAt = a.getStartAt();
        endAt = a.getEndAt();
        durationMinutes = a.getDurationMinutes();
        createdAt = a.getCreatedAt();
        updatedAt = a.getUpdatedAt();
        cancelledReason = a.getCancelledReason();
        cancelledAt = a.getCancelledAt();
        paymentProofPath = a.getPaymentProofPath();
        cuota = a.getCuota();
        comments = a.getComments();

        AppointmentDto appointmentDto = new AppointmentDto( id, patientId, therapistId, roomId, sessionTypeId, startAt, endAt, durationMinutes, statusId, statusCode, createdBy, createdAt, updatedAt, cancelledReason, cancelledAt, paymentProofPath, cuota, comments, rescheduledFromId );

        return appointmentDto;
    }

    private Long tRoomId(Therapist therapist) {
        if ( therapist == null ) {
            return null;
        }
        Room room = therapist.getRoom();
        if ( room == null ) {
            return null;
        }
        Long id = room.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long logPerformedById(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }
        User performedBy = auditLog.getPerformedBy();
        if ( performedBy == null ) {
            return null;
        }
        Long id = performedBy.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long aPatientId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        Patient patient = appointment.getPatient();
        if ( patient == null ) {
            return null;
        }
        Long id = patient.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long aTherapistId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        Therapist therapist = appointment.getTherapist();
        if ( therapist == null ) {
            return null;
        }
        Long id = therapist.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long aRoomId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        Room room = appointment.getRoom();
        if ( room == null ) {
            return null;
        }
        Long id = room.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Short aSessionTypeId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        SessionType sessionType = appointment.getSessionType();
        if ( sessionType == null ) {
            return null;
        }
        Short id = sessionType.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Short aStatusId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        AppointmentStatus status = appointment.getStatus();
        if ( status == null ) {
            return null;
        }
        Short id = status.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String aStatusCode(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        AppointmentStatus status = appointment.getStatus();
        if ( status == null ) {
            return null;
        }
        String code = status.getCode();
        if ( code == null ) {
            return null;
        }
        return code;
    }

    private Long aCreatedById(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        User createdBy = appointment.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        Long id = createdBy.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long aRescheduledFromId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        Appointment rescheduledFrom = appointment.getRescheduledFrom();
        if ( rescheduledFrom == null ) {
            return null;
        }
        Long id = rescheduledFrom.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
