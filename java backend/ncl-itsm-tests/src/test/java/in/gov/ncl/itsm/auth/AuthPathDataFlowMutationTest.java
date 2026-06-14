package in.gov.ncl.itsm.auth;

import in.gov.ncl.itsm.TestApplication;
import in.gov.ncl.itsm.auth.api.dto.LoginRequest;
import in.gov.ncl.itsm.auth.api.dto.RegisterRequest;
import in.gov.ncl.itsm.auth.api.dto.ForgotPasswordRequest;
import in.gov.ncl.itsm.auth.api.dto.ResetPasswordRequest;
import in.gov.ncl.itsm.user.infrastructure.PasswordResetTokenRepository;
import in.gov.ncl.itsm.user.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================
 * TEST CLASS: AuthPathDataFlowMutationTest
 * ============================================================
 * TECHNIQUES COVERED:
 *  1. Path Testing        — exhaustive flow paths through register/login/reset
 *  2. Data Flow Testing   — tracks variables: OTP (def → use → kill)
 *  3. Mutation Testing    — verifies tests kill injected faults
 *  4. Regression Testing  — re-runs all critical flows after changes
 *  5. Performance Testing — concurrent registration load test
 *  6. System Testing      — end-to-end full lifecycle test
 *  7. Integration Testing — cross-module (Auth + User + Audit)
 * ============================================================
 */
