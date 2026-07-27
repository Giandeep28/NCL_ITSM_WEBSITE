package in.gov.ncl.itsm.ticket.api.dto;

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

class TicketCreateRequestUnitTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("should initialize all fields as null by default")
    void shouldInitializeAllFieldsAsNullByDefault() {
        TicketCreateRequest request = new TicketCreateRequest();

        assertEquals(null, request.getCategory());
        assertEquals(null, request.getSubCategory());
        assertEquals(null, request.getImpactLevel());
        assertEquals(null, request.getSummary());
        assertEquals(null, request.getDescription());
        assertEquals(null, request.getSerialNumber());
        assertEquals(null, request.getLocation());
    }

    @Test
    @DisplayName("should set and retrieve values through the generated accessors")
    void shouldSetAndRetrieveValuesThroughGeneratedAccessors() {
        TicketCreateRequest request = new TicketCreateRequest();
        request.setCategory("Incident");
        request.setSubCategory("Network");
        request.setImpactLevel("High");
        request.setSummary("Authentication failure");
        request.setDescription("Users are unable to sign in because the authentication service is returning 500 errors.");
        request.setSerialNumber("SN-1001");
        request.setLocation("Head Office");

        assertEquals("Incident", request.getCategory());
        assertEquals("Network", request.getSubCategory());
        assertEquals("High", request.getImpactLevel());
        assertEquals("Authentication failure", request.getSummary());
        assertEquals("Users are unable to sign in because the authentication service is returning 500 errors.", request.getDescription());
        assertEquals("SN-1001", request.getSerialNumber());
        assertEquals("Head Office", request.getLocation());
    }

    @Test
    @DisplayName("should report violations for blank required fields")
    void shouldReportViolationsForBlankRequiredFields() {
        TicketCreateRequest request = new TicketCreateRequest();
        request.setCategory(" ");
        request.setImpactLevel(" ");
        request.setSummary(" ");
        request.setDescription("short");

        Set<ConstraintViolation<TicketCreateRequest>> violations = validator.validate(request);

        assertNotNull(violations);
        assertTrue(violations.size() >= 3);
        assertTrue(violations.stream().anyMatch(v -> "category".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "impactLevel".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "summary".equals(v.getPropertyPath().toString())));
        assertTrue(violations.stream().anyMatch(v -> "description".equals(v.getPropertyPath().toString())));
    }
}
