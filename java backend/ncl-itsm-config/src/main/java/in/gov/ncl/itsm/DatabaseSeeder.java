package in.gov.ncl.itsm;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import in.gov.ncl.itsm.asset.hardware.domain.HardwareAsset;
import in.gov.ncl.itsm.asset.hardware.infrastructure.HardwareAssetRepository;
import in.gov.ncl.itsm.asset.hardware.domain.ConsumableStock;
import in.gov.ncl.itsm.asset.hardware.infrastructure.ConsumableStockRepository;
import in.gov.ncl.itsm.asset.software.domain.SoftwareLicense;
import in.gov.ncl.itsm.asset.software.infrastructure.SoftwareLicenseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final HardwareAssetRepository hardwareAssetRepository;
    private final ConsumableStockRepository consumableStockRepository;
    private final SoftwareLicenseRepository softwareLicenseRepository;

    public DatabaseSeeder(UserService userService, PasswordEncoder passwordEncoder,
                          HardwareAssetRepository hardwareAssetRepository,
                          ConsumableStockRepository consumableStockRepository,
                          SoftwareLicenseRepository softwareLicenseRepository) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.hardwareAssetRepository = hardwareAssetRepository;
        this.consumableStockRepository = consumableStockRepository;
        this.softwareLicenseRepository = softwareLicenseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed user
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

        // Hardware Assets, Software Licenses, and Consumables seeding removed to keep database clean of mock data.
    }
}


