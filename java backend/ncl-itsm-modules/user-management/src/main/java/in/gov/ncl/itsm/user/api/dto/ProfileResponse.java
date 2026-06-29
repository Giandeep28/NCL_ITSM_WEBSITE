package in.gov.ncl.itsm.user.api.dto;

import in.gov.ncl.itsm.user.domain.User;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProfileResponse {
    private UUID id;
    private String eisNumber;
    private String fullName;
    private String email;
    private String username;
    private String mobile;
    private String departmentId;
    private String designation;
    private String locationId;
    private Boolean isActive;
    private String profilePhoto;

    public static ProfileResponse from(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .eisNumber(user.getEisNumber())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .username(user.getUsername())
                .mobile(user.getMobile())
                .departmentId(user.getDepartmentId())
                .designation(user.getDesignation())
                .locationId(user.getLocationId())
                .isActive(user.getIsActive())
                .profilePhoto(user.getProfilePhoto())
                .build();
    }
}
