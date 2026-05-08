package com.clinica.agenda.service;

import com.clinica.agenda.config.BusinessProperties;
import com.clinica.agenda.dto.AppointmentForm;
import com.clinica.agenda.dto.CancelForm;
import com.clinica.agenda.dto.PatientForm;
import com.clinica.agenda.dto.RescheduleForm;
import com.clinica.agenda.enums.AppointmentStatusCode;
import com.clinica.agenda.exception.BusinessException;
import com.clinica.agenda.exception.NotFoundException;
import com.clinica.agenda.model.*;
import com.clinica.agenda.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final TherapistRepository therapistRepository;
    private final RoomRepository roomRepository;
    private final SessionTypeRepository sessionTypeRepository;
    private final AppointmentStatusRepository statusRepository;
    private final AvailabilityService availabilityService;
    private final PatientService patientService;
    private final AuditService auditService;
    private final BusinessProperties props;

    @Transactional(readOnly = true)
    public List<Appointment> listAll() {
        return appointmentRepository.findAllOrderByStartDesc();
    }

    @Transactional(readOnly = true)
    public List<Appointment> listInRange(OffsetDateTime start, OffsetDateTime end) {
        return appointmentRepository.findInRange(start, end);
    }

    @Transactional(readOnly = true)
    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada."));
    }

    /**
     * RF-01 Crear cita. Maneja los dos flujos: evaluacion inicial (registra paciente nuevo)
     * y cita de terapia (paciente existente). Toda la validacion fuerte ocurre antes de tocar BD.
     */
    @Transactional
    public Appointment create(AppointmentForm form, User actingUser) {

        Patient patient = resolvePatient(form);
        Therapist therapist = therapistRepository.findById(form.getTherapistId())
                .orElseThrow(() -> new NotFoundException("Terapeuta no encontrado."));
        Room room = roomRepository.findById(form.getRoomId())
                .orElseThrow(() -> new NotFoundException("Sala no encontrada."));
        SessionType type = sessionTypeRepository.findById(form.getSessionTypeId())
                .orElseThrow(() -> new NotFoundException("Tipo de sesion no encontrado."));

        OffsetDateTime startAt = toOffset(form);
        OffsetDateTime endAt   = startAt.plusMinutes(form.getDurationMinutes());

        availabilityService.validateTimeWindow(startAt, endAt);
        availabilityService.assertWithinPendingLimit(patient.getId());
        availabilityService.assertResourcesFree(therapist.getId(), room.getId(), patient.getId(),
                startAt, endAt, null);

        AppointmentStatus scheduled = statusRepository.findById(AppointmentStatusCode.SCHEDULED.getId())
                .orElseThrow(() -> new IllegalStateException("Estado SCHEDULED no inicializado."));

        Appointment appt = Appointment.builder()
                .patient(patient)
                .therapist(therapist)
                .room(room)
                .sessionType(type)
                .startAt(startAt)
                .endAt(endAt)
                .durationMinutes(form.getDurationMinutes())
                .status(scheduled)
                .createdBy(actingUser)
                .fee(form.getFee())
                .comments(form.getComments())
                .build();

        Appointment saved = appointmentRepository.save(appt);
        auditService.record("Appointment", saved.getId(), "CREATE",
                "Cita creada para paciente " + patient.getFolio(), actingUser);
        return saved;
    }

    /**
     * RF-08 Reprogramar. No sobrescribe la original: la marca como RESCHEDULED
     * y crea una nueva con los datos modificados. Atomico: si algo falla, nada cambia.
     */
    @Transactional
    public Appointment reschedule(Long appointmentId, RescheduleForm form, User actingUser) {
        Appointment original = findById(appointmentId);

        if (!AppointmentStatusCode.SCHEDULED.name().equals(original.getStatus().getCode())) {
            throw new BusinessException("Solo se pueden reprogramar citas en estado programada.");
        }

        Therapist therapist = (form.getTherapistId() != null)
                ? therapistRepository.findById(form.getTherapistId())
                    .orElseThrow(() -> new NotFoundException("Terapeuta no encontrado."))
                : original.getTherapist();
        Room room = (form.getRoomId() != null)
                ? roomRepository.findById(form.getRoomId())
                    .orElseThrow(() -> new NotFoundException("Sala no encontrada."))
                : original.getRoom();

        OffsetDateTime startAt = toOffset(form.getDate(), form.getStartTime());
        OffsetDateTime endAt = startAt.plusMinutes(form.getDurationMinutes());

        availabilityService.validateTimeWindow(startAt, endAt);
        availabilityService.assertResourcesFree(therapist.getId(), room.getId(),
                original.getPatient().getId(), startAt, endAt, original.getId());

        AppointmentStatus scheduled = statusRepository.findById(AppointmentStatusCode.SCHEDULED.getId())
                .orElseThrow(() -> new IllegalStateException("Estado SCHEDULED no inicializado."));
        AppointmentStatus rescheduledStatus = statusRepository.findById(AppointmentStatusCode.RESCHEDULED.getId())
                .orElseThrow(() -> new IllegalStateException("Estado RESCHEDULED no inicializado."));

        Appointment fresh = Appointment.builder()
                .patient(original.getPatient())
                .therapist(therapist)
                .room(room)
                .sessionType(original.getSessionType())
                .startAt(startAt)
                .endAt(endAt)
                .durationMinutes(form.getDurationMinutes())
                .status(scheduled)
                .createdBy(actingUser)
                .fee(original.getFee())
                .comments(original.getComments())
                .build();
        Appointment saved = appointmentRepository.save(fresh);

        original.setStatus(rescheduledStatus);
        original.setRescheduledToId(saved.getId());
        if (form.getReason() != null && !form.getReason().isBlank()) {
            String suffix = "[Reprogramada: " + form.getReason().trim() + "]";
            original.setComments(original.getComments() == null
                    ? suffix
                    : original.getComments() + " " + suffix);
        }

        auditService.record("Appointment", original.getId(), "RESCHEDULE",
                "Reprogramada a cita " + saved.getId(), actingUser);
        auditService.record("Appointment", saved.getId(), "CREATE",
                "Cita generada por reprogramacion de " + original.getId(), actingUser);
        return saved;
    }

    /**
     * RF-09 Cancelar. Solo antes de la hora programada. Registra motivo y autor.
     */
    @Transactional
    public Appointment cancel(Long appointmentId, CancelForm form, User actingUser) {
        Appointment appt = findById(appointmentId);

        if (!AppointmentStatusCode.SCHEDULED.name().equals(appt.getStatus().getCode())) {
            throw new BusinessException("Solo se pueden cancelar citas en estado programada.");
        }
        OffsetDateTime now = OffsetDateTime.now(props.zoneId());
        if (!appt.getStartAt().isAfter(now)) {
            throw new BusinessException("No se puede cancelar una cita que ya inicio o que ya paso.");
        }

        AppointmentStatus cancelled = statusRepository.findById(AppointmentStatusCode.CANCELLED.getId())
                .orElseThrow(() -> new IllegalStateException("Estado CANCELLED no inicializado."));

        appt.setStatus(cancelled);
        appt.setCancelledReason(form.getReason().trim());
        appt.setCancelledAt(now);
        appt.setCancelledBy(actingUser);

        auditService.record("Appointment", appt.getId(), "CANCEL",
                "Motivo: " + form.getReason().trim(), actingUser);
        return appt;
    }

    /**
     * RF-07 Calculo visual: cita en SCHEDULED cuya hora de inicio ya paso.
     * Solo lectura; no muta la BD.
     */
    public boolean isLate(Appointment appt) {
        if (appt == null || appt.getStatus() == null) return false;
        if (!AppointmentStatusCode.SCHEDULED.name().equals(appt.getStatus().getCode())) return false;
        return appt.getStartAt().isBefore(OffsetDateTime.now(props.zoneId()));
    }

    private Patient resolvePatient(AppointmentForm form) {
        if ("THERAPY".equalsIgnoreCase(form.getAppointmentType())) {
            if (form.getPatientId() == null) {
                throw new BusinessException("Seleccione un paciente para la cita de terapia.");
            }
            return patientRepository.findById(form.getPatientId())
                    .orElseThrow(() -> new NotFoundException("Paciente no encontrado."));
        }
        if ("EVALUATION".equalsIgnoreCase(form.getAppointmentType())) {
            String first = Optional.ofNullable(form.getFirstName()).map(String::trim).orElse("");
            String last = Optional.ofNullable(form.getLastName()).map(String::trim).orElse("");
            if (first.isEmpty() || last.isEmpty()) {
                throw new BusinessException("Para la evaluacion inicial son obligatorios nombre y apellidos.");
            }
            PatientForm pf = new PatientForm();
            pf.setFullName((first + " " + last).trim());
            pf.setPhone(form.getPhone());
            pf.setEmail(form.getEmail());
            return patientService.registerNew(pf);
        }
        throw new BusinessException("Tipo de cita invalido.");
    }

    private OffsetDateTime toOffset(AppointmentForm form) {
        return toOffset(form.getDate(), form.getStartTime());
    }

    private OffsetDateTime toOffset(java.time.LocalDate date, java.time.LocalTime time) {
        ZoneId zone = props.zoneId();
        ZonedDateTime zdt = ZonedDateTime.of(date, time, zone);
        return zdt.toOffsetDateTime();
    }
}
