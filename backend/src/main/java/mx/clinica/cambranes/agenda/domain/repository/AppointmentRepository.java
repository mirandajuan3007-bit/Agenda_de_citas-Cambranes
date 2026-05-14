package mx.clinica.cambranes.agenda.domain.repository;

import mx.clinica.cambranes.agenda.domain.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Citas que ocupan recursos activamente: estado SCHEDULED o COMPLETED.
     * Se excluyen CANCELLED y RESCHEDULED porque liberan el horario.
     */
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.status.id IN (1, 4)
          AND a.startAt < :endAt
          AND a.endAt   > :startAt
          AND (:excludeId IS NULL OR a.id <> :excludeId)
    """)
    List<Appointment> findOverlapping(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt")   LocalDateTime endAt,
            @Param("excludeId") Long excludeId
    );

    // JOIN FETCH evita N+1 al serializar el DTO: el mapper accede a
    // patient/therapist/room/sessionType inmediatamente despues.
    @Query("""
        SELECT DISTINCT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.therapist
        JOIN FETCH a.room
        JOIN FETCH a.sessionType
        WHERE a.startAt >= :from AND a.startAt < :to
        ORDER BY a.startAt ASC
    """)
    List<Appointment> findInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("""
        SELECT DISTINCT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.therapist
        JOIN FETCH a.room
        JOIN FETCH a.sessionType
        WHERE a.patient.id = :patientId
        ORDER BY a.startAt DESC
    """)
    List<Appointment> findByPatientId(@Param("patientId") Long patientId);

    @Query("""
        SELECT COUNT(a) FROM Appointment a
        WHERE a.patient.id = :patientId
          AND a.status.id  = 1
          AND (:excludeId IS NULL OR a.id <> :excludeId)
    """)
    long countScheduledByPatient(@Param("patientId") Long patientId, @Param("excludeId") Long excludeId);
}
