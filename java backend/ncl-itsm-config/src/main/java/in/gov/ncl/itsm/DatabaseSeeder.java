package in.gov.ncl.itsm;

import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userService.findByEisNumber("12345678").isPresent()) {
            User employee = User.builder()
                    .eisNumber("12345678")
                    .fullName("J. Henderson")
                    .email("12345678@ncl.gov.in")
                    .username("employee")
                    .password(passwordEncoder.encode("password"))
                    .mobile("9999999999")
                    .designation("Operations Lead")
                    .departmentId("Power Generation")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .locationId("Main Building")
                    .isActive(true)
                    .build();
            userService.saveUserWithRole(employee, "Employee", "NCL_HQ");
        }

        if (!userService.findByEisNumber("88291000").isPresent()) {
            User engineer = User.builder()
                    .eisNumber("88291000")
                    .fullName("Marcus Thorne")
                    .email("88291000@ncl.gov.in")
                    .username("engineer")
                    .password(passwordEncoder.encode("password"))
                    .mobile("8888888888")
                    .designation("Electrical Specialist")
                    .departmentId("Power Systems")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .locationId("Main Building")
                    .isActive(true)
                    .build();
            userService.saveUserWithRole(engineer, "Support Engineer", "NCL_HQ");
        }

        if (!userService.findByEisNumber("90000001").isPresent()) {
            User admin = User.builder()
                    .eisNumber("90000001")
                    .fullName("David Sterling")
                    .email("admin@ncl.gov.in")
                    .username("admin")
                    .password(passwordEncoder.encode("password"))
                    .mobile("7777777777")
                    .designation("IT Administrator")
                    .departmentId("IT Infrastructure")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .locationId("Main Building")
                    .isActive(true)
                    .build();
            userService.saveUserWithRole(admin, "IT Administrator", "NCL_HQ");
        }
    }
}
