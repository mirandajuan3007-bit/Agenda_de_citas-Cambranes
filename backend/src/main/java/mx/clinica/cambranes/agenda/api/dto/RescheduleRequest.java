package mx.clinica.cambranes.agenda.api.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record RescheduleRequest(@NotNull LocalDateTime startAt) {}
