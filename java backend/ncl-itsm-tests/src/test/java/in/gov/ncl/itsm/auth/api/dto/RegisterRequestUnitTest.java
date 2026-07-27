package in.gov.ncl.itsm.auth.api.dto;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RegisterRequestUnitTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("should initialize all fields as null by default")
    void shouldInitializeAllFieldsAsNullByDefault() {
        RegisterRequest request = new RegisterRequest();

        assertEquals(null, request.getFullName());
        assertEquals(null, request.getEmail());
        assertEquals(null, request.getMobile());
        assertEquals(null, request.getUsername());
        assertEquals(null, request.getEisNumber());
        assertEquals(null, request.getPassword());
        assertEquals(null, request.getConfirmPassword());
        assertEquals(null, request.getRole());
        assertEquals(null, request.getDesignation());
        assertEquals(null, request.getProfilePhoto());
    }

    @Test
    @DisplayName("should set and retrieve values through the generated accessors")
    void shouldSetAndRetrieveValuesThroughGeneratedAccessors() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@ncl.gov.in");
        request.setMobile("9876543210");
        request.setUsername("testuser01");
        request.setEisNumber("NCL12345");
        request.setPassword("Pass@123");
        request.setConfirmPassword("Pass@123");
        request.setRole("ADMIN");
        request.setDesignation("Lead Engineer");
        request.setProfilePhoto("avatar.png");

        assertEquals("Test User", request.getFullName());
        assertEquals("test@ncl.gov.in", request.getEmail());
        assertEquals("9876543210", request.getMobile());
        assertEquals("testuser01", request.getUsername());
        assertEquals("NCL12345", request.getEisNumber());
        assertEquals("Pass@123", request.getPassword());
        assertEquals("Pass@123", request.getConfirmPassword());
        assertEquals("ADMIN", request.getRole());
        assertEquals("Lead Engineer", request.getDesignation());
        assertEquals("avatar.png", request.getProfilePhoto());
    }

    @Test
    @DisplayName("should report violations for blank required fields")
    void shouldReportViolationsForBlankRequiredFields() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName(" ");
        request.setEmail(" ");
        request.setMobile(" ");
        request.setUsername(" ");
        request.setEisNumber(" ");
        request.setPassword(" ");
        request.setConfirmPassword(" ");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertNotNull(violations);
        assertTrue(violations.size() >= 7);
        assertTrue(violations.stream().anyMatch(v -> "fullName".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "email".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "mobile".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "username".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "eisNumber".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "password".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "confirmPassword".equals(v.getPropertyPath().toString())));
    }
}
