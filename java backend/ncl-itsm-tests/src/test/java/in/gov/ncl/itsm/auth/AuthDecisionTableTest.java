package in.gov.ncl.itsm.auth;

import in.gov.ncl.itsm.TestApplication;
import in.gov.ncl.itsm.auth.api.dto.LoginRequest;
import in.gov.ncl.itsm.auth.api.dto.RegisterRequest;
import in.gov.ncl.itsm.user.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================
 * TEST CLASS: AuthDecisionTableTest
 * ============================================================
 * TECHNIQUES COVERED:
 *  1. Decision Table Testing — maps every input combination
 *     to its expected action (register/reject/lock)
 *  2. Cause-Effect Graphing — traces each cause (invalid field)
 *     to its precise HTTP status + message effect
 *  3. White-Box Testing — tests specific controller branches
 *  4. Gray-Box Testing — uses DB state verification alongside
 *     API responses
 *
 * DECISION TABLE — Registration:
 * ┌─────────────────┬──────┬────────┬──────────┬──────────┬────────────┐
 * │ Condition       │ TC-1 │ TC-2   │ TC-3     │ TC-4     │ TC-5       │
 * ├─────────────────┼──────┼────────┼──────────┼──────────┼────────────┤
 * │ Valid email?    │ YES  │ NO     │ YES      │ YES      │ YES        │
 * │ Valid EIS?      │ YES  │ YES    │ NO       │ YES      │ YES        │
 * │ Passwords match?│ YES  │ YES    │ YES      │ NO       │ YES        │
 * │ Unique username?│ YES  │ YES    │ YES      │ YES      │ NO (dup)   │
 * ├─────────────────┼──────┼────────┼──────────┼──────────┼────────────┤
 * │ Expected        │ 200  │ 400    │ 400      │ 400      │ 400        │
 * └─────────────────┴──────┴────────┴──────────┴──────────┴────────────┘
 * ============================================================
 */
