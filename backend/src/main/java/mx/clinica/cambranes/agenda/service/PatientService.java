package mx.clinica.cambranes.agenda.service;

import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final ApplicationEventPublisher events;

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

        events.publishEvent(new PatientEvent(
                finalPatient, createdBy,
                "{\"folio\":\"" + finalPatient.getFolio() + "\"}"
        ));
        return finalPatient;
    }
}
