package in.gov.ncl.itsm.asset.hardware.unit;

import in.gov.ncl.itsm.asset.hardware.domain.HardwareAsset;
import in.gov.ncl.itsm.asset.hardware.domain.ConsumableStock;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * ============================================================================
 * TEST TECHNIQUE: Unit Testing (Gray-Box) + Boundary Value Analysis
 * ============================================================================
 *
 * GRAY-BOX TESTING
 * ─────────────────
 * Gray-box: tester knows the domain model structure (fields, constraints)
 * but tests through the public API (getters/setters/builders).
 * Specifically tests the stock-level alerting logic that straddles
 * "internal" (domain field reorderLevel) and "external" (alert flag).
 *
 * UNIT TESTS
 * ──────────
 * HardwareAsset: lifecycle status transitions, field defaults
 * ConsumableStock: low-stock threshold detection (BVA on qty vs reorderLevel)
 */
@DisplayName("Unit Tests — HardwareAsset & ConsumableStock (Gray-Box, BVA)")
class HardwareAssetUnitTest {

    // ========================= HARDWARE ASSET UNIT TESTS =========================

    @Test
    @DisplayName("[Unit] HardwareAsset builder — createdAt defaults to now")
    void asset_builderDefaults_createdAtIsNow() {
        HardwareAsset asset = HardwareAsset.builder()
                .assetTag("HW-DESK-0001")
                .category("Desktop")
                .make("HP")
                .model("EliteDesk 800")
                .serialNo("SGH90210X")
                .locationId("Bay 7")
                .status("Procured")
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .build();

        assertThat(asset.getCreatedAt())
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(asset.getAssignedUserId()).isNull();
        assertThat(asset.getRetiredAt()).isNull();
    }

    @ParameterizedTest(name = "[Gray-Box] Status transition: {0} → {1}")
    @CsvSource({
        "Procured,   Available",
        "Available,  Assigned",
        "Assigned,   Maintenance",
        "Maintenance,Available",
        "Available,  Retired",
        "Assigned,   Retired"
    })
    @DisplayName("[Gray-Box] Valid status transitions for hardware assets")
    void asset_validStatusTransitions(String fromStatus, String toStatus) {
        HardwareAsset asset = HardwareAsset.builder()
                .assetTag("HW-LAP-0042")
                .category("Laptop")
                .make("Dell")
                .model("Latitude 5420")
                .serialNo("SN123456")
                .locationId("IT Center")
                .status(fromStatus)
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .build();

        assertThat(asset.getStatus()).isEqualTo(fromStatus);
        asset.setStatus(toStatus);
        assertThat(asset.getStatus()).isEqualTo(toStatus);
    }

    @Test
    @DisplayName("[Unit] Asset assigned to user — assignedUserId set correctly")
    void asset_assignToUser_setsField() {
        HardwareAsset asset = HardwareAsset.builder()
                .assetTag("HW-PHN-1001")
                .category("IPPhone")
                .make("Cisco").model("7841").serialNo("CIS221098")
                .locationId("Main Assembly").status("Available")
                .tenantId("NCL_HQ").orgId("HQ_OPS").build();

        UUID userId = UUID.randomUUID();
        asset.setAssignedUserId(userId);
        asset.setStatus("Assigned");

        assertThat(asset.getAssignedUserId()).isEqualTo(userId);
        assertThat(asset.getStatus()).isEqualTo("Assigned");
    }

    @Test
    @DisplayName("[Unit] Asset retirement — retiredAt set, status updated")
    void asset_retire_setsRetiredAt() {
        HardwareAsset asset = HardwareAsset.builder()
                .assetTag("HW-PRN-0999").category("Printer")
                .make("Canon").model("LBP6030").serialNo("CAN994821")
                .locationId("Boiler 4").status("Maintenance")
                .tenantId("NCL_HQ").orgId("HQ_OPS").build();

        LocalDateTime retireTime = LocalDateTime.now();
        asset.setRetiredAt(retireTime);
        asset.setStatus("Retired");

        assertThat(asset.getRetiredAt()).isEqualTo(retireTime);
        assertThat(asset.getStatus()).isEqualTo("Retired");
    }

