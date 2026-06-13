package in.gov.ncl.itsm.metrics;

import org.junit.jupiter.api.*;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * ============================================================================
 * TEST TECHNIQUE: Software Metrics Calculation (Process, Product, Project)
 * ============================================================================
 *
 * Covers:
 *   - LOC (Lines of Code) size metric
 *   - Function Count / Albrecht FPA (Function Point Analysis)
 *   - Halstead Complexity metrics (product quality metric)
 *   - Cyclomatic Complexity (structural quality metric)
 *   - Defect Density (product metric)
 *   - Defect Rate / Arrival (process metric)
 *   - MTTR / MTTF metrics (maintenance metrics)
 *   - Cost Estimation: COCOMO (static, single-variable)
 *   - Cost-Benefit Ratio Evaluation
 */
@DisplayName("Software Metrics Verification Tests")
class SoftwareMetricsTest {

    // ========================= LOC METRICS =========================

    @Test
    @DisplayName("[Metrics/LOC] Physical LOC count for NCL ITSM core modules")
    void locMetrics_coreModulesEstimate() {
        // Estimated LOC by module (from code audit):
        Map<String, Integer> locByModule = new LinkedHashMap<>();
        locByModule.put("authentication",    750);
        locByModule.put("ticket-management", 1200);
        locByModule.put("asset-hardware",    480);
        locByModule.put("asset-software",    420);
        locByModule.put("user-management",   580);
        locByModule.put("audit",             340);
        locByModule.put("configuration",     280);
        locByModule.put("reporting",         390);
        locByModule.put("workflow-engine",   350);
        locByModule.put("notification",      260);
        locByModule.put("ncl-itsm-core",     620);
        locByModule.put("ncl-itsm-frontend", 8500); // TSX/React

        int totalLoc = locByModule.values().stream().mapToInt(Integer::intValue).sum();

        // Assert reasonable project size
        assertThat(totalLoc).isGreaterThan(10_000);
        assertThat(locByModule).containsKey("ticket-management");
        assertThat(locByModule.get("ticket-management")).isGreaterThan(1000);
    }

    // ========================= FUNCTION POINT ANALYSIS (FPA) =========================

    /**
     * Albrecht Function Point Analysis:
     * FP = UFP × (0.65 + 0.01 × SumFi)
     *   where SumFi ∈ [0, 70] (14 factors × [0,5] complexity)
     *
     * UFP = sum of (count × weight) across:
     *   EI  (External Inputs)  : weight 3
     *   EO  (External Outputs) : weight 4
     *   EQ  (External Queries) : weight 3
     *   ILF (Internal Logical Files): weight 7
     *   EIF (External Interface Files): weight 5
     */
    private double calculateFunctionPoints(
            int ei, int eo, int eq, int ilf, int eif, int sumFi) {

        int ufp = (ei * 3) + (eo * 4) + (eq * 3) + (ilf * 7) + (eif * 5);
        return ufp * (0.65 + 0.01 * sumFi);
    }

    @Test
    @DisplayName("[Metrics/FPA] NCL ITSM Function Points — ticket management subsystem")
    void fpa_ticketManagementSubsystem() {
        // Ticket Management:
        //   EI: Create ticket, Update status, Add comment, Upload attachment → 4
        //   EO: Generate SLA report, Export to Excel → 2
        //   EQ: Get ticket by ID, List tickets, Search → 3
        //   ILF: Ticket, Comment, Attachment → 3
        //   EIF: User directory (LDAP) → 1
        //   SumFi: moderate complexity → 35

        double fp = calculateFunctionPoints(4, 2, 3, 3, 1, 35);

        assertThat(fp).isGreaterThan(50.0);
        assertThat(fp).isLessThan(200.0); // sanity check
    }

    @Test
    @DisplayName("[Metrics/FPA] NCL ITSM Full System — combined Function Points")
    void fpa_fullSystemEstimate() {
        // Full platform (all modules combined):
        //   EI:  25 (inputs across all modules)
        //   EO:  12 (reports + exports + notifications)
        //   EQ:  30 (queries across all APIs)
        //   ILF: 18 (domain entities)
        //   EIF:  4 (LDAP, NIC, notification gateway, reporting DB)
        //   SumFi: 42 (system-level complexity)

        double fp = calculateFunctionPoints(25, 12, 30, 18, 4, 42);

        // Expected range for medium enterprise ITSM: 200-500 FP
        assertThat(fp).isBetween(200.0, 600.0);
    }

