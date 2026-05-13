package mx.clinica.cambranes.agenda.service;

import lombok.RequiredArgsConstructor;
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
import java.util.List;

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

        events.publishEvent(new AppointmentEvent.Created(saved, by,
                "{\"patientId\":" + patient.getId() + ",\"startAt\":\"" + saved.getStartAt() + "\"}"));
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

        events.publishEvent(new AppointmentEvent.Cancelled(saved, by,
                "{\"reason\":\"" + escape(reason) + "\"}"));
    }

    @Transactional
    public void complete(Long id, User by) {
        Appointment appt = get(id);
        AppointmentStatus next = stateResolver.resolve(appt).complete(appt);
        appt.setStatus(next);
        Appointment saved = appointmentRepository.save(appt);

        events.publishEvent(new AppointmentEvent.Completed(saved, by,
                "{\"newStatus\":\"COMPLETED\"}"));
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

        events.publishEvent(new AppointmentEvent.Rescheduled(original, by,
                "{\"newAppointmentId\":" + saved.getId() +
                ",\"newStartAt\":\"" + req.startAt() + "\"}"));
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

    private String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
