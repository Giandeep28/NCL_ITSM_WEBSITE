package in.gov.ncl.itsm.ticket.application;

import in.gov.ncl.itsm.ticket.api.dto.TicketCreateRequest;
import in.gov.ncl.itsm.ticket.domain.Ticket;
import in.gov.ncl.itsm.ticket.domain.TicketHistory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketService {
    Ticket createTicket(TicketCreateRequest request, UUID reporterId, String tenantId, String orgId, String locationId);
    Optional<Ticket> getTicketById(UUID id);
    Optional<Ticket> getTicketByNumber(String ticketNumber);
    List<Ticket> getTicketsByReporter(UUID reporterId);
    List<Ticket> getAllTickets(String tenantId);
    Ticket updateTicketStatus(UUID ticketId, String newStatus, String comment, UUID actorId);
    Ticket assignTicket(UUID ticketId, UUID engineerId, UUID actorId);
    List<TicketHistory> getTicketHistory(UUID ticketId);
}
