package mx.clinica.cambranes.agenda.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mx.clinica.cambranes.agenda.api.dto.CreatePatientRequest;
import mx.clinica.cambranes.agenda.domain.event.PatientEvent;
import mx.clinica.cambranes.agenda.domain.model.Patient;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.domain.repository.PatientRepository;
import mx.clinica.cambranes.agenda.service.exception.NotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final ApplicationEventPublisher events;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<Patient> listAll() { return patientRepository.findAll(); }

    @Transactional(readOnly = true)
    public Patient get(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente " + id + " no existe."));
    }

    @Transactional(readOnly = true)
    public List<Patient> search(String q) {
        if (q == null || q.isBlank()) return List.of();
        return patientRepository.searchByNameOrFolio(q.trim());
    }

    @Transactional
    public Patient create(CreatePatientRequest req, User createdBy) {
        Patient p = Patient.builder()
                .folio("TMP")
                .fullName(req.fullName().trim())
                .phone(req.phone())
                .email(req.email())
                .birthDate(req.birthDate())
                .build();
        Patient saved = patientRepository.save(p);
        saved.setFolio(String.format(Locale.ROOT, "PAC-%04d", saved.getId()));
        Patient finalPatient = patientRepository.save(saved);

        events.publishEvent(new PatientEvent(finalPatient, createdBy,
                toJson(Map.of("folio", finalPatient.getFolio()))));
        log.info("Paciente creado id={} folio={} por usuario={}",
                finalPatient.getId(), finalPatient.getFolio(), createdBy.getId());
        return finalPatient;
    }

    private String toJson(Map<String, ?> data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.warn("No se pudo serializar payload de auditoria: {}", e.getMessage());
            return "{}";
        }
    }
}
