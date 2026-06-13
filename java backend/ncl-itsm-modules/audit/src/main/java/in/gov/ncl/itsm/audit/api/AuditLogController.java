package in.gov.ncl.itsm.audit.api;

import in.gov.ncl.itsm.audit.application.AuditLogService;
import in.gov.ncl.itsm.audit.domain.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR', 'ROLE_READ_ONLY_AUDITOR')")
    public ResponseEntity<?> getAuditLogs(@AuthenticationPrincipal UserDetails principal) {
        String tenantId = "NCL_HQ";
        List<AuditLog> logs = auditLogService.getAuditLogs(tenantId);
        return ResponseEntity.ok(logs);
    }
}
