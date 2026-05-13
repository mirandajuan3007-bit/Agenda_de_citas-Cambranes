package mx.clinica.cambranes.agenda.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

public record AppointmentDto(
        Long id,
        Long patientId,
        Long therapistId,
        Long roomId,
        Short sessionTypeId,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Integer durationMinutes,
        Short statusId,
        String statusCode,
        Long createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String cancelledReason,
        OffsetDateTime cancelledAt,
        String paymentProofPath,
        BigDecimal cuota,
        String comments,
        Long rescheduledFromId
) {}
