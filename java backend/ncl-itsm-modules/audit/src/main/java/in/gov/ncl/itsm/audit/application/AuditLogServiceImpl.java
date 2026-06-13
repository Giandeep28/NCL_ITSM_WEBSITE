package in.gov.ncl.itsm.audit.application;

import in.gov.ncl.itsm.audit.domain.AuditLog;
import in.gov.ncl.itsm.audit.domain.AuditLogId;
import in.gov.ncl.itsm.audit.infrastructure.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void logEvent(UUID actorId, String eventType, String entityType, UUID entityId, 
                         String beforeJson, String afterJson, String ipAddress, String tenantId) {
        
        AuditLogId id = AuditLogId.builder()
                .id(UUID.randomUUID())
                .occurredAt(LocalDateTime.now())
                .build();

        AuditLog auditLog = AuditLog.builder()
                .id(id)
                .actorId(actorId)
                .eventType(eventType)
                .entityType(entityType)
                .entityId(entityId)
                .beforeJson(beforeJson)
                .afterJson(afterJson)
                .ipAddress(ipAddress)
                .tenantId(tenantId)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs(String tenantId) {
        return auditLogRepository.findByTenantIdOrderByIdOccurredAtDesc(tenantId);
    }
}
