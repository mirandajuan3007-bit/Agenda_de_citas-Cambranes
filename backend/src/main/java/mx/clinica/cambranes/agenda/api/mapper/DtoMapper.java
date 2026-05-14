package mx.clinica.cambranes.agenda.api.mapper;

import mx.clinica.cambranes.agenda.api.dto.*;
import mx.clinica.cambranes.agenda.domain.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper de entidades a DTOs implementado con MapStruct.
 * MapStruct genera la implementacion en tiempo de compilacion como
 * un @Component de Spring (por componentModel = "spring"), por eso
 * sigue siendo inyectable igual que antes.
 */
@Mapper(componentModel = "spring")
public interface DtoMapper {

    PatientDto toDto(Patient p);

    @Mapping(target = "roomId", source = "room.id")
    TherapistDto toDto(Therapist t);

    RoomDto toDto(Room r);

    SessionTypeDto toDto(SessionType s);

    @Mapping(target = "code", source = "code")
    @Mapping(target = "description", source = "description")
    AppointmentStatusDto toDto(AppointmentStatus s);

    UserDto toDto(User u);

    @Mapping(target = "performedBy", source = "performedBy.id")
    AuditLogDto toDto(AuditLog log);

    @Mapping(target = "patientId",         source = "patient.id")
    @Mapping(target = "therapistId",       source = "therapist.id")
    @Mapping(target = "roomId",            source = "room.id")
    @Mapping(target = "sessionTypeId",     source = "sessionType.id")
    @Mapping(target = "statusId",          source = "status.id")
    @Mapping(target = "statusCode",        source = "status.code")
    @Mapping(target = "createdBy",         source = "createdBy.id")
    @Mapping(target = "rescheduledFromId", source = "rescheduledFrom.id")
    AppointmentDto toDto(Appointment a);
}
