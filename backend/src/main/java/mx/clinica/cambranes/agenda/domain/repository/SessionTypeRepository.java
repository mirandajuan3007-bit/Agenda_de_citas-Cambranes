package mx.clinica.cambranes.agenda.domain.repository;

import mx.clinica.cambranes.agenda.domain.model.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionTypeRepository extends JpaRepository<SessionType, Short> {
}
