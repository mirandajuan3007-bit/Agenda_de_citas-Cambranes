package com.clinica.agenda.repository;

import com.clinica.agenda.model.Therapist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TherapistRepository extends JpaRepository<Therapist, Integer> {
    List<Therapist> findByActiveTrueOrderByFullNameAsc();
}
