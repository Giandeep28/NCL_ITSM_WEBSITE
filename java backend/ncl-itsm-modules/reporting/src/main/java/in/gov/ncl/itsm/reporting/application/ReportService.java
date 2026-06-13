package in.gov.ncl.itsm.reporting.application;

public interface ReportService {
    byte[] generateTicketReportExcel(String tenantId) throws Exception;
    byte[] generateAssetReportExcel(String tenantId) throws Exception;
}
