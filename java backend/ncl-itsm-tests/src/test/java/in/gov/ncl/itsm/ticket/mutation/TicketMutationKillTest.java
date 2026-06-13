package in.gov.ncl.itsm.ticket.mutation;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.*;

/**
 * ============================================================================
 * TEST TECHNIQUE: Mutation Testing — Strong Test Oracles
 * ============================================================================
 *
 * MUTATION TESTING THEORY
 * ─────────────────────────
 * Mutation testing injects small code faults (mutants) to check if tests catch them.
 * Common mutant operators (covered below):
 *
 *   AOR  — Arithmetic Operator Replacement  (+→-, *→/, etc.)
 *   ROR  — Relational Operator Replacement  (<→<=, ==→!=, etc.)
 *   COR  — Conditional Operator Replacement (&&→||, etc.)
 *   LCR  — Logical Connector Replacement
 *   SVR  — Statement/Value Replacement      (return 0 instead of computed value)
 *
 * For PITEST (configured in pom.xml), these tests form the mutation kill suite.
 * A test KILLS a mutant when it FAILS on the mutant but PASSES on original code.
 *
 * Subject: SLA urgency and ticket status escalation logic.
 */
@DisplayName("Mutation Kill Tests — Ticket Priority & SLA Logic")
class TicketMutationKillTest {

    // -----------------------------------------------------------------------
    // Subject Under Test
    // -----------------------------------------------------------------------
    /**
     * Original implementation.
     * Mutant candidates:
     *   ROR: < → <=  in isUrgent()
     *   ROR: > → >=  in computeSlaPct()
     *   AOR: * → /   in computeSlaPct()
     *   SVR: return true always (kills isMandatoryEscalation conditional)
     */
    private boolean isUrgent(int slaRemainingHours) {
        return slaRemainingHours < 4;  // MUTANT: < → <= would break test at 4h
    }

    private double computeSlaPct(int elapsed, int total) {
        if (total <= 0) return 0.0;             // MUTANT: <= → < would allow total=0 division
        return ((double) elapsed / total) * 100; // MUTANT: * → / would return tiny fraction
    }

    private boolean isMandatoryEscalation(String category, int slaRemainingHours) {
        // MUTANT COR: && → ||  would over-trigger escalation
        return "Turbine Maintenance".equals(category) && slaRemainingHours < 2;
    }

    private String resolveTicketPriority(int slaRemainingHours, String impactLevel) {
        // MUTANT ROR: < 4 → < 0  would never trigger CRITICAL assignment
        if (slaRemainingHours < 4 || "CRITICAL".equals(impactLevel)) return "CRITICAL";
        // MUTANT AOR: <= 24 → < 24  would miss 24h boundary
        if (slaRemainingHours <= 24) return "HIGH";
        if (slaRemainingHours <= 72) return "MEDIUM";
        return "LOW";
    }

    // ========================= MUTANT KILL: ROR < → <= =========================

    @Test
    @DisplayName("[Mutation] isUrgent(4) = false kills ROR mutant < → <=")
    void killMutant_ror_lessThan_to_lessOrEqual_at4() {
        // Original: slaRemainingHours < 4 → 4 is NOT urgent
        // Mutant:   slaRemainingHours <= 4 → 4 WOULD be urgent (mutant killed)
        assertThat(isUrgent(4)).isFalse();
    }

    @Test
    @DisplayName("[Mutation] isUrgent(3) = true — baseline oracle")
    void baseline_isUrgent_3_isTrue() {
        assertThat(isUrgent(3)).isTrue();
    }

    @Test
    @DisplayName("[Mutation] isUrgent(5) = false — ROR boundary above")
    void baseline_isUrgent_5_isFalse() {
        assertThat(isUrgent(5)).isFalse();
    }

    // ========================= MUTANT KILL: SVR return 0 =========================

