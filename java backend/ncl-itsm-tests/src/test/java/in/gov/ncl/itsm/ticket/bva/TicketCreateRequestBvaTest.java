package in.gov.ncl.itsm.ticket.bva;

import in.gov.ncl.itsm.ticket.api.dto.TicketCreateRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ============================================================================
 * TEST TECHNIQUE: Boundary Value Analysis (BVA) + Equivalence Class Testing
 * ============================================================================
 * Domain: TicketCreateRequest — the primary ticket submission DTO.
 *
 * Fields under analysis:
 *   summary    : @Size(max=100)   → [1..100] valid, 0 / 101+ invalid
 *   description: @Size(min=20, max=1000) → [20..1000] valid, [1..19] / [1001+] invalid
 *
 * Equivalence Partitions (EP):
 *   EP1 (summary) : empty / null  → INVALID
 *   EP2 (summary) : 1–100 chars   → VALID
 *   EP3 (summary) : 101+ chars    → INVALID
 *
 *   EP4 (description) : null / empty   → INVALID
 *   EP5 (description) : 1–19 chars     → INVALID  (too short)
 *   EP6 (description) : 20–1000 chars  → VALID
 *   EP7 (description) : 1001+ chars    → INVALID  (too long)
 *
 * BVA (two-value) test points:
 *   summary    : 0, 1, 99, 100, 101
 *   description: 0, 1, 19, 20, 999, 1000, 1001
 */
@DisplayName("BVA + Equivalence Class Tests — TicketCreateRequest")
class TicketCreateRequestBvaTest {

    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // -----------------------------------------------------------------------
    // Helper
    // -----------------------------------------------------------------------
    private TicketCreateRequest buildRequest(String summary, String description) {
        return new TicketCreateRequest(
                "Turbine Maintenance",   // category — valid
                "Mechanical",            // subCategory
                "HIGH",                  // impactLevel — valid
                summary,
                description,
                "TX-99012",              // serialNumber
                "Bay 7"                  // location
        );
    }

    private boolean isValid(TicketCreateRequest req) {
        return validator.validate(req).isEmpty();
    }

