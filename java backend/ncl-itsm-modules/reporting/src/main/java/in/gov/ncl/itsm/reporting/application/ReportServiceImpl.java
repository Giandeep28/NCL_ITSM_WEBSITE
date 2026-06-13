package in.gov.ncl.itsm.reporting.application;

import in.gov.ncl.itsm.asset.hardware.domain.HardwareAsset;
import in.gov.ncl.itsm.asset.hardware.infrastructure.HardwareAssetRepository;
import in.gov.ncl.itsm.ticket.domain.Ticket;
import in.gov.ncl.itsm.ticket.infrastructure.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final TicketRepository ticketRepository;
    private final HardwareAssetRepository hardwareAssetRepository;

    @Override
    public byte[] generateTicketReportExcel(String tenantId) throws Exception {
        List<Ticket> tickets = ticketRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Tickets Report");

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Ticket Number", "Category", "Summary", "Priority", "Status", "SLA Due At", "Created At"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            for (Ticket ticket : tickets) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(ticket.getTicketNumber());
                row.createCell(1).setCellValue(ticket.getCategory());
                row.createCell(2).setCellValue(ticket.getSummary());
                row.createCell(3).setCellValue(ticket.getPriority());
                row.createCell(4).setCellValue(ticket.getStatus());
                row.createCell(5).setCellValue(ticket.getSlaDueAt() != null ? ticket.getSlaDueAt().toString() : "N/A");
                row.createCell(6).setCellValue(ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : "N/A");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] generateAssetReportExcel(String tenantId) throws Exception {
        List<HardwareAsset> assets = hardwareAssetRepository.findByTenantId(tenantId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Hardware Assets");

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Asset Tag", "Category", "Make", "Model", "Serial Number", "Status", "Location", "Procured At"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            for (HardwareAsset asset : assets) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(asset.getAssetTag());
                row.createCell(1).setCellValue(asset.getCategory());
                row.createCell(2).setCellValue(asset.getMake());
                row.createCell(3).setCellValue(asset.getModel());
                row.createCell(4).setCellValue(asset.getSerialNo());
                row.createCell(5).setCellValue(asset.getStatus());
                row.createCell(6).setCellValue(asset.getLocationId());
                row.createCell(7).setCellValue(asset.getProcuredAt() != null ? asset.getProcuredAt().toString() : "N/A");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
