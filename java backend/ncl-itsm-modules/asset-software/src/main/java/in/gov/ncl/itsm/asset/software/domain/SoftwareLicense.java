package in.gov.ncl.itsm.asset.software.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "software_licenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoftwareLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String product;

    @Column(name = "vendor_id", length = 100)
    private String vendorId;

    @Column(name = "license_key_hash", nullable = false, length = 256)
    private String licenseKeyHash;

    @Column(name = "seat_count", nullable = false)
    @Builder.Default
    private Integer seatCount = 0;

    @Column(name = "allocated_count", nullable = false)
    @Builder.Default
    private Integer allocatedCount = 0;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "license_type", nullable = false, length = 50)
    private String licenseType; // Subscription, Perpetual, OEM, Volume

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "org_id", nullable = false, length = 50)
    private String orgId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
