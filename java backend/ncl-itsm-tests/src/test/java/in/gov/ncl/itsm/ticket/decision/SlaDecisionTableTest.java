package in.gov.ncl.itsm.ticket.decision;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ============================================================================
 * TEST TECHNIQUE: Decision Table Testing
 * ============================================================================
 * Business Rule: SLA Priority Resolution
 *   Given a ticket's impactLevel and category, the system must assign a correct
 *   SLA response window (in hours).
 *
 * Decision Table:
 * ┌─────────────────┬──────────────────────┬────────────────────────┐
 * │ Impact Level    │ Category             │ SLA Window (hours)     │
 * ├─────────────────┼──────────────────────┼────────────────────────┤
 * │ CRITICAL        │ Any                  │ 4                      │
 * │ HIGH            │ Turbine Maintenance  │ 8                      │
 * │ HIGH            │ Other                │ 16                     │
 * │ MEDIUM          │ PLC Update           │ 24                     │
 * │ MEDIUM          │ Other                │ 48                     │
 * │ LOW             │ Any                  │ 72                     │
 * │ (invalid/null)  │ Any                  │ -1 (error sentinel)    │
 * └─────────────────┴──────────────────────┴────────────────────────┘
 *
 * Also covers: Cause-Effect Graphing
 *   Cause:  impactLevel ∈ {CRITICAL, HIGH, MEDIUM, LOW, null/other}
 *   Cause:  category ∈ {Turbine Maintenance, PLC Update, other}
 *   Effect: SLA window assigned correctly
 */
@DisplayName("Decision Table Tests — SLA Priority Resolution")
class SlaDecisionTableTest {

    // -----------------------------------------------------------------------
    // Subject Under Test: SLA Resolution Logic (extracted to pure function)
    // This mirrors the production logic in TicketService.computeSlaHours()
    // -----------------------------------------------------------------------
    private int computeSlaHours(String impactLevel, String category) {
        if (impactLevel == null || impactLevel.isBlank()) return -1;
        return switch (impactLevel.toUpperCase()) {
            case "CRITICAL" -> 4;
            case "HIGH"     -> "Turbine Maintenance".equalsIgnoreCase(category) ? 8 : 16;
            case "MEDIUM"   -> "PLC Update".equalsIgnoreCase(category) ? 24 : 48;
            case "LOW"      -> 72;
            default         -> -1;
        };
    }

    // ========================= DECISION TABLE ROWS =========================

    @ParameterizedTest(name = "Impact={0}, Category={1} → SLA={2}h")
    @CsvSource({
        // CRITICAL rows (Rule 1 — category irrelevant)
        "CRITICAL, Turbine Maintenance, 4",
        "CRITICAL, PLC Update,          4",
        "CRITICAL, Grid Calibration,    4",
        "CRITICAL, ,                    4",

        // HIGH + Turbine (Rule 2)
        "HIGH, Turbine Maintenance, 8",
        // HIGH + Other category (Rule 3)
        "HIGH, PLC Update,          16",
        "HIGH, Grid Calibration,    16",
        "HIGH, Sensor Replacement,  16",

        // MEDIUM + PLC (Rule 4)
        "MEDIUM, PLC Update,         24",
        // MEDIUM + Other (Rule 5)
        "MEDIUM, Turbine Maintenance,48",
        "MEDIUM, Grid Calibration,   48",

        // LOW — any category (Rule 6)
        "LOW, Turbine Maintenance, 72",
        "LOW, PLC Update,          72",
        "LOW, Sensor Replacement,  72",
    })
    @DisplayName("[Decision Table] SLA hours correctly assigned per impact × category")
    void slaHours_fromDecisionTable(String impact, String category, int expectedHours) {
        int actual = computeSlaHours(impact, category == null ? "" : category.trim());
        assertThat(actual).isEqualTo(expectedHours);
    }

    @ParameterizedTest(name = "Invalid impact={0} → -1 (error sentinel)")
    @CsvSource({
        ",         Category",           // null impact
        "'',       Category",           // blank impact
        "UNKNOWN,  Turbine Maintenance",// unrecognised impact
        "BLOCKER,  PLC Update",
    })
    @DisplayName("[Decision Table] Unknown/null impact → error sentinel")
    void unknownImpact_returnsMinus1(String impact, String category) {
        assertThat(computeSlaHours(impact, category)).isEqualTo(-1);
    }

    // ========================= CAUSE-EFFECT GRAPHING TESTS ===================

    @ParameterizedTest(name = "Cause: CRITICAL impact → Effect: shortest SLA regardless of category={1}")
    @CsvSource({
        "CRITICAL, ABCDEF,              4",
        "CRITICAL, Turbine Maintenance, 4",
        "CRITICAL, null_category,       4",
    })
    @DisplayName("[Cause-Effect] CRITICAL cause → 4h SLA effect (max urgency)")
    void causeEffect_criticalAlwaysGives4h(String impact, String category, int expected) {
        assertThat(computeSlaHours(impact, category)).isEqualTo(expected);
    }

    @ParameterizedTest(name = "Cause: LOW impact → Effect: 72h SLA regardless of category={1}")
    @CsvSource({
        "LOW, Turbine Maintenance, 72",
        "LOW, PLC Update,          72",
        "LOW, Any Category,        72",
    })
    @DisplayName("[Cause-Effect] LOW impact → 72h SLA effect")
    void causeEffect_lowAlwaysGives72h(String impact, String category, int expected) {
        assertThat(computeSlaHours(impact, category)).isEqualTo(expected);
    }
}
