package in.gov.ncl.itsm.config.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "configuration", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"config_key", "tenant_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Configuration {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "config_key", nullable = false, length = 100)
    private String configKey;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(nullable = false, length = 50)
    private String scope;

    @Column(length = 250)
    private String description;

    @Column(name = "last_modified_by")
    private UUID lastModifiedBy;

    @Column(name = "last_modified_at", nullable = false)
    @Builder.Default
    private LocalDateTime lastModifiedAt = LocalDateTime.now();
}
