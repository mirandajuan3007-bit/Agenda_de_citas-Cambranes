package mx.clinica.cambranes.agenda.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mx.clinica.cambranes.agenda.api.dto.CreateAppointmentRequest;
import mx.clinica.cambranes.agenda.api.dto.RescheduleRequest;
import mx.clinica.cambranes.agenda.domain.event.AppointmentEvent;
import mx.clinica.cambranes.agenda.domain.factory.AppointmentFactory;
import mx.clinica.cambranes.agenda.domain.model.*;
import mx.clinica.cambranes.agenda.domain.repository.*;
import mx.clinica.cambranes.agenda.domain.state.AppointmentStateResolver;
import mx.clinica.cambranes.agenda.domain.validation.AppointmentValidationChain;
import mx.clinica.cambranes.agenda.domain.validation.ValidationContext;
import mx.clinica.cambranes.agenda.domain.validation.ValidationError;
import mx.clinica.cambranes.agenda.service.exception.BusinessRuleException;
import mx.clinica.cambranes.agenda.service.exception.NotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final TherapistRepository   therapistRepository;
    private final RoomRepository        roomRepository;
    private final SessionTypeRepository sessionTypeRepository;
    private final AppointmentFactory     factory;
    private final AppointmentValidationChain validationChain;
    private final AppointmentStateResolver stateResolver;
    private final ApplicationEventPublisher events;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<Appointment> findByDate(LocalDate date) {
        return appointmentRepository.findInRange(
                date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Transactional(readOnly = true)
    public List<Appointment> findByRange(LocalDate from, LocalDate to) {
        return appointmentRepository.findInRange(
                from.atStartOfDay(), to.plusDays(1).atStartOfDay());
    }

    @Transactional(readOnly = true)
    public Appointment get(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cita " + id + " no existe."));
    }

    @Transactional(readOnly = true)
    public List<Appointment> findByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<ValidationError> check(CreateAppointmentRequest req, Long excludeId) {
        ValidationContext ctx = buildContext(req, excludeId);
        return validationChain.run(ctx);
    }

    @Transactional
    public Appointment create(CreateAppointmentRequest req, User by) {
        Patient patient = patientRepository.findById(req.patientId())
                .orElseThrow(() -> new NotFoundException("Paciente " + req.patientId() + " no existe."));
        Therapist therapist = therapistRepository.findById(req.therapistId())
                .orElseThrow(() -> new NotFoundException("Terapeuta " + req.therapistId() + " no existe."));
        Room room = roomRepository.findById(req.roomId())
                .orElseThrow(() -> new NotFoundException("Sala " + req.roomId() + " no existe."));
        SessionType sessionType = sessionTypeRepository.findById(req.sessionTypeId())
                .orElseThrow(() -> new NotFoundException("Tipo de sesion " + req.sessionTypeId() + " no existe."));

        // Cada terapeuta tiene una sala fija: forzamos la consistencia.
        if (!therapist.getRoom().getId().equals(room.getId())) {
            throw new BusinessRuleException(List.of(
                    ValidationError.of("room",
                            "La sala no corresponde al terapeuta seleccionado.")));
        }

        ValidationContext ctx = buildContext(req, null);
        List<ValidationError> errors = validationChain.run(ctx);
        if (!errors.isEmpty()) throw new BusinessRuleException(errors);

        Appointment toSave = factory.newScheduled(req, patient, therapist, room, sessionType, by);
        Appointment saved  = appointmentRepository.save(toSave);

        // Re-validacion post-save para cerrar la ventana TOCTOU: si entre la
        // validacion previa y el flush otra transaccion concurrente inserto una
        // cita solapada, ambas pasaran el primer chequeo pero aqui detectamos
        // el conflicto y forzamos rollback.
        appointmentRepository.flush();
        List<ValidationError> postErrors = validationChain.run(buildContext(req, saved.getId()));
        if (!postErrors.isEmpty()) {
            log.warn("TOCTOU detectado al crear cita id={}: {}", saved.getId(), postErrors);
            throw new BusinessRuleException(postErrors);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("patientId", patient.getId());
        payload.put("startAt", saved.getStartAt().toString());
        events.publishEvent(new AppointmentEvent.Created(saved, by, toJson(payload)));
        log.info("Cita creada id={} paciente={} terapeuta={} inicio={} por usuario={}",
                saved.getId(), patient.getId(), therapist.getId(), saved.getStartAt(), by.getId());
        return saved;
    }

    @Transactional
    public void cancel(Long id, String reason, User by) {
        Appointment appt = get(id);
        AppointmentStatus next = stateResolver.resolve(appt).cancel(appt);
        appt.setStatus(next);
        appt.setCancelledReason(reason);
        appt.setCancelledAt(java.time.OffsetDateTime.now());
        Appointment saved = appointmentRepository.save(appt);

        events.publishEvent(new AppointmentEvent.Cancelled(saved, by, toJson(Map.of("reason", reason == null ? "" : reason))));
        log.info("Cita cancelada id={} motivo='{}' por usuario={}", id, reason, by.getId());
    }

    @Transactional
    public void complete(Long id, User by) {
        Appointment appt = get(id);
        AppointmentStatus next = stateResolver.resolve(appt).complete(appt);
        appt.setStatus(next);
        Appointment saved = appointmentRepository.save(appt);

        events.publishEvent(new AppointmentEvent.Completed(saved, by, toJson(Map.of("newStatus", "COMPLETED"))));
        log.info("Cita completada id={} por usuario={}", id, by.getId());
    }

    @Transactional
    public Appointment reschedule(Long id, RescheduleRequest req, User by) {
        Appointment original = get(id);

        // Validar el nuevo horario excluyendo la cita original.
        ValidationContext ctx = ValidationContext.builder()
                .patientId(original.getPatient().getId())
                .therapistId(original.getTherapist().getId())
                .roomId(original.getRoom().getId())
                .startAt(req.startAt())
                .endAt(req.startAt().plusMinutes(original.getDurationMinutes()))
                .excludeAppointmentId(original.getId())
                .build();
        List<ValidationError> errors = validationChain.run(ctx);
        if (!errors.isEmpty()) throw new BusinessRuleException(errors);

        // Archivar original via State pattern.
        AppointmentStatus archived = stateResolver.resolve(original).reschedule(original);
        original.setStatus(archived);
        appointmentRepository.save(original);

        Appointment newAppt = factory.fromReschedule(original, req.startAt(), by);
        Appointment saved = appointmentRepository.save(newAppt);

        // Cierra la ventana TOCTOU como en create().
        appointmentRepository.flush();
        ValidationContext postCtx = ValidationContext.builder()
                .patientId(original.getPatient().getId())
                .therapistId(original.getTherapist().getId())
                .roomId(original.getRoom().getId())
                .startAt(req.startAt())
                .endAt(req.startAt().plusMinutes(original.getDurationMinutes()))
                .excludeAppointmentId(saved.getId())
                .build();
        List<ValidationError> postErrors = validationChain.run(postCtx);
        if (!postErrors.isEmpty()) {
            log.warn("TOCTOU detectado al reprogramar cita original={} nueva={}: {}",
                    original.getId(), saved.getId(), postErrors);
            throw new BusinessRuleException(postErrors);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("newAppointmentId", saved.getId());
        payload.put("newStartAt", req.startAt().toString());
        events.publishEvent(new AppointmentEvent.Rescheduled(original, by, toJson(payload)));
        log.info("Cita reprogramada original={} nueva={} inicio={} por usuario={}",
                original.getId(), saved.getId(), req.startAt(), by.getId());
        return saved;
    }

    private ValidationContext buildContext(CreateAppointmentRequest req, Long excludeId) {
        LocalDateTime end = req.startAt().plusMinutes(req.durationMinutes());
        return ValidationContext.builder()
                .patientId(req.patientId())
                .therapistId(req.therapistId())
                .roomId(req.roomId())
                .startAt(req.startAt())
                .endAt(end)
                .excludeAppointmentId(excludeId)
                .build();
    }

    private String toJson(Map<String, ?> data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            // No deberia ocurrir con Map<String, Object> de tipos basicos,
            // pero si pasa, no rompemos la transaccion por un payload de audit.
            log.warn("No se pudo serializar payload de auditoria: {}", e.getMessage());
            return "{}";
        }
    }
}
