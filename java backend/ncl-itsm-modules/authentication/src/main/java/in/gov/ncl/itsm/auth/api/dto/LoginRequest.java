package in.gov.ncl.itsm.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username or Employee ID is required")
    private String usernameOrEmployeeId;

    @NotBlank(message = "Password is required")
    private String password;
}