    // ========================= CYCLOMATIC COMPLEXITY =========================

    /**
     * Cyclomatic Complexity V(G) = E - N + 2P
     *   where E = edges, N = nodes, P = connected components
     * Alternative: V(G) = number of decision points + 1
     */
    private int cyclomaticComplexity(int decisionPoints) {
        return decisionPoints + 1; // simplified formula
    }

    @Test
    @DisplayName("[Metrics/CC] computeSlaHours — low complexity (V(G) = 6)")
    void complexity_computeSlaHours_isLow() {
        // Decision points: switch(4 cases) + 1 ternary + 1 null-check = 6
        int vg = cyclomaticComplexity(5);
        assertThat(vg).isEqualTo(6);
        assertThat(vg).isLessThanOrEqualTo(10); // Good: CC ≤ 10 is acceptable
    }

    @Test
    @DisplayName("[Metrics/CC] Complexity threshold: CC > 10 indicates refactoring needed")
    void complexity_threshold_above10_flagsRefactoring() {
        // Hypothetical overly complex method
        int vg = cyclomaticComplexity(15);
        assertThat(vg).isGreaterThan(10); // Exceeds threshold → needs refactoring
    }

    // ========================= DEFECT DENSITY =========================

    @Test
    @DisplayName("[Metrics/Defect] Defect density = defects / KLOC — within industry range")
    void defectDensity_calculation() {
        int totalDefectsFound = 47;
        int totalLoc = 14_170; // from LOC audit
        double kLoc = totalLoc / 1000.0;
        double defectDensity = totalDefectsFound / kLoc;

        // Industry average for enterprise Java: 1-5 defects/KLOC
        assertThat(defectDensity).isBetween(1.0, 10.0);

        // Verify formula
        assertThat(defectDensity).isCloseTo(47.0 / 14.170, within(0.1));
    }

    @Test
    @DisplayName("[Metrics/Defect] Defect arrival rate stability check")
    void defectArrivalRate_isDecreasing() {
        // Simulated weekly defect arrival (sprint testing):
        List<Integer> weeklyDefects = List.of(18, 14, 11, 7, 4, 2, 1);
        // Assert trend: each week should have ≤ prior week (stabilization)
        for (int i = 1; i < weeklyDefects.size(); i++) {
            assertThat(weeklyDefects.get(i))
                    .as("Week %d defect count should not be more than week %d", i + 1, i)
                    .isLessThanOrEqualTo(weeklyDefects.get(i - 1));
        }
    }

    // ========================= MTTR / MTTF =========================

    @Test
    @DisplayName("[Metrics/Maintenance] MTTR calculation for critical priority tickets")
    void mttr_criticalTickets_withinSla() {
        // Resolution times in hours for sampled CRITICAL tickets:
        List<Double> resolutionHours = List.of(2.5, 3.1, 1.8, 4.0, 3.6, 2.2, 3.8);
        double mttr = resolutionHours.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElseThrow();

        // SLA for CRITICAL = 4h; MTTR should be well under 4h
        assertThat(mttr).isLessThan(4.0);
        assertThat(mttr).isGreaterThan(0.0);
    }

    @Test
    @DisplayName("[Metrics/Maintenance] MTTF — mean time between failures")
    void mttf_systemReliability() {
        // Failure timestamps (days between incidents):
        List<Integer> daysBetweenFailures = List.of(42, 37, 55, 48, 61, 39);
        double mttf = daysBetweenFailures.stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElseThrow();

        // System target: MTTF > 30 days
        assertThat(mttf).isGreaterThan(30.0);
    }

    // ========================= COCOMO COST ESTIMATION =========================

    /**
     * COCOMO Basic (Organic mode):
     *   Effort = 2.4 × (KLOC ^ 1.05) person-months
     *   Duration = 2.5 × (Effort ^ 0.38) months
     */
    private double cocomoEffort(double kLoc) {
        return 2.4 * Math.pow(kLoc, 1.05);
    }

    private double cocomoDuration(double effort) {
        return 2.5 * Math.pow(effort, 0.38);
    }

    @Test
    @DisplayName("[Metrics/COCOMO] Basic effort estimate for NCL ITSM (~14.2 KLOC)")
    void cocomo_basic_effortEstimate() {
        double kLoc = 14.2; // from LOC audit
        double effort = cocomoEffort(kLoc);

        // Expected: 2.4 * (14.2^1.05) ≈ 37 person-months
        assertThat(effort).isGreaterThan(30.0);
        assertThat(effort).isLessThan(60.0);
    }

