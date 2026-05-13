package mx.clinica.cambranes.agenda.domain.repository;

import mx.clinica.cambranes.agenda.domain.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatus, Short> {
}
