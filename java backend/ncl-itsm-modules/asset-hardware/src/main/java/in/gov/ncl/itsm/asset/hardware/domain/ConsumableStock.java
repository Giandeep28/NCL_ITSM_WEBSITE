package in.gov.ncl.itsm.asset.hardware.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "consumable_stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumableStock {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "material_code", unique = true, nullable = false, length = 50)
    private String materialCode;

    @Column(nullable = false, length = 250)
    private String description;

    @Column(name = "qty_available", nullable = false)
    @Builder.Default
    private Integer qtyAvailable = 0;

    @Column(name = "qty_reserved", nullable = false)
    @Builder.Default
    private Integer qtyReserved = 0;

    @Column(name = "reorder_level", nullable = false)
    @Builder.Default
    private Integer reorderLevel = 10;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "org_id", nullable = false, length = 50)
    private String orgId;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
