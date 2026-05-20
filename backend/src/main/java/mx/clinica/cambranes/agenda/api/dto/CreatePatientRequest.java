package mx.clinica.cambranes.agenda.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreatePatientRequest(
        @NotBlank @Size(min = 2, max = 255) String fullName,
        @Size(max = 50) String phone,
        @Email @Size(max = 255) String email,
        LocalDate birthDate
) {}
