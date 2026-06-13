package in.gov.ncl.itsm.reporting.api;

import in.gov.ncl.itsm.reporting.application.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/tickets/excel")
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<byte[]> downloadTicketReport() {
        try {
            String tenantId = "NCL_HQ";
            byte[] data = reportService.generateTicketReportExcel(tenantId);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ncl_itsm_ticket_report.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @GetMapping("/assets/excel")
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<byte[]> downloadAssetReport() {
        try {
            String tenantId = "NCL_HQ";
            byte[] data = reportService.generateAssetReportExcel(tenantId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ncl_itsm_asset_report.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