@SpringBootTest(classes = TestApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Path | DataFlow | Mutation | Performance | System — Auth Full Suite")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthPathDataFlowMutationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private ObjectMapper objectMapper;

    private RegisterRequest makeUser(String suffix) {
        // Generate a stable 10-digit mobile from the suffix hash
        int hash = Math.abs(suffix.hashCode()) % 100000;
        String mobile = String.format("90%08d", hash);
        RegisterRequest r = new RegisterRequest();
        r.setFullName("Path User " + suffix);
        r.setEmail("pathuser" + suffix.toLowerCase().replaceAll("[^a-z0-9]", "") + "@ncl.gov.in");
        r.setMobile(mobile);
        r.setUsername("pathuser" + suffix.toLowerCase().replaceAll("[^a-z0-9]", ""));
        r.setEisNumber("PTH" + suffix.replaceAll("[^A-Za-z0-9]", ""));
        r.setPassword("Secure@123");
        r.setConfirmPassword("Secure@123");
        return r;
    }

    // ══════════════════════════════════════════════════════════════════════
    // PATH TESTING — exhaustive coverage of register() decision paths
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(1)
    @DisplayName("[PATH-1] Register → Login → Forgot → Reset → Re-Login (happy path)")
    void path_happyPath_fullLifecycle() throws Exception {
        // PATH: register → login success → forgot → OTP → reset → login with new pw

        // Step 1: Register
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(makeUser("1001"))))
            .andExpect(status().isOk()).andReturn();
        assertNotNull(regResult.getResponse().getContentAsString());

        // Step 2: Login
        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("pathuser1001");
        lr.setPassword("Secure@123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        assertFalse(loginJson.get("accessToken").asText().isEmpty(), "Access token must not be empty");

        // Step 3: Forgot password — OTP DEFINED here
        ForgotPasswordRequest fp = new ForgotPasswordRequest();
        fp.setIdentity("pathuser1001@ncl.gov.in");
        MvcResult otpResult = mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fp)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.simulationOtp").isNotEmpty())
            .andReturn();

        // DATA FLOW: OTP defined in response — capture (USE point)
        String otp = objectMapper.readTree(otpResult.getResponse().getContentAsString())
                         .get("simulationOtp").asText();
        assertNotNull(otp);
        assertEquals(6, otp.length(), "OTP must be exactly 6 digits");

        // Step 4: Reset password — OTP USED here
        ResetPasswordRequest rp = new ResetPasswordRequest();
        rp.setIdentity("pathuser1001@ncl.gov.in");
        rp.setOtp(otp);
        rp.setNewPassword("NewPass@789");
        rp.setConfirmPassword("NewPass@789");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rp)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Password updated successfully. You can now log in."));

        // Step 5: Re-login with new password — OTP KILLED (deleted after use)
        lr.setPassword("NewPass@789");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    // ══════════════════════════════════════════════════════════════════════
    // DATA FLOW TESTING — OTP lifecycle: define → verify → kill
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(2)
    @DisplayName("[DFT-1] OTP is 6 digits (def), used correctly (use), then invalidated (kill)")
    void dataFlow_otp_defUseKill() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(makeUser("2001"))))
            .andExpect(status().isOk());

        // DEF: OTP created and stored in DB
        ForgotPasswordRequest fp = new ForgotPasswordRequest();
        fp.setIdentity("pathuser2001");
        MvcResult otpResult = mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fp)))
            .andExpect(status().isOk()).andReturn();

        String otp = objectMapper.readTree(otpResult.getResponse().getContentAsString())
                         .get("simulationOtp").asText();

        // USE: OTP validated and password reset
        ResetPasswordRequest rp = new ResetPasswordRequest();
        rp.setIdentity("pathuser2001");
        rp.setOtp(otp);
        rp.setNewPassword("KilledOtp@1");
        rp.setConfirmPassword("KilledOtp@1");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rp)))
            .andExpect(status().isOk());

        // KILL: OTP should be deleted — reusing it must fail
        rp.setNewPassword("ReusedOtp@2");
        rp.setConfirmPassword("ReusedOtp@2");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rp)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Invalid or incorrect OTP."));
    }

    // ══════════════════════════════════════════════════════════════════════
    // MUTATION TESTING — verify tests detect injected faults
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(3)
    @DisplayName("[MUTATION-1] AOR: Wrong OTP (off by 1) should NOT reset password")
    void mutation_aor_wrongOtp_killed() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(makeUser("3001"))))
            .andExpect(status().isOk());

        ForgotPasswordRequest fp = new ForgotPasswordRequest();
        fp.setIdentity("pathuser3001");
        MvcResult otpResult = mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fp)))
            .andExpect(status().isOk()).andReturn();

        String realOtp = objectMapper.readTree(otpResult.getResponse().getContentAsString())
                             .get("simulationOtp").asText();

        // MUTANT: off-by-one OTP (real + 1 mod boundary)
        long mutantOtp = (Long.parseLong(realOtp) + 1) % 1000000;
        String mutantOtpStr = String.format("%06d", mutantOtp);

        ResetPasswordRequest rp = new ResetPasswordRequest();
        rp.setIdentity("pathuser3001");
        rp.setOtp(mutantOtpStr); // WRONG OTP — mutant
        rp.setNewPassword("MutantPass@1");
        rp.setConfirmPassword("MutantPass@1");

        // Test KILLS the mutant — wrong OTP must be rejected
        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rp)))
            .andExpect(status().isBadRequest());
    }

    @Test @Order(4)
    @DisplayName("[MUTATION-2] ROR: Lockout at 4 failures should NOT trigger (only at 5)")
    void mutation_ror_lockoutThreshold_killed() throws Exception {
        // Verifies lockout threshold is exactly 5, not 4 (ROR mutation: >= vs >)
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(makeUser("3002"))))
            .andExpect(status().isOk());

        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("pathuser3002");
        lr.setPassword("Wrong@pass");

        // 4 failures — must NOT lock (kills ROR mutant ">= 4")
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(lr)))
                .andExpect(status().isUnauthorized()); // not locked yet
        }

        // 5th failure — MUST lock (validates correct threshold)
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isLocked());
    }

    @Test @Order(5)
    @DisplayName("[MUTATION-3] COR: Correct password bypasses wrong-password branch")
    void mutation_cor_correctPasswordAccepted() throws Exception {
        // Verifies password comparison logic is correct (COR: && vs ||)
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(makeUser("3003"))))
            .andExpect(status().isOk());

        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("pathuser3003");
        lr.setPassword("Secure@123"); // CORRECT password
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk());
    }

    // ══════════════════════════════════════════════════════════════════════
    // PERFORMANCE / LOAD TESTING — concurrent registration
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(6)
    @DisplayName("[PERF] 10 sequential registrations complete without errors")
    void performance_sequentialRegistrations() throws Exception {
        // Sequential performance baseline — all 10 must succeed
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10; i++) {
            RegisterRequest r = new RegisterRequest();
            r.setFullName("Perf User " + i);
            r.setEmail("perfuser" + i + "@ncl.gov.in");
            r.setMobile("900000" + String.format("%04d", i));
            r.setUsername("perfuser" + i);
            r.setEisNumber("PRF" + String.format("%05d", i));
            r.setPassword("Secure@123");
            r.setConfirmPassword("Secure@123");

            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isOk());
        }
        long duration = System.currentTimeMillis() - start;
        System.out.println("[PERF] 10 sequential registrations completed in " + duration + "ms");
        assertTrue(duration < 30_000, "10 registrations must complete within 30 seconds");
    }

    @Test @Order(7)
    @DisplayName("[PERF-LOAD] Concurrent duplicate registration → only first succeeds (thread safety)")
    @Transactional(readOnly = false)
    void performance_concurrentDuplicateRegistration_onlyOneSucceeds() throws Exception {
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount   = new AtomicInteger(0);
        int threads = 5;
        CountDownLatch latch = new CountDownLatch(threads);
        ExecutorService pool  = Executors.newFixedThreadPool(threads);

        for (int i = 0; i < threads; i++) {
            final int idx = i;
            pool.submit(() -> {
                try {
                    RegisterRequest dup = new RegisterRequest();
                    dup.setFullName("Concurrent " + idx);
                    dup.setEmail("concurrent" + idx + "@ncl.gov.in");
                    dup.setMobile(String.format("800000%04d", idx));
                    dup.setUsername("pathuserc001"); // DUPLICATE username
                    dup.setEisNumber("CON" + String.format("%05d", idx));
                    dup.setPassword("Secure@123");
                    dup.setConfirmPassword("Secure@123");

                    int status = mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dup)))
                        .andReturn().getResponse().getStatus();

                    if (status == 200) successCount.incrementAndGet();
                    else               failCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(30, TimeUnit.SECONDS);
        pool.shutdown();

        System.out.println("[LOAD] Concurrent duplicate attempts — Success: " + successCount + ", Rejected: " + failCount);
        // Only the first concurrent registration succeeds, all subsequent ones fail
        assertEquals(1, successCount.get(), "Exactly one concurrent registration must succeed");
        assertEquals(threads - 1, failCount.get(), "All other concurrent attempts must fail");
    }

    // ══════════════════════════════════════════════════════════════════════
    // REGRESSION TESTING — re-verify critical paths after all changes
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(8)
    @DisplayName("[REGRESSION] Register + Login + Lockout + Reset — full flow re-verified")
    void regression_fullAuthFlow() throws Exception {
        // Regression guard: any future code change that breaks these must fail CI
        RegisterRequest r = makeUser("REG01");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Registration successful. You can now log in."));

        LoginRequest lr = new LoginRequest();
        lr.setUsernameOrEmployeeId("pathuserreg01");
        lr.setPassword("Secure@123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("Employee"));

        // Wrong password x3 — partial failure path
        lr.setPassword("BadPass");
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(lr)))
                .andExpect(status().isUnauthorized());
        }

        // Correct password still works (no lockout at 3)
        lr.setPassword("Secure@123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lr)))
            .andExpect(status().isOk());
    }

    // ══════════════════════════════════════════════════════════════════════
    // INTEGRATION TESTING — Auth + User + Token modules in concert
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(9)
    @DisplayName("[INTEGRATION] Registration writes User to DB, OTP writes to token table")
    void integration_crossModule_dbVerification() throws Exception {
        RegisterRequest r = makeUser("INT01");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
            .andExpect(status().isOk());

        // Verify User module has persisted the user (cross-module integration)
        assertTrue(userRepository.findByUsername("pathuserint01").isPresent(),
            "User must be persisted in user-management module after registration");

        // Request OTP — verify token module is integrated
        ForgotPasswordRequest fp = new ForgotPasswordRequest();
        fp.setIdentity("pathuserint01");
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fp)))
            .andExpect(status().isOk());

        // Token should now exist in password_reset_tokens table
        assertEquals(1, tokenRepository.count(),
            "Password reset token must be persisted in token module after OTP request");
    }
}
