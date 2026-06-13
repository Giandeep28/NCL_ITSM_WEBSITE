package in.gov.ncl.itsm.ticket.infrastructure;

import in.gov.ncl.itsm.ticket.domain.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, UUID> {
    List<TicketHistory> findByTicketIdOrderByChangedAtAsc(UUID ticketId);
}
