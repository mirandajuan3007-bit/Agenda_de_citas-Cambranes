package mx.clinica.cambranes.agenda.service;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.model.*;
import mx.clinica.cambranes.agenda.domain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {

    private final TherapistRepository therapistRepository;
    private final RoomRepository roomRepository;
    private final SessionTypeRepository sessionTypeRepository;
    private final AppointmentStatusRepository statusRepository;

    public List<Therapist> therapists() { return therapistRepository.findAllByActiveTrue(); }
    public List<Room>      rooms()      { return roomRepository.findAll(); }
    public List<SessionType>        sessionTypes() { return sessionTypeRepository.findAll(); }
    public List<AppointmentStatus>  statuses()     { return statusRepository.findAll(); }
}
