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
        if (!userService.existsByUsername("admin") && !userService.existsByEisNumber("90000001")) {
            User admin = User.builder()
                    .eisNumber("90000001")
                    .fullName("System Administrator")
                    .email("admin@ncl.gov.in")
                    .username("admin")
                    .password(passwordEncoder.encode("password"))
                    .mobile("9876543210")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .locationId("Main Building")
                    .designation("IT Administrator")
                    .departmentId("IT Dept")
                    .build();

            userService.saveUserWithRole(admin, "IT Administrator", "NCL_HQ");
            System.out.println("=================================================");
            System.out.println("✅ Seeded default IT Admin account:");
            System.out.println("   Username: admin");
            System.out.println("   Password: password");
            System.out.println("   Employee ID: 90000001");
            System.out.println("=================================================");
        }
    }
}
