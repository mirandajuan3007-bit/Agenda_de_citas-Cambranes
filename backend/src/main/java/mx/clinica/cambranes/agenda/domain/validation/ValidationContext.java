package mx.clinica.cambranes.agenda.domain.validation;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Parametros que recibe cada validador de la cadena.
 * Inmutable para poder compartirlo entre validadores sin riesgo de mutacion.
 */
@Value
@Builder
public class ValidationContext {
    Long patientId;
    Long therapistId;
    Long roomId;
    LocalDateTime startAt;
    LocalDateTime endAt;
    /** Cita a excluir de la busqueda de conflictos (caso de reprogramacion). */
    Long excludeAppointmentId;
}
