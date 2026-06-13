package in.gov.ncl.itsm.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Official Email ID is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobile;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Employee ID is required")
    @Size(min = 8, max = 8, message = "Employee ID (EIS Number) must be exactly 8 digits")
    @Pattern(regexp = "^\\d{8}$", message = "Employee ID must be numeric")
    private String eisNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;
}
