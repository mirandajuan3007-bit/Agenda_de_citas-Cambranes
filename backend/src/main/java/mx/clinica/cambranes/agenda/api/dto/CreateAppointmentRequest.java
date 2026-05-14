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
        @Size(max = 2000, message = "Los comentarios no pueden exceder 2000 caracteres.") String comments,
        @PositiveOrZero(message = "La cuota no puede ser negativa.") BigDecimal cuota,
        @Size(max = 500, message = "La ruta del comprobante no puede exceder 500 caracteres.") String paymentProofPath
) {}
