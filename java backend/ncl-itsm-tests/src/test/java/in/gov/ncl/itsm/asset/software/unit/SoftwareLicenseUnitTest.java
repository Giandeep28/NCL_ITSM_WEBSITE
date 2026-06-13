package in.gov.ncl.itsm.asset.software.unit;

import in.gov.ncl.itsm.asset.software.domain.SoftwareLicense;
import in.gov.ncl.itsm.asset.software.domain.SoftwareDeployment;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * ============================================================================
 * TEST TECHNIQUE: Unit Testing (White-Box) + Path Testing + Data-Flow Testing
 * ============================================================================
 *
 * WHITE-BOX PATH TESTING
 * ──────────────────────
 * Tests every independent execution path through the seat allocation logic:
 *   Path 1: allocatedCount < seatCount → allocation succeeds
 *   Path 2: allocatedCount == seatCount → allocation rejected (seats full)
 *   Path 3: allocatedCount > seatCount (corrupted state) → still rejected
 *   Path 4: seatCount == 0 → always rejected
 *
 * DATA-FLOW TESTING
 * ─────────────────
 * Tests data values through define → use chains:
 *   Define  : allocatedCount set to X via builder
 *   Use     : canAllocateSeat() reads allocatedCount and seatCount
 *   Kill    : setAllocatedCount() writes new value
 *
 * UNIT TESTING
 * ─────────────
 * Tests SoftwareLicense and SoftwareDeployment domain classes in isolation.
 */
@DisplayName("Unit Tests — SoftwareLicense & SoftwareDeployment (White-Box, Path, Data-Flow)")
class SoftwareLicenseUnitTest {

    // -----------------------------------------------------------------------
    // Subject Under Test — domain methods
    // -----------------------------------------------------------------------

    /**
     * Derived helper method (mirrors what the service layer will enforce).
     * This IS the path-under-test; white-box analysis applies here.
     */
    private boolean canAllocateSeat(SoftwareLicense license) {
        if (license.getSeatCount() == null || license.getSeatCount() <= 0) return false;
        if (license.getAllocatedCount() == null) return true;
        return license.getAllocatedCount() < license.getSeatCount();
    }

    private SoftwareLicense buildLicense(int seats, int allocated) {
        return SoftwareLicense.builder()
                .product("Windows 11 Enterprise")
                .licenseKeyHash("hash-abc-123")
                .seatCount(seats)
                .allocatedCount(allocated)
                .expiryDate(LocalDate.now().plusYears(1))
                .licenseType("Volume")
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .build();
    }

    // ========================= PATH TESTING =========================

    @Test
    @DisplayName("[Path 1] allocatedCount < seatCount → canAllocateSeat = true")
    void path1_availableSeats_canAllocate() {
        // Path: seatCount > 0 AND allocatedCount < seatCount → returns true
        SoftwareLicense license = buildLicense(100, 50);
        assertThat(canAllocateSeat(license)).isTrue();
    }

    @Test
    @DisplayName("[Path 2] allocatedCount == seatCount → canAllocateSeat = false (seats full)")
    void path2_seatsExhausted_cannotAllocate() {
        // Path: seatCount > 0 AND allocatedCount == seatCount → returns false
        SoftwareLicense license = buildLicense(50, 50);
        assertThat(canAllocateSeat(license)).isFalse();
    }

    @Test
    @DisplayName("[Path 3] allocatedCount > seatCount → canAllocateSeat = false (corrupted state)")
    void path3_overAllocated_cannotAllocate() {
        // Path: seatCount > 0 AND allocatedCount > seatCount → returns false
        SoftwareLicense license = buildLicense(10, 15);
        assertThat(canAllocateSeat(license)).isFalse();
    }

    @Test
    @DisplayName("[Path 4] seatCount = 0 → canAllocateSeat = false (zero-seat license)")
    void path4_zeroSeatLicense_cannotAllocate() {
        // Path: seatCount <= 0 → returns false immediately (early exit)
        SoftwareLicense license = buildLicense(0, 0);
        assertThat(canAllocateSeat(license)).isFalse();
    }

    @Test
    @DisplayName("[Path 4b] seatCount negative → canAllocateSeat = false")
    void path4b_negativeSeatCount_cannotAllocate() {
        SoftwareLicense license = buildLicense(-5, 0);
        assertThat(canAllocateSeat(license)).isFalse();
    }

    // ========================= DATA-FLOW TESTING =========================

    @Test
    @DisplayName("[Data-Flow] Define allocatedCount=0 → canAllocate uses 0, returns true")
    void dataFlow_define_allocated0_use_canAllocate() {
        // DEFINE: allocatedCount = 0
        SoftwareLicense license = buildLicense(10, 0);
        // USE: canAllocateSeat reads allocatedCount (0) and seatCount (10)
        assertThat(canAllocateSeat(license)).isTrue();
    }

    @Test
    @DisplayName("[Data-Flow] Define allocatedCount=X, USE it, then KILL with setter, USE again")
    void dataFlow_define_use_kill_reuse() {
        SoftwareLicense license = buildLicense(5, 4);
        // USE 1: before mutation
        assertThat(canAllocateSeat(license)).isTrue();

        // KILL (mutation): allocate one more seat
        license.setAllocatedCount(5);
        // USE 2: after mutation — seats now full
        assertThat(canAllocateSeat(license)).isFalse();
    }