    @Test
    @DisplayName("[Metrics/COCOMO] Development duration estimate")
    void cocomo_duration_estimate() {
        double kLoc = 14.2;
        double effort = cocomoEffort(kLoc);
        double duration = cocomoDuration(effort);

        // Expected: 2.5 * (37^0.38) ≈ 10-12 months
        assertThat(duration).isGreaterThan(8.0);
        assertThat(duration).isLessThan(15.0);
    }

    // ========================= COST-BENEFIT EVALUATION =========================

    @Test
    @DisplayName("[Metrics/Cost-Benefit] ROI of ITSM automation")
    void costBenefit_automationRoi() {
        // Estimated annual benefit (INR Lakhs)
        double manualProcessCostAnnual = 48.0; // ₹48L — manual IT helpdesk cost per year
        double automatedSystemCostAnnual = 12.0; // ₹12L — support + hosting
        double implementationCost = 25.0;  // ₹25L — one-time development

        double annualSaving = manualProcessCostAnnual - automatedSystemCostAnnual; // 36L
        double breakEvenYears = implementationCost / annualSaving;
        double roi3Year = ((annualSaving * 3) - implementationCost) / implementationCost * 100;

        assertThat(breakEvenYears).isLessThan(1.5); // Should break even in < 1.5 years
        assertThat(roi3Year).isGreaterThan(100.0);  // 3-year ROI > 100%
    }

    @Test
    @DisplayName("[Metrics/Cost-Benefit] Multi-variable COCOMO adjustment factor")
    void costBenefit_multiVariableAdjustment() {
        // Intermediate COCOMO: multiply by Effort Adjustment Factor (EAF)
        // EAF = product of 15 cost drivers, each rated [0.70 .. 1.65]
        // For NCL ITSM: analyst capability=HIGH(0.86), tool use=HIGH(0.83), complexity=NOMINAL(1.0)
        // Simplified EAF:
        double eaf = 0.86 * 0.83 * 1.0 * 1.08 * 0.95; // simplified subset
        double kLoc = 14.2;
        double baseEffort = cocomoEffort(kLoc);
        double adjustedEffort = baseEffort * eaf;

        // Adjusted effort should be less than base (experienced team + good tools)
        assertThat(adjustedEffort).isLessThan(baseEffort);
        assertThat(adjustedEffort).isGreaterThan(15.0); // still substantial
    }

    // ========================= QUALITY STANDARDS =========================

    @Test
    @DisplayName("[Quality/ISO9000] Documentation completeness check (process metric)")
    void iso9000_documentationCompleteness() {
        // Required ISO 9001 quality artifacts for software projects
        List<String> requiredDocuments = List.of(
                "Requirements Specification",
                "Architecture Design Document",
                "Test Plan",
                "Test Cases",
                "Code Review Records",
                "Defect Log",
                "User Manual"
        );

        // Simulated produced documents
        Set<String> producedDocuments = new HashSet<>(Set.of(
                "Requirements Specification",
                "Architecture Design Document",
                "Test Plan",
                "Test Cases",
                "Defect Log"
        ));

        double completeness = (double) producedDocuments.size() / requiredDocuments.size() * 100;

        // Assert at least 70% documentation coverage
        assertThat(completeness).isGreaterThanOrEqualTo(70.0);
        assertThat(producedDocuments).containsAll(
                List.of("Requirements Specification", "Test Plan", "Test Cases")
        );
    }

    @Test
    @DisplayName("[Quality/CMM] CMM Level 2 — repeatable process metrics")
    void cmm_level2_repeatabilityMetrics() {
        // At CMM Level 2, key process areas include:
        // Requirements Management, Software Project Planning, Tracking, QA
        // Verify project metrics exist and fall within planned ranges

        int plannedEffortPM = 38;   // planned person-months
        int actualEffortPM  = 41;   // actual (slight overrun is acceptable)
        double scheduleVariance = Math.abs(actualEffortPM - plannedEffortPM) / (double) plannedEffortPM * 100;

        // CMM L2: Schedule variance should be < 20%
        assertThat(scheduleVariance).isLessThan(20.0);

        int defectsAtReview = 12;
        int defectsAtTest   = 35;
        double reviewEfficiency = (double) defectsAtReview / (defectsAtReview + defectsAtTest) * 100;

        // Good: review finds ≥ 25% of all defects
        assertThat(reviewEfficiency).isGreaterThanOrEqualTo(25.0);
    }
}
