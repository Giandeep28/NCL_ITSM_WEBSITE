package in.gov.ncl.itsm.ticket.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "ticket_number", unique = true, nullable = false, length = 30)
    private String ticketNumber;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "sub_category", length = 50)
    private String subCategory;

    @Column(name = "impact_level", nullable = false, length = 50)
    private String impactLevel;

    @Column(nullable = false, length = 100)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false, length = 50)
    private String priority;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId; // References User(id)

    @Column(name = "engineer_id")
    private UUID engineerId; // References User(id)

    @Column(name = "queue_id", length = 50)
    private String queueId;

    @Column(name = "sla_due_at")
    private LocalDateTime slaDueAt;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "org_id", nullable = false, length = 50)
    private String orgId;

    @Column(name = "location_id", nullable = false, length = 50)
    private String locationId;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(length = 100)
    private String location;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
