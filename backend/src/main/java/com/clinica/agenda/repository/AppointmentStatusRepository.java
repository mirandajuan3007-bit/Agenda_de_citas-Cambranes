package com.clinica.agenda.repository;

import com.clinica.agenda.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatus, Short> {
    Optional<AppointmentStatus> findByCode(String code);
}
