package in.gov.ncl.itsm.ticket.infrastructure;

import in.gov.ncl.itsm.ticket.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    List<Ticket> findByReporterIdOrderByCreatedAtDesc(UUID reporterId);
    List<Ticket> findByEngineerIdOrderByCreatedAtDesc(UUID engineerId);
    List<Ticket> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    long countByEngineerIdAndStatusIn(UUID engineerId, List<String> statuses);
    List<Ticket> findByStatusInAndSlaDueAtBefore(List<String> statuses, java.time.LocalDateTime now);
    List<Ticket> findByStatusAndResolvedAtBefore(String status, java.time.LocalDateTime limit);
}
