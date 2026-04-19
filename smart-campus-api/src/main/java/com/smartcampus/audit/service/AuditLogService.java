package com.smartcampus.audit.service;

import com.smartcampus.audit.entity.AuditAction;
import com.smartcampus.audit.entity.AuditLog;
import com.smartcampus.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String entity, String entityId, String details) {
        log(AuditAction.from(action), entity, entityId, details);
    }

    public void log(AuditAction action, String entity, String entityId, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action == null ? AuditAction.OTHER : action);
        auditLog.setEntity(entity);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLogRepository.save(auditLog);
    }
}
