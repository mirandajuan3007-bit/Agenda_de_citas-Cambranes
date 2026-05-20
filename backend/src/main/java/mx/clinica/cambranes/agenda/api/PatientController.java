package mx.clinica.cambranes.agenda.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.AppointmentDto;
import mx.clinica.cambranes.agenda.api.dto.CreatePatientRequest;
import mx.clinica.cambranes.agenda.api.dto.PatientDto;
import mx.clinica.cambranes.agenda.api.mapper.DtoMapper;
import mx.clinica.cambranes.agenda.api.security.CurrentUser;
import mx.clinica.cambranes.agenda.domain.model.Patient;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.service.AppointmentService;
import mx.clinica.cambranes.agenda.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final DtoMapper mapper;

    @GetMapping
    public List<PatientDto> list() {
        return patientService.listAll().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/search")
    public List<PatientDto> search(@RequestParam("q") String q) {
        return patientService.search(q).stream().map(mapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public PatientDto get(@PathVariable Long id) {
        return mapper.toDto(patientService.get(id));
    }

    @GetMapping("/{id}/appointments")
    public List<AppointmentDto> appointments(@PathVariable Long id) {
        return appointmentService.findByPatient(id).stream().map(mapper::toDto).toList();
    }

    @PostMapping
    public ResponseEntity<PatientDto> create(@Valid @RequestBody CreatePatientRequest req,
                                             @CurrentUser User user) {
        Patient p = patientService.create(req, user);
        return ResponseEntity.created(URI.create("/api/patients/" + p.getId())).body(mapper.toDto(p));
    }
}
