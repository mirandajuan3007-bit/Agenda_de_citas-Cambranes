package com.clinica.agenda.service;

import com.clinica.agenda.config.BusinessProperties;
import com.clinica.agenda.exception.BusinessException;
import com.clinica.agenda.exception.ConflictException;
import com.clinica.agenda.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * RF-03 Validacion de disponibilidad de recursos.
 * Centraliza las reglas que comparten RF-01 (crear), RF-08 (reprogramar) y RF-09 (cancelar).
 */
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessProperties props;

    /**
     * Valida ventana, horario laboral y rango de fechas. No consulta BD.
     */
    public void validateTimeWindow(OffsetDateTime startAt, OffsetDateTime endAt) {
        if (startAt == null || endAt == null) {
            throw new BusinessException("La fecha y hora de inicio y fin son obligatorias.");
        }
        if (!startAt.isBefore(endAt)) {
            throw new BusinessException("La hora de inicio debe ser menor que la hora de fin.");
        }

        ZoneId zone = props.zoneId();
        LocalDateTime localStart = startAt.atZoneSameInstant(zone).toLocalDateTime();
        LocalDateTime localEnd   = endAt.atZoneSameInstant(zone).toLocalDateTime();

        if (!props.workingDays().contains(localStart.getDayOfWeek())) {
            throw new BusinessException("Solo se pueden agendar citas de lunes a viernes.");
        }
        if (!localStart.toLocalDate().equals(localEnd.toLocalDate())) {
            throw new BusinessException("La cita no puede cruzar de un dia a otro.");
        }

        var ws = props.workStartTime();
        var we = props.workEndTime();
        if (localStart.toLocalTime().isBefore(ws) || localEnd.toLocalTime().isAfter(we)) {
            throw new BusinessException("La cita debe estar dentro del horario laboral ("
                    + ws + " a " + we + ").");
        }

        OffsetDateTime now = OffsetDateTime.now(zone);
        if (startAt.isBefore(now.minusMinutes(1))) {
            throw new BusinessException("No se pueden crear citas en el pasado.");
        }

        LocalDate today = now.atZoneSameInstant(zone).toLocalDate();
        long daysAhead = today.until(localStart.toLocalDate()).getDays();
        if (daysAhead < props.getMinDaysAhead()) {
            throw new BusinessException("La cita debe agendarse con al menos "
                    + props.getMinDaysAhead() + " dia(s) de anticipacion.");
        }
        if (daysAhead > props.getMaxDaysAhead()) {
            throw new BusinessException("No se permite agendar citas con mas de "
                    + props.getMaxDaysAhead() + " dias de anticipacion.");
        }
    }

    /**
     * Valida que terapeuta, sala y paciente no tengan otra cita activa que se solape.
     * excludeAppointmentId permite ignorar la cita actual durante una reprogramacion.
     */
    public void assertResourcesFree(Integer therapistId, Integer roomId, Integer patientId,
                                    OffsetDateTime startAt, OffsetDateTime endAt,
                                    Long excludeAppointmentId) {

        if (!appointmentRepository.findOverlappingByTherapist(therapistId, startAt, endAt, excludeAppointmentId).isEmpty()) {
            throw new ConflictException("El terapeuta ya tiene una cita programada en ese horario.");
        }
        if (!appointmentRepository.findOverlappingByRoom(roomId, startAt, endAt, excludeAppointmentId).isEmpty()) {
            throw new ConflictException("La sala ya esta ocupada en ese horario.");
        }
        if (!appointmentRepository.findOverlappingByPatient(patientId, startAt, endAt, excludeAppointmentId).isEmpty()) {
            throw new ConflictException("El paciente ya tiene una cita programada en ese horario.");
        }
    }

    /**
     * Aplica el limite de citas pendientes por paciente (RF-01, regla 6).
     */
    public void assertWithinPendingLimit(Integer patientId) {
        OffsetDateTime now = OffsetDateTime.now(props.zoneId());
        long pending = appointmentRepository.countPendingByPatient(patientId, now);
        if (pending >= props.getMaxPendingPerPatient()) {
            throw new BusinessException("El paciente ya tiene "
                    + props.getMaxPendingPerPatient()
                    + " citas pendientes. Cancele o complete una antes de agendar otra.");
        }
    }
}
