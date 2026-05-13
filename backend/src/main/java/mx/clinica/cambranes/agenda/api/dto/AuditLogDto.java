package mx.clinica.cambranes.agenda.api.dto;

import java.time.OffsetDateTime;

public record AuditLogDto(
        Long id,
        String entityType,
        Long entityId,
        String action,
        String payload,
        Long performedBy,
        OffsetDateTime performedAt
) {}