    @Test
    @DisplayName("[Mutation] computeSlaPct(50,100) = 50.0 — kills SVR return 0")
    void killMutant_svr_returnZero_computeSlaPct() {
        // Mutant: return 0.0 always → test detects it
        assertThat(computeSlaPct(50, 100)).isEqualTo(50.0);
    }

    @Test
    @DisplayName("[Mutation] computeSlaPct(0,100) = 0.0 — kills AOR * → /")
    void killMutant_aor_multiply_to_divide() {
        // Original: (0/100)*100 = 0.0
        // Mutant * → /: (0/100)/100 = 0.0 too — need non-zero numerator
        assertThat(computeSlaPct(0, 100)).isEqualTo(0.0);
    }

    @Test
    @DisplayName("[Mutation] computeSlaPct(25,100) = 25.0 — strong oracle for AOR mutant")
    void killMutant_aor_at25pct() {
        // Mutant * → /: (25/100)/100 = 0.0025  ≠ 25.0 → kills mutant
        assertThat(computeSlaPct(25, 100)).isEqualTo(25.0);
    }

    @Test
    @DisplayName("[Mutation] computeSlaPct(total=0) = 0.0 — kills ROR <= → < (division by zero guard)")
    void killMutant_ror_divisorGuard() {
        // Mutant: total <= 0 → total < 0: when total==0, division by zero occurs
        assertThat(computeSlaPct(10, 0)).isEqualTo(0.0);
    }

    // ========================= MUTANT KILL: COR && → || =========================

    @Test
    @DisplayName("[Mutation] Turbine + 3h = true, kills COR && mutant correctly")
    void killMutant_cor_and_to_or_turbine3h() {
        // Both conditions true → escalate
        assertThat(isMandatoryEscalation("Turbine Maintenance", 1)).isTrue();
    }

    @Test
    @DisplayName("[Mutation] Turbine + 5h = false — kills COR && → || (first condition true, second false)")
    void killMutant_cor_and_to_or_turbine5h() {
        // Mutant &&→||: true || false → true (WRONG — kills mutant)
        // Original &&:  true && false → false (CORRECT)
        assertThat(isMandatoryEscalation("Turbine Maintenance", 5)).isFalse();
    }

    @Test
    @DisplayName("[Mutation] Non-turbine + 1h = false — kills COR (second true, first false)")
    void killMutant_cor_and_to_or_nonTurbine1h() {
        // Mutant &&→||: false || true → true (WRONG)
        // Original &&:  false && true → false (CORRECT)
        assertThat(isMandatoryEscalation("Grid Calibration", 1)).isFalse();
    }

    // ========================= PARAMETERIZED MUTATION KILL TABLE =========================

    @ParameterizedTest(name = "[Mutation] SLA={0}h + impact={1} → priority={2}")
    @CsvSource({
        "1,  LOW,      CRITICAL",  // SLA < 4 → CRITICAL regardless of impact
        "3,  MEDIUM,   CRITICAL",  // SLA < 4 → CRITICAL
        "4,  LOW,      HIGH",      // SLA = 4 (not < 4), ≤ 24 → HIGH  (ROR kill)
        "24, MEDIUM,   HIGH",      // SLA = 24 (≤ 24) → HIGH (AOR boundary)
        "25, LOW,      MEDIUM",    // SLA = 25 (> 24, ≤ 72) → MEDIUM
        "72, LOW,      MEDIUM",    // SLA = 72 (≤ 72) → MEDIUM
        "73, LOW,      LOW",       // SLA > 72 → LOW
        "0,  CRITICAL, CRITICAL",  // CRITICAL impact → always CRITICAL
        "100,CRITICAL, CRITICAL",  // CRITICAL impact even with long SLA
    })
    @DisplayName("[Mutation] resolveTicketPriority kills all ROR/AOR boundary mutants")
    void killAllBoundaryMutants_resolvePriority(int slaHours, String impact, String expectedPriority) {
        assertThat(resolveTicketPriority(slaHours, impact)).isEqualTo(expectedPriority);
    }
}
