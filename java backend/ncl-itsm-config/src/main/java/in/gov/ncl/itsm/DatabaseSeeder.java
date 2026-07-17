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

        // Seed Hardware Assets
        if (hardwareAssetRepository.count() == 0) {
            hardwareAssetRepository.save(HardwareAsset.builder()
                    .assetTag("NCL-LAP-001")
                    .category("Laptop")
                    .make("Dell")
                    .model("Latitude 5420")
                    .serialNo("DELL-5420-SN1")
                    .departmentId("IT Dept")
                    .locationId("Main Building")
                    .condition("Excellent")
                    .status("Assigned")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .procuredAt(LocalDateTime.now().minusMonths(6))
                    .build());

            hardwareAssetRepository.save(HardwareAsset.builder()
                    .assetTag("NCL-DSK-023")
                    .category("Desktop")
                    .make("HP")
                    .model("EliteDesk 800")
                    .serialNo("HP-800-SN2")
                    .departmentId("Finance")
                    .locationId("Block A")
                    .condition("Good")
                    .status("Available")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .procuredAt(LocalDateTime.now().minusYears(1))
                    .build());

            hardwareAssetRepository.save(HardwareAsset.builder()
                    .assetTag("NCL-PRN-005")
                    .category("Printer")
                    .make("HP")
                    .model("LaserJet Pro")
                    .serialNo("HP-LJP-SN3")
                    .departmentId("HR Dept")
                    .locationId("Block B")
                    .condition("Needs Repair")
                    .status("Maintenance")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .procuredAt(LocalDateTime.now().minusYears(2))
                    .build());

            hardwareAssetRepository.save(HardwareAsset.builder()
                    .assetTag("NCL-PHN-112")
                    .category("IPPhone")
                    .make("Cisco")
                    .model("8841")
                    .serialNo("CSCO-8841-SN4")
                    .departmentId("IT Dept")
                    .locationId("Main Building")
                    .condition("Excellent")
                    .status("Assigned")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .procuredAt(LocalDateTime.now().minusMonths(3))
                    .build());

            System.out.println("✅ Seeded sample Hardware Assets.");
        }

        // Seed Software Licenses
        if (softwareLicenseRepository.count() == 0) {
            softwareLicenseRepository.save(SoftwareLicense.builder()
                    .product("Microsoft Office 365")
                    .vendorId("Microsoft")
                    .licenseKeyHash("hash_o365_key")
                    .seatCount(500)
                    .allocatedCount(420)
                    .expiryDate(LocalDate.now().plusDays(200))
                    .licenseType("Subscription")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            softwareLicenseRepository.save(SoftwareLicense.builder()
                    .product("Adobe Acrobat Pro")
                    .vendorId("Adobe")
                    .licenseKeyHash("hash_adobe_key")
                    .seatCount(50)
                    .allocatedCount(45)
                    .expiryDate(LocalDate.now().plusDays(15)) // Expiring in 15 days
                    .licenseType("Volume")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            softwareLicenseRepository.save(SoftwareLicense.builder()
                    .product("Windows 11 Enterprise")
                    .vendorId("Microsoft")
                    .licenseKeyHash("hash_win11_key")
                    .seatCount(1000)
                    .allocatedCount(850)
                    .expiryDate(LocalDate.now().plusDays(800))
                    .licenseType("Volume")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            softwareLicenseRepository.save(SoftwareLicense.builder()
                    .product("AutoCAD 2026")
                    .vendorId("Autodesk")
                    .licenseKeyHash("hash_autocad_key")
                    .seatCount(10)
                    .allocatedCount(9)
                    .expiryDate(LocalDate.now().plusDays(45)) // Expiring in 45 days
                    .licenseType("Volume")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            System.out.println("✅ Seeded sample Software Licenses.");
        }

        // Seed Consumables
        if (consumableStockRepository.count() == 0) {
            consumableStockRepository.save(ConsumableStock.builder()
                    .materialCode("CON-TON-05A")
                    .description("HP 05A Black LaserJet Toner")
                    .qtyAvailable(25)
                    .qtyReserved(2)
                    .reorderLevel(10)
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            consumableStockRepository.save(ConsumableStock.builder()
                    .materialCode("CON-CAB-CAT6")
                    .description("Cat6 RJ45 Network Patch Cable 3m")
                    .qtyAvailable(150)
                    .qtyReserved(10)
                    .reorderLevel(50)
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            consumableStockRepository.save(ConsumableStock.builder()
                    .materialCode("CON-MOU-USB")
                    .description("Dell MS116 USB Optical Mouse")
                    .qtyAvailable(4) // Triggers low stock!
                    .qtyReserved(1)
                    .reorderLevel(10)
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .build());

            System.out.println("✅ Seeded sample Consumables.");
        }
    }
}

