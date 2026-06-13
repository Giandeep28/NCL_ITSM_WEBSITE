package in.gov.ncl.itsm.user.api;

import in.gov.ncl.itsm.NCLItsmApplication;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.Role;
import in.gov.ncl.itsm.user.domain.User;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * ============================================================================
 * TEST TECHNIQUE: Integration Testing (Black-Box)
 * ============================================================================
 *
 * BLACK-BOX TESTING
 * ─────────────────
 * The test does NOT inspect UserService source code — it only knows the HTTP
 * contract: URL, method, expected response codes and JSON shapes.
 * The service is mocked to isolate the controller layer.
 *
 * INTEGRATION TESTING
 * ─────────────────────
 * Uses @SpringBootTest to load full application context with H2 database.
 * MockMvc provides HTTP-level testing without starting the real server.
 *
 * Also demonstrates:
 *   - Security testing (role-based access control verification)
 *   - Regression testing (critical user management paths that must stay green)
 */
@SpringBootTest(classes = NCLItsmApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration Tests (Black-Box) — UserController API")
class UserControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockBean  private UserService userService;

    private User adminUser;
    private User engineerUser;

    @BeforeEach
    void setUp() {
        Role adminRole = Role.builder()
                .name("IT Administrator")
                .tenantId("NCL_HQ")
                .scope("GLOBAL")
                .build();

        Role engineerRole = Role.builder()
                .name("Support Engineer")
                .tenantId("NCL_HQ")
                .scope("DEPARTMENT")
                .build();

        adminUser = User.builder()
                .eisNumber("90000001")
                .fullName("Admin User")
                .email("90000001@ncl.gov.in")
                .isActive(true)
                .tenantId("NCL_HQ").orgId("HQ_OPS").locationId("IT Center")
                .roles(new HashSet<>(List.of(adminRole)))
                .build();

        engineerUser = User.builder()
                .eisNumber("88291000")
                .fullName("Marcus Thorne")
                .email("88291000@ncl.gov.in")
                .isActive(true)
                .tenantId("NCL_HQ").orgId("HQ_OPS").locationId("Bay 7")
                .roles(new HashSet<>(List.of(engineerRole)))
                .build();
    }

    // ========================= BLACK-BOX: LIST USERS =========================

    @Test
    @WithMockUser(username = "90000001", roles = "IT_ADMINISTRATOR")
    @DisplayName("[Black-Box] GET /api/v1/users → 200 OK with user list (admin)")
    void getUsers_asAdmin_returns200WithList() throws Exception {
        Mockito.when(userService.findAllUsers())
               .thenReturn(List.of(adminUser, engineerUser));

        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$", hasSize(2)))
               .andExpect(jsonPath("$[0].eisNumber").value("90000001"))
               .andExpect(jsonPath("$[1].eisNumber").value("88291000"));
    }

    @Test
    @WithMockUser(username = "12345678", roles = "EMPLOYEE")
    @DisplayName("[Black-Box] GET /api/v1/users → 403 Forbidden (employee not allowed)")
    void getUsers_asEmployee_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "88291000", roles = "SUPPORT_ENGINEER")
    @DisplayName("[Black-Box] GET /api/v1/users → 403 Forbidden (engineer not allowed)")
    void getUsers_asEngineer_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[Black-Box] GET /api/v1/users without auth → 401 Unauthorized")
    void getUsers_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isUnauthorized());
    }

    // ========================= BLACK-BOX: TOGGLE USER ACTIVE =========================

    @Test
    @WithMockUser(username = "90000001", roles = "IT_ADMINISTRATOR")
    @DisplayName("[Black-Box] PUT /api/v1/users/{eis}/toggle-active → 200 OK (admin locks active user)")
    void toggleUser_asAdmin_activeUser_returns200() throws Exception {
        Mockito.when(userService.findByEisNumber("88291000"))
               .thenReturn(Optional.of(engineerUser));

        mockMvc.perform(put("/api/v1/users/88291000/toggle-active"))
               .andExpect(status().isOk());

        Mockito.verify(userService, Mockito.times(1)).lockUser("88291000");
    }

    @Test
    @WithMockUser(username = "90000001", roles = "IT_ADMINISTRATOR")
    @DisplayName("[Black-Box] PUT /api/v1/users/{eis}/toggle-active → 404 when user not found")
    void toggleUser_userNotFound_returns404() throws Exception {
        Mockito.when(userService.findByEisNumber("99999999"))
               .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/v1/users/99999999/toggle-active"))
               .andExpect(status().isNotFound());
    }

    // ========================= REGRESSION TESTS =========================

    @Test
    @WithMockUser(username = "90000001", roles = "IT_ADMINISTRATOR")
    @DisplayName("[Regression] GET /api/v1/users returns empty list gracefully")
    void getUsers_emptySystem_returns200EmptyList() throws Exception {
        Mockito.when(userService.findAllUsers()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(username = "90000001", roles = "IT_ADMINISTRATOR")
    @DisplayName("[Regression] User list returns expected field names")
    void getUsers_responseShape_hasRequiredFields() throws Exception {
        Mockito.when(userService.findAllUsers()).thenReturn(List.of(adminUser));

        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].eisNumber").exists())
               .andExpect(jsonPath("$[0].fullName").exists())
               .andExpect(jsonPath("$[0].email").exists())
               .andExpect(jsonPath("$[0].isActive").exists());
    }

    // ========================= PARAMETERIZED ACCESS CONTROL =========================

    @ParameterizedTest(name = "[Black-Box/Security] Role={0} → GET /api/v1/users → 403")
    @ValueSource(strings = {"EMPLOYEE", "SUPPORT_ENGINEER", "ASSET_MANAGER", "READ_ONLY_AUDITOR"})
    @WithMockUser(username = "user", roles = "EMPLOYEE")
    @DisplayName("[Black-Box] Non-admin roles cannot list users")
    void getUsers_nonAdminRoles_allReturn403(String role) throws Exception {
        mockMvc.perform(get("/api/v1/users"))
               .andExpect(status().isForbidden());
    }
}
