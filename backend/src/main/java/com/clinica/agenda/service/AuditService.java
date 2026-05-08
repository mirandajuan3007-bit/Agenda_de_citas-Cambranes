package com.clinica.agenda.service;

import com.clinica.agenda.model.AuditLog;
import com.clinica.agenda.model.User;
import com.clinica.agenda.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;

    @Transactional
    public void record(String entityType, Long entityId, String action, String payload, User performedBy) {
        AuditLog log = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .payload(payload)
                .performedBy(performedBy)
                .build();
        repository.save(log);
    }
}
