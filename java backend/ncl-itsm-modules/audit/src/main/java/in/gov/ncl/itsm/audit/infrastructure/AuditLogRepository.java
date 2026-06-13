package in.gov.ncl.itsm.audit.infrastructure;

import in.gov.ncl.itsm.audit.domain.AuditLog;
import in.gov.ncl.itsm.audit.domain.AuditLogId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, AuditLogId> {
    List<AuditLog> findByTenantIdOrderByIdOccurredAtDesc(String tenantId);
}
