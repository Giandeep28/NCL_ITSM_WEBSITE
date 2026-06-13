package in.gov.ncl.itsm.asset.software.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "software_deployments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoftwareDeployment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_id", nullable = false)
    private SoftwareLicense license;

    @Column(name = "asset_id")
    private UUID assetId; // References HardwareAsset(id) by ID reference

    @Column(name = "user_id")
    private UUID userId; // References User(id)

    @Column(name = "deployed_at", nullable = false)
    @Builder.Default
    private LocalDateTime deployedAt = LocalDateTime.now();

    @Column(name = "undeployed_at")
    private LocalDateTime undeployedAt;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;
}
