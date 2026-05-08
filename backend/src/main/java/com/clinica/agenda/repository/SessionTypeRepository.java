package com.clinica.agenda.repository;

import com.clinica.agenda.model.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SessionTypeRepository extends JpaRepository<SessionType, Integer> {
    Optional<SessionType> findByNameIgnoreCase(String name);
    List<SessionType> findAllByOrderByNameAsc();
}