    private boolean hasViolationOn(TicketCreateRequest req, String field) {
        Set<ConstraintViolation<TicketCreateRequest>> violations = validator.validate(req);
        return violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals(field));
    }

    // ========================= SUMMARY BVA =========================

    @Test
    @DisplayName("[EP1/BVA] Summary: null → INVALID (NotBlank)")
    void summary_null_isInvalid() {
        var req = buildRequest(null, "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isTrue();
    }

    @Test
    @DisplayName("[EP1/BVA] Summary: empty string → INVALID (NotBlank)")
    void summary_empty_isInvalid() {
        var req = buildRequest("", "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isTrue();
    }

    @Test
    @DisplayName("[EP2/BVA] Summary: exactly 1 char → VALID (lower boundary)")
    void summary_1char_isValid() {
        var req = buildRequest("A", "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isFalse();
    }

    @Test
    @DisplayName("[EP2/BVA] Summary: 99 chars → VALID (just below max)")
    void summary_99chars_isValid() {
        var req = buildRequest("A".repeat(99), "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isFalse();
    }

    @Test
    @DisplayName("[EP2/BVA] Summary: exactly 100 chars → VALID (at max boundary)")
    void summary_100chars_isValid() {
        var req = buildRequest("A".repeat(100), "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isFalse();
    }

    @Test
    @DisplayName("[EP3/BVA] Summary: 101 chars → INVALID (exceeds max)")
    void summary_101chars_isInvalid() {
        var req = buildRequest("A".repeat(101), "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isTrue();
    }

    @Test
    @DisplayName("[EP3/BVA] Summary: 200 chars → INVALID (far beyond max)")
    void summary_200chars_isInvalid() {
        var req = buildRequest("A".repeat(200), "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isTrue();
    }

    // ========================= DESCRIPTION BVA =========================

    @Test
    @DisplayName("[EP4/BVA] Description: null → INVALID (NotBlank)")
    void description_null_isInvalid() {
        var req = buildRequest("Valid summary", null);
        assertThat(hasViolationOn(req, "description")).isTrue();
    }

    @Test
    @DisplayName("[EP4/BVA] Description: empty → INVALID (NotBlank)")
    void description_empty_isInvalid() {
        var req = buildRequest("Valid summary", "");
        assertThat(hasViolationOn(req, "description")).isTrue();
    }

    @Test
    @DisplayName("[EP5/BVA] Description: 1 char → INVALID (below min=20)")
    void description_1char_isInvalid() {
        var req = buildRequest("Valid summary", "A");
        assertThat(hasViolationOn(req, "description")).isTrue();
    }

    @Test
    @DisplayName("[EP5/BVA] Description: 19 chars → INVALID (just below min boundary)")
    void description_19chars_isInvalid() {
        var req = buildRequest("Valid summary", "A".repeat(19));
        assertThat(hasViolationOn(req, "description")).isTrue();
    }

    @Test
    @DisplayName("[EP6/BVA] Description: 20 chars → VALID (at min boundary)")
    void description_20chars_isValid() {
        var req = buildRequest("Valid summary", "A".repeat(20));
        assertThat(hasViolationOn(req, "description")).isFalse();
    }

    @Test
    @DisplayName("[EP6/BVA] Description: 21 chars → VALID (just above min)")
    void description_21chars_isValid() {
        var req = buildRequest("Valid summary", "A".repeat(21));
        assertThat(hasViolationOn(req, "description")).isFalse();
    }

    @Test
    @DisplayName("[EP6/BVA] Description: 999 chars → VALID (just below max)")
    void description_999chars_isValid() {
        var req = buildRequest("Valid summary", "A".repeat(999));
        assertThat(hasViolationOn(req, "description")).isFalse();
    }

    @Test
    @DisplayName("[EP6/BVA] Description: exactly 1000 chars → VALID (at max boundary)")
    void description_1000chars_isValid() {
        var req = buildRequest("Valid summary", "A".repeat(1000));
        assertThat(hasViolationOn(req, "description")).isFalse();
    }

    @Test
    @DisplayName("[EP7/BVA] Description: 1001 chars → INVALID (just beyond max)")
    void description_1001chars_isInvalid() {
        var req = buildRequest("Valid summary", "A".repeat(1001));
        assertThat(hasViolationOn(req, "description")).isTrue();
    }

    @Test
    @DisplayName("[EP7/BVA] Description: 5000 chars → INVALID (far beyond max)")
    void description_5000chars_isInvalid() {
        var req = buildRequest("Valid summary", "A".repeat(5000));
        assertThat(hasViolationOn(req, "description")).isTrue();
    }

    // ========================= COMBINED VALID =========================

    @Test
    @DisplayName("[Happy Path] All fields valid → no violations")
    void allFieldsValid_noViolations() {
        var req = buildRequest("Turbine Assembly Vibration", "A".repeat(50));
        assertThat(isValid(req)).isTrue();
    }

    // ========================= PARAMETERIZED ECP =========================

    @ParameterizedTest(name = "[ECP/BVA] Summary length={0} → expect valid={1}")
    @CsvSource({
        "0,  false",
        "1,  true",
        "50, true",
        "100,true",
        "101,false",
        "500,false"
    })
    @DisplayName("[Parameterized] Summary length equivalence classes")
    void parameterized_summaryLength(int length, boolean expectedValid) {
        String summary = length == 0 ? "" : "A".repeat(length);
        var req = buildRequest(summary, "A".repeat(20));
        assertThat(hasViolationOn(req, "summary")).isEqualTo(!expectedValid);
    }

    @ParameterizedTest(name = "[ECP/BVA] Description length={0} → expect valid={1}")
    @CsvSource({
        "0,    false",
        "1,    false",
        "19,   false",
        "20,   true",
        "500,  true",
        "1000, true",
        "1001, false",
        "2000, false"
    })
    @DisplayName("[Parameterized] Description length equivalence classes")
    void parameterized_descriptionLength(int length, boolean expectedValid) {
        String desc = length == 0 ? "" : "A".repeat(length);
        var req = buildRequest("Valid summary here", desc);
        assertThat(hasViolationOn(req, "description")).isEqualTo(!expectedValid);
    }

    // ========================= NULL/EMPTY SOURCES =========================

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("[ECP] Category null or empty → INVALID")
    void category_nullOrEmpty_isInvalid(String category) {
        var req = new TicketCreateRequest(category, null, "HIGH", "Valid summary", "A".repeat(30), null, null);
        assertThat(hasViolationOn(req, "category")).isTrue();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("[ECP] ImpactLevel null or empty → INVALID")
    void impactLevel_nullOrEmpty_isInvalid(String impact) {
        var req = new TicketCreateRequest("Category", null, impact, "Valid summary", "A".repeat(30), null, null);
        assertThat(hasViolationOn(req, "impactLevel")).isTrue();
    }
}
