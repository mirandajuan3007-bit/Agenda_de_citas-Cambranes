package mx.clinica.cambranes.agenda.domain.repository;

import mx.clinica.cambranes.agenda.domain.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByFolio(String folio);

    @Query("""
        SELECT p FROM Patient p
        WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.folio)    LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY p.fullName ASC
    """)
    List<Patient> searchByNameOrFolio(@Param("q") String query);
}
