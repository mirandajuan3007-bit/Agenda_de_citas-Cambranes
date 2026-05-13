package mx.clinica.cambranes.agenda.api.error;

import mx.clinica.cambranes.agenda.domain.validation.ValidationError;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        List<ValidationError> details
) {
    public static ApiError of(int status, String error, String message) {
        return new ApiError(OffsetDateTime.now(), status, error, message, List.of());
    }
    public static ApiError of(int status, String error, String message, List<ValidationError> details) {
        return new ApiError(OffsetDateTime.now(), status, error, message, details);
    }
}
