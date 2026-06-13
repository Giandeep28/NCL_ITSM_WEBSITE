package in.gov.ncl.itsm.ticket.domain;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class TicketCreatedEvent extends ApplicationEvent {
    private final UUID ticketId;

    public TicketCreatedEvent(Object source, UUID ticketId) {
        super(source);
        this.ticketId = ticketId;
    }
}
