package mx.clinica.cambranes.agenda.domain.repository;

import mx.clinica.cambranes.agenda.domain.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
