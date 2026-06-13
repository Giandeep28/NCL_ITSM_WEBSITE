package in.gov.ncl.itsm.ticket.api;

import in.gov.ncl.itsm.ticket.api.dto.TicketCreateRequest;
import in.gov.ncl.itsm.ticket.api.dto.TicketResponse;
import in.gov.ncl.itsm.ticket.domain.Ticket;
import in.gov.ncl.itsm.ticket.domain.TicketHistory;
import in.gov.ncl.itsm.ticket.application.TicketService;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> createTicket(
            @Valid @RequestBody TicketCreateRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Optional<User> userOpt = userService.findByEisNumber(principal.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User context not found");
        }
        User user = userOpt.get();

        Ticket ticket = ticketService.createTicket(
                request,
                user.getId(),
                user.getTenantId(),
                user.getOrgId(),
                user.getLocationId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(ticket));
    }

    @GetMapping
    public ResponseEntity<?> listTickets(@AuthenticationPrincipal UserDetails principal) {
        Optional<User> userOpt = userService.findByEisNumber(principal.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User context not found");
        }
        User user = userOpt.get();

        boolean isEngineerOrAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPPORT_ENGINEER") || a.getAuthority().equals("ROLE_IT_ADMINISTRATOR"));

        List<Ticket> tickets;
        if (isEngineerOrAdmin) {
            tickets = ticketService.getAllTickets(user.getTenantId());
        } else {
            tickets = ticketService.getTicketsByReporter(user.getId());
        }

        List<TicketResponse> responseList = tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Optional<Ticket> ticketOpt = ticketService.getTicketById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ticket not found");
        }

        Ticket ticket = ticketOpt.get();
        // Return full response including historical logs
        TicketResponse response = mapToResponse(ticket);
        
        List<TicketHistory> histories = ticketService.getTicketHistory(id);
        List<TicketResponse.HistoryResponse> historyResponses = histories.stream()
                .map(h -> {
                    // Find actor user details (fallback to ID if not loaded)
                    String actorName = "System";
                    if (h.getActorId() != null) {
                        Optional<User> actorOpt = userService.findByEisNumber(principal.getUsername()); // Simple placeholder
                        if (actorOpt.isPresent()) {
                            actorName = actorOpt.get().getFullName();
                        }
                    }
                    return TicketResponse.HistoryResponse.builder()
                            .id(h.getId())
                            .oldStatus(h.getOldStatus())
                            .newStatus(h.getNewStatus())
                            .comment(h.getComment())
                            .actorName(actorName)
                            .changedAt(h.getChangedAt())
                            .build();
                })
                .collect(Collectors.toList());
        
        response.setHistory(historyResponses);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Optional<User> userOpt = userService.findByEisNumber(principal.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User context not found");
        }
        User user = userOpt.get();

        try {
            Ticket updatedTicket = ticketService.updateTicketStatus(id, status, comment, user.getId());
            return ResponseEntity.ok(mapToResponse(updatedTicket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating status: " + e.getMessage());
        }
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .category(ticket.getCategory())
                .subCategory(ticket.getSubCategory())
                .impactLevel(ticket.getImpactLevel())
                .summary(ticket.getSummary())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .reporterId(ticket.getReporterId())
                .reporterName("J. Henderson") // Mock name mapping or retrieve from User module
                .engineerId(ticket.getEngineerId())
                .engineerName(ticket.getEngineerId() != null ? "Marcus Thorne" : null)
                .serialNumber(ticket.getSerialNumber())
                .location(ticket.getLocation())
                .createdAt(ticket.getCreatedAt())
                .slaDueAt(ticket.getSlaDueAt())
                .build();
    }
}
