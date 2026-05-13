package mx.clinica.cambranes.agenda.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.*;
import mx.clinica.cambranes.agenda.api.mapper.DtoMapper;
import mx.clinica.cambranes.agenda.api.security.CurrentUser;
import mx.clinica.cambranes.agenda.domain.model.Appointment;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.domain.validation.ValidationError;
import mx.clinica.cambranes.agenda.service.AppointmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DtoMapper mapper;

    @GetMapping
    public List<AppointmentDto> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        List<Appointment> appts;
        if (date != null) {
            appts = appointmentService.findByDate(date);
        } else if (from != null && to != null) {
            appts = appointmentService.findByRange(from, to);
        } else {
            LocalDate today = LocalDate.now();
            appts = appointmentService.findByRange(today.minusDays(7), today.plusDays(30));
        }
        return appts.stream().map(mapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public AppointmentDto get(@PathVariable Long id) {
        return mapper.toDto(appointmentService.get(id));
    }

    @PostMapping("/check")
    public List<ValidationError> check(@Valid @RequestBody CreateAppointmentRequest req,
                                       @RequestParam(required = false) Long excludeId) {
        return appointmentService.check(req, excludeId);
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> create(@Valid @RequestBody CreateAppointmentRequest req,
                                                 @CurrentUser User user) {
        Appointment a = appointmentService.create(req, user);
        return ResponseEntity.created(URI.create("/api/appointments/" + a.getId()))
                .body(mapper.toDto(a));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id,
                                       @Valid @RequestBody CancelRequest req,
                                       @CurrentUser User user) {
        appointmentService.cancel(id, req.reason(), user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable Long id, @CurrentUser User user) {
        appointmentService.complete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentDto> reschedule(@PathVariable Long id,
                                                     @Valid @RequestBody RescheduleRequest req,
                                                     @CurrentUser User user) {
        Appointment a = appointmentService.reschedule(id, req, user);
        return ResponseEntity.ok(mapper.toDto(a));
    }
}
