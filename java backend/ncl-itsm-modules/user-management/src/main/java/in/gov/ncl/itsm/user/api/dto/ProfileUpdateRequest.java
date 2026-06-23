package in.gov.ncl.itsm.user.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String fullName;
    private String email;
    private String mobile;
    private String designation;
    private String departmentId;
    private String password;
}
