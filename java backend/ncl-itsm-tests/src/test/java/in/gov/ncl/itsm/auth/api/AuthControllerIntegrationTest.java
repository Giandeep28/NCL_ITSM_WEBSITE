package in.gov.ncl.itsm.auth.api;

import in.gov.ncl.itsm.TestApplication;
import in.gov.ncl.itsm.auth.api.dto.LoginRequest;
import in.gov.ncl.itsm.auth.api.dto.RegisterRequest;
import in.gov.ncl.itsm.auth.api.dto.ForgotPasswordRequest;
import in.gov.ncl.itsm.auth.api.dto.ResetPasswordRequest;
import in.gov.ncl.itsm.user.domain.PasswordResetToken;
import in.gov.ncl.itsm.user.domain.User;
import in.gov.ncl.itsm.user.infrastructure.PasswordResetTokenRepository;
import in.gov.ncl.itsm.user.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TestApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Integration Tests — AuthController API")
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /register -> Successful registration with valid data")
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEisNumber("12345678");
        request.setFullName("John Doe");
        request.setEmail("john.doe@ncl.gov.in");
        request.setUsername("johndoe");
        request.setPassword("Password123!");
        request.setConfirmPassword("Password123!");
        request.setMobile("9876543210");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration successful. You can now log in."));

        Optional<User> userOpt = userRepository.findByUsername("johndoe");
        assertTrue(userOpt.isPresent());
        assertEquals("John Doe", userOpt.get().getFullName());
        assertNotNull(userOpt.get().getPassword());
        assertTrue(userOpt.get().getPassword().startsWith("$2a$") || userOpt.get().getPassword().startsWith("$2b$"));
    }

    @Test
    @DisplayName("POST /register -> Fails on mismatched passwords")
    void register_mismatchedPasswords() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEisNumber("12345678");
        request.setFullName("John Doe");
        request.setEmail("john.doe@ncl.gov.in");
        request.setUsername("johndoe");
        request.setPassword("Password123!");
        request.setConfirmPassword("DifferentPassword");
        request.setMobile("9876543210");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Passwords do not match."));
    }

    @Test
    @DisplayName("POST /login -> Successful login with username & password")
    void login_success() throws Exception {
        // Register a user first
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setEisNumber("12345678");
        regRequest.setFullName("John Doe");
        regRequest.setEmail("john.doe@ncl.gov.in");
        regRequest.setUsername("johndoe");
        regRequest.setPassword("Password123!");
        regRequest.setConfirmPassword("Password123!");
        regRequest.setMobile("9876543210");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        // Attempt login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmployeeId("johndoe");
        loginRequest.setPassword("Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("Employee"))
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.eisNumber").value("12345678"));
    }

    @Test
    @DisplayName("POST /login -> 5 failed attempts locks the account")
    void login_lockoutAfter5Attempts() throws Exception {
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setEisNumber("12345678");
        regRequest.setFullName("John Doe");
        regRequest.setEmail("john.doe@ncl.gov.in");
        regRequest.setUsername("johndoe");
        regRequest.setPassword("Password123!");
        regRequest.setConfirmPassword("Password123!");
        regRequest.setMobile("9876543210");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        LoginRequest wrongLoginRequest = new LoginRequest();
        wrongLoginRequest.setUsernameOrEmployeeId("johndoe");
        wrongLoginRequest.setPassword("WrongPassword");

        // 4 failed attempts should yield remaining attempts count
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(wrongLoginRequest)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value(containsString("attempts remaining")));
        }

        // 5th attempt should lock the account
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLoginRequest)))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.message").value(containsString("Account has been locked")));

        // 6th attempt should block immediately with locked status
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLoginRequest)))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.message").value(containsString("locked due to multiple failed attempts")));
    }

    @Test
    @DisplayName("POST /forgot-password -> Generates OTP & POST /reset-password -> Successfully resets password")
    void forgotAndResetPassword_success() throws Exception {
        // 1. Register user
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setEisNumber("12345678");
        regRequest.setFullName("John Doe");
        regRequest.setEmail("john.doe@ncl.gov.in");
        regRequest.setUsername("johndoe");
        regRequest.setPassword("Password123!");
        regRequest.setConfirmPassword("Password123!");
        regRequest.setMobile("9876543210");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        // 2. Request OTP
        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
        forgotRequest.setIdentity("johndoe");

        String responseJson = mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.simulationOtp").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String otp = objectMapper.readTree(responseJson).get("simulationOtp").asText();

        // 3. Reset password
        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setIdentity("johndoe");
        resetRequest.setOtp(otp);
        resetRequest.setNewPassword("NewSecurePassword99!");
        resetRequest.setConfirmPassword("NewSecurePassword99!");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully. You can now log in."));

        // 4. Verify login with new password succeeds
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmployeeId("johndoe");
        loginRequest.setPassword("NewSecurePassword99!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }
}
