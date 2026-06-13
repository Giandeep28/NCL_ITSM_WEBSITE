package in.gov.ncl.itsm.workflow.infrastructure;

import in.gov.ncl.itsm.ticket.domain.TicketCreatedEvent;
import in.gov.ncl.itsm.workflow.application.TicketWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketCreatedEventListener {

    private final TicketWorkflowService ticketWorkflowService;

    @EventListener
    public void onTicketCreated(TicketCreatedEvent event) {
        log.info("Received TicketCreatedEvent for ticket ID: {}", event.getTicketId());
        try {
            ticketWorkflowService.assignTicket(event.getTicketId());
        } catch (Exception e) {
            log.error("Failed to auto-assign ticket ID: {}", event.getTicketId(), e);
        }
    }
}
