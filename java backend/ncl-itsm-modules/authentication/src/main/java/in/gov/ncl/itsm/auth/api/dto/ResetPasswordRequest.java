package in.gov.ncl.itsm.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Email or Employee ID is required")
    private String identity;

    @NotBlank(message = "New Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;
}
