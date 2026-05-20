package mx.clinica.cambranes.agenda.api;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.*;
import mx.clinica.cambranes.agenda.api.mapper.DtoMapper;
import mx.clinica.cambranes.agenda.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalog;
    private final DtoMapper mapper;

    @GetMapping("/therapists")
    public List<TherapistDto> therapists() {
        return catalog.therapists().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/rooms")
    public List<RoomDto> rooms() {
        return catalog.rooms().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/session-types")
    public List<SessionTypeDto> sessionTypes() {
        return catalog.sessionTypes().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/appointment-statuses")
    public List<AppointmentStatusDto> statuses() {
        return catalog.statuses().stream().map(mapper::toDto).toList();
    }
}