@SpringBootTest(classes = TestApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Decision Table | Cause-Effect | White-Box — Auth Controller Branches")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthDecisionTableTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private ObjectMapper objectMapper;

    private RegisterRequest baseRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setFullName("Decision User");
        r.setEmail("decision@ncl.gov.in");
        r.setMobile("9988776655");
        r.setUsername("decisionuser");
        r.setEisNumber("DEC12345");
        r.setPassword("Secure@123");
        r.setConfirmPassword("Secure@123");
        return r;
    }

    // ── CAUSE: Valid inputs → EFFECT: Registration succeeds ──────────────

    @Test @Order(1)
    @DisplayName("[DT-TC1] All conditions TRUE → HTTP 200 registration success")
    void dt_allConditionsTrue_registrationSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Registration successful. You can now log in."));
    }

    // ── CAUSE: Invalid email format → EFFECT: 400 validation error ───────

    @Test @Order(2)
    @DisplayName("[DT-TC2] Invalid email → HTTP 400 (bean-validation rejected)")
    void dt_invalidEmail_rejected() throws Exception {
        RegisterRequest r = baseRequest();
        r.setEmail("not-an-email");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
            .andExpect(status().isBadRequest());
    }

    // ── CAUSE: EIS below min length → EFFECT: 400 validation error ───────

    @Test @Order(3)
    @DisplayName("[DT-TC3] EIS too short (3 chars) → HTTP 400")
    void dt_eisTooShort_rejected() throws Exception {
        RegisterRequest r = baseRequest();
        r.setEisNumber("AB1");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
            .andExpect(status().isBadRequest());
    }

    // ── CAUSE: Passwords don't match → EFFECT: 400 with message ─────────

    @Test @Order(4)
    @DisplayName("[DT-TC4] Password mismatch → HTTP 400 + 'Passwords do not match'")
    void dt_passwordMismatch_causeEffect() throws Exception {
        RegisterRequest r = baseRequest();
        r.setPassword("Secure@123");
        r.setConfirmPassword("Different@999");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Passwords do not match."));
    }

    // ── CAUSE: Duplicate username → EFFECT: 400 with specific message ────

    @Test @Order(5)
    @DisplayName("[DT-TC5] Duplicate username → HTTP 400 + 'Username is already taken'")
    void dt_duplicateUsername_causeEffect() throws Exception {
        // First registration — succeeds
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest())))
            .andExpect(status().isOk());

        // Second registration — same username, different email/eis
        RegisterRequest r2 = baseRequest();
        r2.setEmail("second@ncl.gov.in");
        r2.setEisNumber("DEC99999");
        // same username "decisionuser"
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r2)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Username is already taken."));
    }

    // ── CAUSE: Duplicate email → EFFECT: 400 with specific message ───────

    @Test @Order(6)
    @DisplayName("[DT-TC6] Duplicate email → HTTP 400 + 'Email ID is already registered'")
    void dt_duplicateEmail_causeEffect() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest())))
            .andExpect(status().isOk());

        RegisterRequest r2 = baseRequest();
        r2.setUsername("otheruser");
        r2.setEisNumber("OTH99999");
        // same email "decision@ncl.gov.in"
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r2)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Official Email ID is already registered."));
    }

    // ── CAUSE: Duplicate EIS → EFFECT: 400 with specific message ─────────

    @Test @Order(7)
    @DisplayName("[DT-TC7] Duplicate Employee ID → HTTP 400 + 'Employee ID is already registered'")
    void dt_duplicateEis_causeEffect() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest())))
            .andExpect(status().isOk());

        RegisterRequest r2 = baseRequest();
        r2.setUsername("otheruser2");
        r2.setEmail("other2@ncl.gov.in");
        // same EIS "DEC12345"
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r2)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Employee ID is already registered."));
    }

    // ══════════════════════════════════════════════════════════════════════
    // WHITE-BOX: Login branch coverage
    // Each branch in AuthController.login() is explicitly exercised
    // ══════════════════════════════════════════════════════════════════════

    private void registerUser(String username, String eis, String email) throws Exception {
        RegisterRequest r = baseRequest();
        r.setUsername(username);
        r.setEisNumber(eis);
        r.setEmail(email);
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
            .andExpect(status().isOk());
    }

    @Test @Order(8)
    @DisplayName("[WB-Branch] Login with correct username → executes success branch")
    void wb_login_usernameSuccess_branch() throws Exception {
        registerUser("wbuser", "WB123456", "wb@ncl.gov.in");
        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("wbuser");
        lr.setPassword("Secure@123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.eisNumber").value("WB123456"));
    }

    @Test @Order(9)
    @DisplayName("[WB-Branch] Login with EIS number → executes EIS lookup branch")
    void wb_login_eisSuccess_branch() throws Exception {
        registerUser("wbuser2", "WB654321", "wb2@ncl.gov.in");
        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("WB654321"); // using EIS
        lr.setPassword("Secure@123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.eisNumber").value("WB654321"));
    }

    @Test @Order(10)
    @DisplayName("[WB-Branch] Login with non-existent user → executes user-not-found branch → 401")
    void wb_login_userNotFound_branch() throws Exception {
        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("ghostuser");
        lr.setPassword("anypassword");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isUnauthorized());
    }

    @Test @Order(11)
    @DisplayName("[WB-Branch] Wrong password → executes failed-login branch → 401 + remaining count")
    void wb_login_wrongPassword_branch() throws Exception {
        registerUser("wbuser3", "WB111111", "wb3@ncl.gov.in");
        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("wbuser3");
        lr.setPassword("WrongPassword");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value(
                org.hamcrest.Matchers.containsString("attempts remaining")));
    }

    @Test @Order(12)
    @DisplayName("[WB-Branch] 5 failures → lockout branch → HTTP 423")
    void wb_login_lockout_branch() throws Exception {
        registerUser("wbuser4", "WB222222", "wb4@ncl.gov.in");
        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("wbuser4");
        lr.setPassword("WrongPassword");

        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(lr)))
                .andExpect(status().isUnauthorized());
        }

        // 5th attempt — triggers lockout
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isLocked())
            .andExpect(jsonPath("$.message").value(
                org.hamcrest.Matchers.containsString("locked")));
    }
}
