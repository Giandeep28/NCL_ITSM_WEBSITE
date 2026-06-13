package in.gov.ncl.itsm.audit.application;

import in.gov.ncl.itsm.audit.domain.AuditLog;
import java.util.List;
import java.util.UUID;

public interface AuditLogService {
    void logEvent(UUID actorId, String eventType, String entityType, UUID entityId, String beforeJson, String afterJson, String ipAddress, String tenantId);
    List<AuditLog> getAuditLogs(String tenantId);
}
