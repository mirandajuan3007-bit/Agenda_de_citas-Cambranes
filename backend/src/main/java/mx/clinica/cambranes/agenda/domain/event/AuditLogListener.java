package mx.clinica.cambranes.agenda.domain.event;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.model.AuditLog;
import mx.clinica.cambranes.agenda.domain.repository.AuditLogRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Observer: escucha eventos de dominio y los persiste como audit log,
 * sin que los services tengan que invocar al repositorio de audit ellos mismos.
 */
@Component
@RequiredArgsConstructor
public class AuditLogListener {

    private final AuditLogRepository auditRepo;

    @EventListener
    @Transactional
    public void onAppointmentEvent(AppointmentEvent event) {
        auditRepo.save(AuditLog.builder()
                .entityType("appointment")
                .entityId(event.appointment().getId())
                .action(event.action())
                .payload(event.payload())
                .performedBy(event.performedBy())
                .build());
    }

    @EventListener
    @Transactional
    public void onPatientCreated(PatientEvent event) {
        auditRepo.save(AuditLog.builder()
                .entityType("patient")
                .entityId(event.patient().getId())
                .action("CREATE")
                .payload(event.payload())
                .performedBy(event.performedBy())
                .build());
    }
}
