package in.gov.ncl.itsm.user.api.dto;

import in.gov.ncl.itsm.user.domain.User;
import lombok.Builder;
import lombok.Data;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String eisNumber;
    private String fullName;
    private String email;
    private String username;
    private String mobile;
    private String designation;
    private String departmentId;
    private String tenantId;
    private String orgId;
    private String locationId;
    private Boolean isActive;
    private Set<RoleDto> roles;

    @Data
    @Builder
    public static class RoleDto {
        private UUID id;
        private String name;
        private String tenantId;
        private String scope;
    }

    public static UserResponse from(User user) {
        if (user == null) return null;
        Set<RoleDto> roleDtos = user.getRoles() == null ? Set.of() : user.getRoles().stream()
                .map(r -> RoleDto.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .tenantId(r.getTenantId())
                        .scope(r.getScope())
                        .build())
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId())
                .eisNumber(user.getEisNumber())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .username(user.getUsername())
                .mobile(user.getMobile())
                .designation(user.getDesignation())
                .departmentId(user.getDepartmentId())
                .tenantId(user.getTenantId())
                .orgId(user.getOrgId())
                .locationId(user.getLocationId())
                .isActive(user.getIsActive())
                .roles(roleDtos)
                .build();
    }
}
