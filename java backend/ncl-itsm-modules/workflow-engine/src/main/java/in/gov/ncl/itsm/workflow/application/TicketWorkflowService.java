package in.gov.ncl.itsm.workflow.application;

import java.util.UUID;

public interface TicketWorkflowService {
    void assignTicket(UUID ticketId);
    void processSlaBreaches();
    void processAutoClose();
}
