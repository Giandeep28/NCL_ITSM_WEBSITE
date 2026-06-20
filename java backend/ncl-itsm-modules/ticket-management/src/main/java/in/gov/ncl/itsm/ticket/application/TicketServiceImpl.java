package in.gov.ncl.itsm.ticket.application;

import in.gov.ncl.itsm.ticket.api.dto.TicketCreateRequest;
import in.gov.ncl.itsm.ticket.domain.Ticket;
import in.gov.ncl.itsm.ticket.domain.TicketHistory;
import in.gov.ncl.itsm.ticket.infrastructure.TicketHistoryRepository;
import in.gov.ncl.itsm.ticket.infrastructure.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final in.gov.ncl.itsm.user.application.UserService userService;
    private final Random random = new Random();

    @Override
    public Ticket createTicket(TicketCreateRequest request, UUID reporterId, String tenantId, String orgId, String locationId) {
        // 1. Generate Ticket Number INC-YYYY-NNNNN
        String ticketNumber = String.format("INC-%d-%05d", LocalDate.now().getYear(), random.nextInt(100000));

        // 2. Set Priority based on Impact
        String priority = "Medium";
        if ("Critical".equalsIgnoreCase(request.getImpactLevel()) || "High".equalsIgnoreCase(request.getImpactLevel())) {
            priority = "Critical";
        } else if ("Low".equalsIgnoreCase(request.getImpactLevel())) {
            priority = "Low";
        }

        // 3. Set SLA deadline (Critical: 4h, Medium: 24h, Low: 48h)
        LocalDateTime slaDueAt = LocalDateTime.now();
        if ("Critical".equals(priority)) {
            slaDueAt = slaDueAt.plusHours(4);
        } else if ("Medium".equals(priority)) {
            slaDueAt = slaDueAt.plusDays(1);
        } else {
            slaDueAt = slaDueAt.plusDays(2);
        }

        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumber)
                .category(request.getCategory())
                .subCategory(request.getSubCategory())
                .impactLevel(request.getImpactLevel())
                .summary(request.getSummary())
                .description(request.getDescription())
                .status("Created")
                .priority(priority)
                .reporterId(reporterId)
                .slaDueAt(slaDueAt)
                .tenantId(tenantId)
                .orgId(orgId)
                .locationId(locationId)
                .serialNumber(request.getSerialNumber())
                .location(request.getLocation())
                .build();

        ticket = ticketRepository.save(ticket);

        // 4. Record Initial History Log
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .actorId(reporterId)
                .oldStatus(null)
                .newStatus("Created")
                .comment("Service ticket initiated by employee.")
                .build();

        ticketHistoryRepository.save(history);

        eventPublisher.publishEvent(new in.gov.ncl.itsm.ticket.domain.TicketCreatedEvent(this, ticket.getId()));

        return ticket;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ticket> getTicketById(UUID id) {
        return ticketRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ticket> getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByReporter(UUID reporterId) {
        return ticketRepository.findByReporterIdOrderByCreatedAtDesc(reporterId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets(String tenantId) {
        return ticketRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Override
    public Ticket updateTicketStatus(UUID ticketId, String newStatus, String comment, UUID actorId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket context not found: " + ticketId));

        String oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        
        if ("Resolved".equalsIgnoreCase(newStatus)) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if ("Closed".equalsIgnoreCase(newStatus)) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        ticket = ticketRepository.save(ticket);

        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .actorId(actorId)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .comment(comment)
                .build();

        ticketHistoryRepository.save(history);

        return ticket;
    }

    @Override
    public Ticket assignTicket(UUID ticketId, UUID engineerId, UUID actorId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket context not found: " + ticketId));

        ticket.setEngineerId(engineerId);
        
        String oldStatus = ticket.getStatus();
        if ("Created".equalsIgnoreCase(oldStatus) || "Requested".equalsIgnoreCase(oldStatus)) {
            ticket.setStatus("Assigned");
        }

        ticket = ticketRepository.save(ticket);

        // Fetch engineer details to log their name
        String engName = "Engineer";
        var engOpt = userService.findById(engineerId);
        if (engOpt.isPresent()) {
            engName = engOpt.get().getFullName();
        }

        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .actorId(actorId)
                .oldStatus(oldStatus)
                .newStatus(ticket.getStatus())
                .comment("Ticket reassigned to " + engName)
                .build();

        ticketHistoryRepository.save(history);

        return ticket;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketHistory> getTicketHistory(UUID ticketId) {
        return ticketHistoryRepository.findByTicketIdOrderByChangedAtAsc(ticketId);
    }
}
