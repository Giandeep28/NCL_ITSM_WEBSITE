package in.gov.ncl.itsm.ticket.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private UUID id;
    private String ticketNumber;
    private String category;
    private String subCategory;
    private String impactLevel;
    private String summary;
    private String description;
    private String status;
    private String priority;
    private UUID reporterId;
    private String reporterName;
    private UUID engineerId;
    private String engineerName;
    private String serialNumber;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime slaDueAt;
    private List<HistoryResponse> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HistoryResponse {
        private UUID id;
        private String oldStatus;
        private String newStatus;
        private String comment;
        private String actorName;
        private LocalDateTime changedAt;
    }
}
