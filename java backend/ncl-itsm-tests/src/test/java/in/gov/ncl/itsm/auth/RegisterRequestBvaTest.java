package in.gov.ncl.itsm.auth;

import in.gov.ncl.itsm.auth.api.dto.RegisterRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================
 * TEST CLASS: RegisterRequestBvaTest
 * ============================================================
 * TECHNIQUES COVERED:
 *  1. Black-Box Testing   — no internal code knowledge used
 *  2. Boundary Value Analysis (BVA) — min/max/just-inside/just-outside
 *  3. Equivalence Class Testing — valid/invalid partitions
 *  4. Functional Testing  — validates each constraint annotation
 *
 * FIELD BOUNDARIES:
 *  - Mobile:     exactly 10 digits             (BVA: 9, 10, 11)
 *  - EisNumber:  4–20 alphanumeric chars       (BVA: 3, 4, 20, 21)
 *  - Password:   min 6 characters              (BVA: 5, 6, 7)
 *  - Email:      valid RFC-5322 format
 * ============================================================
 */
@DisplayName("Black-Box | BVA | Equivalence Class — RegisterRequest Validation")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class RegisterRequestBvaTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private RegisterRequest validRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setFullName("Test User");
        r.setEmail("test@ncl.gov.in");
        r.setMobile("9876543210");
        r.setUsername("testuser01");
        r.setEisNumber("NCL12345");
        r.setPassword("Pass@123");
        r.setConfirmPassword("Pass@123");
        return r;
    }

    private boolean hasViolationOn(Set<ConstraintViolation<RegisterRequest>> violations, String field) {
        return violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals(field));
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 1 — EQUIVALENCE CLASS: Valid Partition (all fields valid)
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(1)
    @DisplayName("[EC-Valid] All fields in valid partition → 0 violations")
    void ec_allValid_noViolations() {
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(validRequest());
        assertEquals(0, violations.size(),
            "Valid request should produce zero constraint violations");
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 2 — BVA: Mobile Number (10 digits exactly)
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(2)
    @DisplayName("[BVA-Mobile] 10 digits — ON boundary → VALID")
    void bva_mobile_exactlyTen_valid() {
        RegisterRequest r = validRequest();
        r.setMobile("9876543210"); // exactly 10
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test @Order(3)
    @DisplayName("[BVA-Mobile] 9 digits — BELOW boundary → INVALID")
    void bva_mobile_nine_invalid() {
        RegisterRequest r = validRequest();
        r.setMobile("987654321"); // 9 digits
        assertTrue(hasViolationOn(validator.validate(r), "mobile"));
    }

    @Test @Order(4)
    @DisplayName("[BVA-Mobile] 11 digits — ABOVE boundary → INVALID")
    void bva_mobile_eleven_invalid() {
        RegisterRequest r = validRequest();
        r.setMobile("98765432100"); // 11 digits
        assertTrue(hasViolationOn(validator.validate(r), "mobile"));
    }

    @Test @Order(5)
    @DisplayName("[EC-Mobile] Non-numeric — INVALID partition → violation")
    void ec_mobile_nonNumeric_invalid() {
        RegisterRequest r = validRequest();
        r.setMobile("ABCDEFGHIJ");
        assertTrue(hasViolationOn(validator.validate(r), "mobile"));
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 3 — BVA: Employee ID (4–20 alphanumeric chars)
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(6)
    @DisplayName("[BVA-EIS] 4 chars — ON lower boundary → VALID")
    void bva_eis_four_valid() {
        RegisterRequest r = validRequest();
        r.setEisNumber("AB12");
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test @Order(7)
    @DisplayName("[BVA-EIS] 3 chars — BELOW lower boundary → INVALID")
    void bva_eis_three_invalid() {
        RegisterRequest r = validRequest();
        r.setEisNumber("AB1");
        assertTrue(hasViolationOn(validator.validate(r), "eisNumber"));
    }

    @Test @Order(8)
    @DisplayName("[BVA-EIS] 20 chars — ON upper boundary → VALID")
    void bva_eis_twenty_valid() {
        RegisterRequest r = validRequest();
        r.setEisNumber("ABCDEFGHIJ1234567890");
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test @Order(9)
    @DisplayName("[BVA-EIS] 21 chars — ABOVE upper boundary → INVALID")
    void bva_eis_twentyOne_invalid() {
        RegisterRequest r = validRequest();
        r.setEisNumber("ABCDEFGHIJ12345678901");
        assertTrue(hasViolationOn(validator.validate(r), "eisNumber"));
    }

    @ParameterizedTest @Order(10)
    @ValueSource(strings = {"NCL123", "EMP9999", "12345678", "A1B2C3D4"})
    @DisplayName("[EC-EIS] Various valid alphanumeric formats → all VALID")
    void ec_eis_validAlphanumericFormats(String eis) {
        RegisterRequest r = validRequest();
        r.setEisNumber(eis);
        assertTrue(validator.validate(r).isEmpty(), "EIS '" + eis + "' should be valid");
    }

    @ParameterizedTest @Order(11)
    @ValueSource(strings = {"NCL-123", "EMP_999", "NCL 001", "NCL@007"})
    @DisplayName("[EC-EIS] Special characters — INVALID partition → violation")
    void ec_eis_specialChars_invalid(String eis) {
        RegisterRequest r = validRequest();
        r.setEisNumber(eis);
        assertTrue(hasViolationOn(validator.validate(r), "eisNumber"),
            "EIS '" + eis + "' with special chars should fail");
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 4 — BVA: Password (min 6 characters)
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(12)
    @DisplayName("[BVA-Password] 6 chars — ON lower boundary → VALID")
    void bva_password_six_valid() {
        RegisterRequest r = validRequest();
        r.setPassword("Abc@12");
        r.setConfirmPassword("Abc@12");
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test @Order(13)
    @DisplayName("[BVA-Password] 5 chars — BELOW boundary → INVALID")
    void bva_password_five_invalid() {
        RegisterRequest r = validRequest();
        r.setPassword("Ab@12");
        r.setConfirmPassword("Ab@12");
        assertTrue(hasViolationOn(validator.validate(r), "password"));
    }

    @Test @Order(14)
    @DisplayName("[BVA-Password] 7 chars — JUST ABOVE boundary → VALID")
    void bva_password_seven_valid() {
        RegisterRequest r = validRequest();
        r.setPassword("Abc@123");
        r.setConfirmPassword("Abc@123");
        assertTrue(validator.validate(r).isEmpty());
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 5 — EQUIVALENCE CLASS: Email Format
    // ══════════════════════════════════════════════════════════════════════

    @ParameterizedTest @Order(15)
    @ValueSource(strings = {"user@ncl.gov.in", "emp.name@dept.ncl.in", "abc123@ncl.gov.in"})
    @DisplayName("[EC-Email] Valid email formats → no violation")
    void ec_email_validFormats(String email) {
        RegisterRequest r = validRequest();
        r.setEmail(email);
        assertFalse(hasViolationOn(validator.validate(r), "email"));
    }

    @ParameterizedTest @Order(16)
    @ValueSource(strings = {"notanemail", "missing@", "@nodomain.com", "no-at-sign"})
    @DisplayName("[EC-Email] Invalid email formats → violation on email field")
    void ec_email_invalidFormats(String email) {
        RegisterRequest r = validRequest();
        r.setEmail(email);
        assertTrue(hasViolationOn(validator.validate(r), "email"),
            "Email '" + email + "' should fail validation");
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 6 — NULL / BLANK FIELD TESTS (Equivalence: empty partition)
    // ══════════════════════════════════════════════════════════════════════

    @Test @Order(17)
    @DisplayName("[EC-Blank] Null fullName → violation on fullName")
    void ec_nullFullName_violation() {
        RegisterRequest r = validRequest();
        r.setFullName(null);
        assertTrue(hasViolationOn(validator.validate(r), "fullName"));
    }

    @Test @Order(18)
    @DisplayName("[EC-Blank] Empty username → violation on username")
    void ec_emptyUsername_violation() {
        RegisterRequest r = validRequest();
        r.setUsername("");
        assertTrue(hasViolationOn(validator.validate(r), "username"));
    }

    @Test @Order(19)
    @DisplayName("[EC-Blank] Null email → violation on email")
    void ec_nullEmail_violation() {
        RegisterRequest r = validRequest();
        r.setEmail(null);
        assertTrue(hasViolationOn(validator.validate(r), "email"));
    }

    @Test @Order(20)
    @DisplayName("[EC-Blank] Null mobile → violation on mobile")
    void ec_nullMobile_violation() {
        RegisterRequest r = validRequest();
        r.setMobile(null);
        assertTrue(hasViolationOn(validator.validate(r), "mobile"));
    }
}
