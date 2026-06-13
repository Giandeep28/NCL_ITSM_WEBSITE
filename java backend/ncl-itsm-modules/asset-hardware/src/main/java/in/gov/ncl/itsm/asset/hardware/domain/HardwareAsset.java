package in.gov.ncl.itsm.asset.hardware.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hardware_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HardwareAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "asset_tag", unique = true, nullable = false, length = 30)
    private String assetTag;

    @Column(nullable = false, length = 50)
    private String category; // Desktop, Laptop, Printer, IPPhone, Network, Peripherals

    @Column(nullable = false, length = 100)
    private String make;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "serial_no", nullable = false, length = 100)
    private String serialNo;

    @Column(name = "department_id", length = 100)
    private String departmentId;

    @Column(name = "assigned_user_id")
    private UUID assignedUserId; // References User(id)

    @Column(name = "location_id", nullable = false, length = 50)
    private String locationId;

    @Column(length = 50)
    private String condition;

    @Column(nullable = false, length = 50)
    private String status; // Procured, Available, Assigned, Maintenance, Retired

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "org_id", nullable = false, length = 50)
    private String orgId;

    @Column(name = "procured_at")
    private LocalDateTime procuredAt;

    @Column(name = "retired_at")
    private LocalDateTime retiredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
