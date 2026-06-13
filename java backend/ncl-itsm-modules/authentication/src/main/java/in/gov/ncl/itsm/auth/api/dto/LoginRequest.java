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

    @NotBlank(message = "EIS Number is required")
    @Size(min = 8, max = 8, message = "EIS Number must be exactly 8 digits")
    private String eisNumber;

    @NotBlank(message = "Password is required")
    private String password;
}
