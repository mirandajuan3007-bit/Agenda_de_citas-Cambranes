package mx.clinica.cambranes.agenda.api.dto;

public record TherapistDto(
        Long id,
        String fullName,
        String specialty,
        Long roomId,
        Boolean active
) {}
