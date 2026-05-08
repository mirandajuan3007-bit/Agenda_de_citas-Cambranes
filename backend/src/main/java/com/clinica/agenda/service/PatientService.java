package com.clinica.agenda.service;

import com.clinica.agenda.dto.PatientForm;
import com.clinica.agenda.exception.NotFoundException;
import com.clinica.agenda.model.Patient;
import com.clinica.agenda.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * RF-05 Guardar datos del paciente y reutilizarlos para pacientes existentes.
 */
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;
    private final FolioGenerator folioGenerator;

    @Transactional(readOnly = true)
    public List<Patient> listAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Patient> search(String term) {
        if (term == null || term.isBlank()) {
            return repository.findAll();
        }
        return repository.search(term.trim());
    }

    @Transactional(readOnly = true)
    public Patient findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente no encontrado."));
    }

    @Transactional
    public Patient registerNew(PatientForm form) {
        Patient p = Patient.builder()
                .folio(folioGenerator.next())
                .fullName(form.getFullName().trim())
                .phone(blankToNull(form.getPhone()))
                .email(blankToNull(form.getEmail()))
                .birthDate(form.getBirthDate())
                .build();
        return repository.save(p);
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
