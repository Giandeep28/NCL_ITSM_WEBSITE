package in.gov.ncl.itsm.auth.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private UUID id;
    private String accessToken;
    private String refreshToken;
    private String role;
    private String fullName;
    private String eisNumber;
    private String departmentId;
}
