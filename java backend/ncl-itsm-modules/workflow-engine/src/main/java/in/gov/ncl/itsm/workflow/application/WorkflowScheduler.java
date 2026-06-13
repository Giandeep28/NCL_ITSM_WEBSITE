package in.gov.ncl.itsm.workflow.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowScheduler {

    private final TicketWorkflowService ticketWorkflowService;

    // Run every 5 minutes to check SLA breaches and auto-close resolved tickets
    @Scheduled(cron = "0 */5 * * * *")
    public void runWorkflowJobs() {
        log.info("Starting workflow scheduled jobs...");
        try {
            ticketWorkflowService.processSlaBreaches();
        } catch (Exception e) {
            log.error("Error processing SLA breaches", e);
        }

        try {
            ticketWorkflowService.processAutoClose();
        } catch (Exception e) {
            log.error("Error processing auto-close of resolved tickets", e);
        }
    }
}