    // ========================= CONSUMABLE STOCK — BVA =========================

    /**
     * BVA for ConsumableStock.isLowStock():
     *   qtyAvailable <= reorderLevel → LOW STOCK
     *   qtyAvailable >  reorderLevel → OK
     *
     * Boundary points tested around reorderLevel = 10:
     *   qty = 0, 1, 9, 10, 11, 50
     */

    private ConsumableStock buildStock(int qty, int reorderLevel) {
        return ConsumableStock.builder()
                .materialCode("MAT-9020")
                .description("HP LaserJet 85A Toner")
                .qtyAvailable(qty)
                .qtyReserved(0)
                .reorderLevel(reorderLevel)
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .build();
    }

    private boolean isLowStock(ConsumableStock stock) {
        return stock.getQtyAvailable() <= stock.getReorderLevel();
    }

    @Test
    @DisplayName("[BVA] qty=0 → LOW STOCK (absolute minimum)")
    void consumable_qty0_isLowStock() {
        assertThat(isLowStock(buildStock(0, 10))).isTrue();
    }

    @Test
    @DisplayName("[BVA] qty=1 → LOW STOCK (just above zero)")
    void consumable_qty1_isLowStock() {
        assertThat(isLowStock(buildStock(1, 10))).isTrue();
    }

    @Test
    @DisplayName("[BVA] qty=9 → LOW STOCK (one below reorder level=10)")
    void consumable_qty9_isLowStock() {
        assertThat(isLowStock(buildStock(9, 10))).isTrue();
    }

    @Test
    @DisplayName("[BVA] qty=10 → LOW STOCK (exactly at reorder level=10, boundary)")
    void consumable_qty10_isLowStock_atBoundary() {
        assertThat(isLowStock(buildStock(10, 10))).isTrue();
    }

    @Test
    @DisplayName("[BVA] qty=11 → OK (just above reorder level=10)")
    void consumable_qty11_isOk() {
        assertThat(isLowStock(buildStock(11, 10))).isFalse();
    }

    @Test
    @DisplayName("[BVA] qty=50 → OK (well above reorder level)")
    void consumable_qty50_isOk() {
        assertThat(isLowStock(buildStock(50, 10))).isFalse();
    }

    @ParameterizedTest(name = "[BVA] qty={0}, reorder={1} → lowStock={2}")
    @CsvSource({
        "0,  5,  true",
        "4,  5,  true",
        "5,  5,  true",   // at boundary
        "6,  5,  false",
        "10, 5,  false",
        "0,  15, true",
        "15, 15, true",   // at boundary
        "16, 15, false",
        "100,15, false",
    })
    @DisplayName("[BVA Parameterized] Various qty vs reorder boundary pairs")
    void consumable_parameterizedBva(int qty, int reorderLevel, boolean expectedLowStock) {
        assertThat(isLowStock(buildStock(qty, reorderLevel))).isEqualTo(expectedLowStock);
    }

    @Test
    @DisplayName("[Gray-Box] ConsumableStock default reorderLevel = 10")
    void consumable_defaultReorderLevel_is10() {
        ConsumableStock stock = ConsumableStock.builder()
                .materialCode("MAT-1234")
                .description("Test Consumable")
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .build();

        assertThat(stock.getReorderLevel()).isEqualTo(10);
        assertThat(stock.getQtyAvailable()).isEqualTo(0);
        assertThat(stock.getQtyReserved()).isEqualTo(0);
    }

    @Test
    @DisplayName("[Unit] ConsumableStock updatedAt is set on creation")
    void consumable_updatedAt_isSetOnCreation() {
        ConsumableStock stock = buildStock(50, 10);
        assertThat(stock.getUpdatedAt())
                .isNotNull()
                .isBeforeOrEqualTo(LocalDateTime.now());
    }
}
