package mx.clinica.cambranes.agenda.api.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PatientDto(
        Long id,
        String folio,
        String fullName,
        String phone,
        String email,
        LocalDate birthDate,
        OffsetDateTime createdAt
) {}
