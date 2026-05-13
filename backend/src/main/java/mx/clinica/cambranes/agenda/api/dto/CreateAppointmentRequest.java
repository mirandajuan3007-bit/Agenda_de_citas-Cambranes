package mx.clinica.cambranes.agenda.api.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateAppointmentRequest(
        @NotNull Long patientId,
        @NotNull Long therapistId,
        @NotNull Long roomId,
        @NotNull Short sessionTypeId,
        @NotNull LocalDateTime startAt,
        @NotNull @Min(15) @Max(240) Integer durationMinutes,
        String comments,
        BigDecimal cuota,
        String paymentProofPath
) {}
