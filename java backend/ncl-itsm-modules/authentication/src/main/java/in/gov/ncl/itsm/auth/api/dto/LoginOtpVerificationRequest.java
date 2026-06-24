package in.gov.ncl.itsm.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginOtpVerificationRequest {

    @NotBlank(message = "Username or Employee ID is required")
    private String usernameOrEmployeeId;

    @NotBlank(message = "OTP is required")
    private String otp;
}
