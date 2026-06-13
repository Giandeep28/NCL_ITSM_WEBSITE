package in.gov.ncl.itsm.workflow.application;

import in.gov.ncl.itsm.ticket.domain.Ticket;
import in.gov.ncl.itsm.ticket.domain.TicketHistory;
import in.gov.ncl.itsm.ticket.infrastructure.TicketRepository;
import in.gov.ncl.itsm.ticket.infrastructure.TicketHistoryRepository;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TicketWorkflowServiceImpl implements TicketWorkflowService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final UserService userService;

    @Override
    public void assignTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        if (!"Created".equalsIgnoreCase(ticket.getStatus()) && !"Reopened".equalsIgnoreCase(ticket.getStatus())) {
            log.info("Ticket {} is in status {}, skipping auto-assignment", ticket.getTicketNumber(), ticket.getStatus());
            return;
        }

        // Fetch all active Support Engineers for the tenant
        List<User> engineers = userService.findUsersByRole("ROLE_SUPPORT_ENGINEER", ticket.getTenantId());
        if (engineers.isEmpty()) {
            log.warn("No active Support Engineers found for tenant {}, leaving ticket unassigned", ticket.getTenantId());
            return;
        }

        // Find the least-loaded engineer
        List<String> openStatuses = List.of("Assigned", "In Progress", "Pending Employee", "Reopened");
        User selectedEngineer = engineers.stream()
                .min(Comparator.comparingLong(eng -> 
                    ticketRepository.countByEngineerIdAndStatusIn(eng.getId(), openStatuses)
                ))
                .orElse(engineers.getFirst());

        String oldStatus = ticket.getStatus();
        ticket.setEngineerId(selectedEngineer.getId());
        ticket.setStatus("Assigned");
        ticketRepository.save(ticket);

        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .actorId(ticket.getReporterId()) // use reporter as transaction actor
                .oldStatus(oldStatus)
                .newStatus("Assigned")
                .comment("Ticket auto-assigned to support engineer: " + selectedEngineer.getFullName())
                .build();
        ticketHistoryRepository.save(history);

        log.info("Ticket {} auto-assigned to engineer {}", ticket.getTicketNumber(), selectedEngineer.getFullName());
    }

    @Override
    public void processSlaBreaches() {
        List<String> openStatuses = List.of("Created", "Assigned", "In Progress", "Reopened");
        List<Ticket> breachedTickets = ticketRepository.findByStatusInAndSlaDueAtBefore(openStatuses, LocalDateTime.now());

        for (Ticket ticket : breachedTickets) {
            String oldStatus = ticket.getStatus();
            ticket.setStatus("Escalated");
            ticketRepository.save(ticket);

            TicketHistory history = TicketHistory.builder()
                    .ticket(ticket)
                    .actorId(ticket.getReporterId()) // use reporter as fallback actor
                    .oldStatus(oldStatus)
                    .newStatus("Escalated")
                    .comment("SLA limit reached. Ticket automatically escalated.")
                    .build();
            ticketHistoryRepository.save(history);

            log.info("Ticket {} automatically escalated due to SLA breach", ticket.getTicketNumber());
        }
    }

    @Override
    public void processAutoClose() {
        LocalDateTime limit = LocalDateTime.now().minusHours(48);
        List<Ticket> resolvedTickets = ticketRepository.findByStatusAndResolvedAtBefore("Resolved", limit);

        for (Ticket ticket : resolvedTickets) {
            String oldStatus = ticket.getStatus();
            ticket.setStatus("Closed");
            ticket.setClosedAt(LocalDateTime.now());
            ticketRepository.save(ticket);

            TicketHistory history = TicketHistory.builder()
                    .ticket(ticket)
                    .actorId(ticket.getReporterId())
                    .oldStatus(oldStatus)
                    .newStatus("Closed")
                    .comment("Ticket automatically closed after 48 hours in Resolved state.")
                    .build();
            ticketHistoryRepository.save(history);

            log.info("Ticket {} automatically closed", ticket.getTicketNumber());
        }
    }
}
