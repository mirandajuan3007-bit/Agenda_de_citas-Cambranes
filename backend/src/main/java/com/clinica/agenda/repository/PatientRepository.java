package com.clinica.agenda.repository;

import com.clinica.agenda.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    Optional<Patient> findByFolio(String folio);

    @Query("SELECT p FROM Patient p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "OR LOWER(p.folio) LIKE LOWER(CONCAT('%', :term, '%')) ORDER BY p.fullName ASC")
    List<Patient> search(@Param("term") String term);
}