    // ========================= UNIT TESTS — SoftwareLicense =========================

    @Test
    @DisplayName("[Unit] License builder defaults — allocatedCount defaults to 0")
    void license_builderDefaults_allocatedCountIsZero() {
        SoftwareLicense license = SoftwareLicense.builder()
                .product("Adobe Acrobat")
                .licenseKeyHash("hash-xyz")
                .seatCount(50)
                .expiryDate(LocalDate.now().plusMonths(6))
                .licenseType("OEM")
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .build();

        assertThat(license.getAllocatedCount()).isEqualTo(0);
        assertThat(license.getCreatedAt()).isNotNull().isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("[Unit] License expiry detection")
    void license_isExpired_whenExpiryDateIsInPast() {
        SoftwareLicense expiredLicense = buildLicense(100, 0);
        expiredLicense.setExpiryDate(LocalDate.now().minusDays(1));

        boolean isExpired = expiredLicense.getExpiryDate().isBefore(LocalDate.now());
        assertThat(isExpired).isTrue();
    }

    @Test
    @DisplayName("[Unit] License expiry detection — not yet expired")
    void license_isNotExpired_whenExpiryDateIsInFuture() {
        SoftwareLicense license = buildLicense(100, 0);
        license.setExpiryDate(LocalDate.now().plusDays(90));

        boolean isExpired = license.getExpiryDate().isBefore(LocalDate.now());
        assertThat(isExpired).isFalse();
    }

    @ParameterizedTest(name = "[BVA] Days until expiry = {0}")
    @ValueSource(ints = {0, 1, 15, 30, 60, 90, 180, 365})
    @DisplayName("[BVA/Unit] License expiry days remaining calculation")
    void license_daysRemainingBva(int daysFromNow) {
        SoftwareLicense license = buildLicense(100, 0);
        license.setExpiryDate(LocalDate.now().plusDays(daysFromNow));

        long daysRemaining = LocalDate.now().until(license.getExpiryDate()).getDays();
        assertThat(daysRemaining).isEqualTo(daysFromNow);
        assertThat(daysRemaining >= 0).isTrue();
    }

    // ========================= UNIT TESTS — SoftwareDeployment =========================

    @Test
    @DisplayName("[Unit] SoftwareDeployment builder — deployedAt defaults to now")
    void deployment_builderDefaults_deployedAtIsNow() {
        SoftwareLicense license = buildLicense(10, 0);
        SoftwareDeployment deployment = SoftwareDeployment.builder()
                .license(license)
                .tenantId("NCL_HQ")
                .build();

        assertThat(deployment.getDeployedAt())
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(deployment.getUndeployedAt()).isNull();
    }

    @Test
    @DisplayName("[Unit] SoftwareDeployment — marking as undeployed sets undeployedAt")
    void deployment_undeploy_setsUndeployedAt() {
        SoftwareLicense license = buildLicense(10, 5);
        SoftwareDeployment deployment = SoftwareDeployment.builder()
                .license(license)
                .tenantId("NCL_HQ")
                .build();

        assertThat(deployment.getUndeployedAt()).isNull();

        // Simulate undeployment
        LocalDateTime undeployTime = LocalDateTime.now();
        deployment.setUndeployedAt(undeployTime);

        assertThat(deployment.getUndeployedAt()).isEqualTo(undeployTime);
    }

    @Test
    @DisplayName("[Unit] Active deployment — undeployedAt is null means still active")
    void deployment_activeWhen_undeployedAtIsNull() {
        SoftwareDeployment dep = SoftwareDeployment.builder()
                .license(buildLicense(5, 1))
                .tenantId("NCL_HQ")
                .build();

        boolean isActive = dep.getUndeployedAt() == null;
        assertThat(isActive).isTrue();
    }

    @Test
    @DisplayName("[Unit] Inactive deployment — undeployedAt set means revoked")
    void deployment_inactiveWhen_undeployedAtIsSet() {
        SoftwareDeployment dep = SoftwareDeployment.builder()
                .license(buildLicense(5, 1))
                .tenantId("NCL_HQ")
                .undeployedAt(LocalDateTime.now().minusHours(2))
                .build();

        boolean isActive = dep.getUndeployedAt() == null;
        assertThat(isActive).isFalse();
    }

    // ========================= WHITE-BOX — SEAT ALLOCATION CORNER CASES =========================

    @Test
    @DisplayName("[White-Box] allocatedCount=seatCount-1 → last available seat")
    void whitebox_lastAvailableSeat() {
        SoftwareLicense license = buildLicense(10, 9);
        assertThat(canAllocateSeat(license)).isTrue();
        // Allocate
        license.setAllocatedCount(10);
        assertThat(canAllocateSeat(license)).isFalse();
    }

    @Test
    @DisplayName("[White-Box] Very large seat count — no integer overflow risk")
    void whitebox_largeSeatCount_noOverflow() {
        SoftwareLicense license = buildLicense(Integer.MAX_VALUE - 1, 0);
        assertThat(canAllocateSeat(license)).isTrue();
    }
}
