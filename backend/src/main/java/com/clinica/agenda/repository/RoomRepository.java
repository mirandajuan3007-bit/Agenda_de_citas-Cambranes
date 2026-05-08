package com.clinica.agenda.repository;

import com.clinica.agenda.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findAllByOrderByNameAsc();
}
