package mx.clinica.cambranes.agenda.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelRequest(@NotBlank @Size(min = 3, max = 500) String reason) {}
