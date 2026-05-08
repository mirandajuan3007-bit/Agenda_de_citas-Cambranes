package com.clinica.agenda.repository;

import com.clinica.agenda.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Busca citas activas (no canceladas, no reprogramadas, no finalizadas)
     * que se solapan con el rango [start, end) para un terapeuta.
     * Solapamiento clasico: existing.start < new.end AND existing.end > new.start.
     */
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.therapist.id = :therapistId
              AND a.status.code = 'SCHEDULED'
              AND a.startAt < :endAt
              AND a.endAt   > :startAt
              AND (:excludeId IS NULL OR a.id <> :excludeId)
            """)
    List<Appointment> findOverlappingByTherapist(@Param("therapistId") Integer therapistId,
                                                 @Param("startAt") OffsetDateTime startAt,
                                                 @Param("endAt") OffsetDateTime endAt,
                                                 @Param("excludeId") Long excludeId);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.room.id = :roomId
              AND a.status.code = 'SCHEDULED'
              AND a.startAt < :endAt
              AND a.endAt   > :startAt
              AND (:excludeId IS NULL OR a.id <> :excludeId)
            """)
    List<Appointment> findOverlappingByRoom(@Param("roomId") Integer roomId,
                                            @Param("startAt") OffsetDateTime startAt,
                                            @Param("endAt") OffsetDateTime endAt,
                                            @Param("excludeId") Long excludeId);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.patient.id = :patientId
              AND a.status.code = 'SCHEDULED'
              AND a.startAt < :endAt
              AND a.endAt   > :startAt
              AND (:excludeId IS NULL OR a.id <> :excludeId)
            """)
    List<Appointment> findOverlappingByPatient(@Param("patientId") Integer patientId,
                                               @Param("startAt") OffsetDateTime startAt,
                                               @Param("endAt") OffsetDateTime endAt,
                                               @Param("excludeId") Long excludeId);

    /**
     * Cuenta citas en estado SCHEDULED para un paciente cuyo inicio aun no ocurre.
     * Aplica la regla "maximo 3 citas pendientes por paciente" del RF-01.
     */
    @Query("""
            SELECT COUNT(a) FROM Appointment a
            WHERE a.patient.id = :patientId
              AND a.status.code = 'SCHEDULED'
              AND a.startAt >= :now
            """)
    long countPendingByPatient(@Param("patientId") Integer patientId,
                               @Param("now") OffsetDateTime now);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.startAt >= :start AND a.startAt < :end
            ORDER BY a.startAt ASC
            """)
    List<Appointment> findInRange(@Param("start") OffsetDateTime start,
                                  @Param("end") OffsetDateTime end);

    @Query("SELECT a FROM Appointment a ORDER BY a.startAt DESC")
    List<Appointment> findAllOrderByStartDesc();
}
