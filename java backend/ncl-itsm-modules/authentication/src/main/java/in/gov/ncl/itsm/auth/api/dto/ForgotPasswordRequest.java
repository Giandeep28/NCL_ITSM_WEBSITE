package in.gov.ncl.itsm.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Email or Employee ID is required")
    private String identity;
}
