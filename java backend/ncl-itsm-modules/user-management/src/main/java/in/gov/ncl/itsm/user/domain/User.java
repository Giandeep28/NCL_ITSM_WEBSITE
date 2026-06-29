package in.gov.ncl.itsm.user.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "eis_number", unique = true, nullable = false, length = 20)
    private String eisNumber;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "username", unique = true, length = 100)
    private String username;

    @Column(name = "password", length = 256)
    private String password;

    @Column(name = "mobile", length = 20)
    private String mobile;

    @Column(name = "mobile_enc", length = 256)
    private String mobileEnc;

    @Column(length = 100)
    private String designation;

    @Lob
    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Column(name = "department_id", length = 100)
    private String departmentId;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "org_id", nullable = false, length = 50)
    private String orgId;

    @Column(name = "location_id", nullable = false, length = 50)
    private String locationId;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "failed_login_count")
    @Builder.Default
    private Integer failedLoginCount = 0;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "ad_guid", length = 100)
    private String adGuid;

    @Column(name = "login_otp", length = 10)
    private String loginOtp;

    @Column(name = "login_otp_expires_at")
    private LocalDateTime loginOtpExpiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;
}
