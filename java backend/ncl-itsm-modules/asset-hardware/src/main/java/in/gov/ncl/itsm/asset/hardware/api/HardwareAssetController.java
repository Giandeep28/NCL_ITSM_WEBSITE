package in.gov.ncl.itsm.asset.hardware.api;

import in.gov.ncl.itsm.asset.hardware.domain.HardwareAsset;
import in.gov.ncl.itsm.asset.hardware.domain.ConsumableStock;
import in.gov.ncl.itsm.asset.hardware.infrastructure.HardwareAssetRepository;
import in.gov.ncl.itsm.asset.hardware.infrastructure.ConsumableStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets/hardware")
@RequiredArgsConstructor
public class HardwareAssetController {

    private final HardwareAssetRepository hardwareAssetRepository;
    private final ConsumableStockRepository consumableStockRepository;

    /* ------------------------------------------------------------------ */
    /* HARDWARE ASSETS                                                      */
    /* ------------------------------------------------------------------ */

    @GetMapping
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER', 'SUPPORT_ENGINEER')")
    public ResponseEntity<List<HardwareAsset>> listAll(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        // Simple find all for now; can be refined with JPA Specification
        return ResponseEntity.ok(hardwareAssetRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER', 'SUPPORT_ENGINEER')")
    public ResponseEntity<HardwareAsset> getById(@PathVariable UUID id) {
        return hardwareAssetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<HardwareAsset> create(@RequestBody HardwareAsset asset) {
        HardwareAsset saved = hardwareAssetRepository.save(asset);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<HardwareAsset> update(@PathVariable UUID id,
                                                @RequestBody HardwareAsset assetUpdate) {
        return hardwareAssetRepository.findById(id).map(existing -> {
            existing.setStatus(assetUpdate.getStatus());
            existing.setAssignedUserId(assetUpdate.getAssignedUserId());
            existing.setDepartmentId(assetUpdate.getDepartmentId());
            existing.setLocationId(assetUpdate.getLocationId());
            existing.setCondition(assetUpdate.getCondition());
            existing.setRetiredAt(assetUpdate.getRetiredAt());
            return ResponseEntity.ok(hardwareAssetRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    /* ------------------------------------------------------------------ */
    /* CONSUMABLE STOCK                                                     */
    /* ------------------------------------------------------------------ */

    @GetMapping("/consumables")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER', 'SUPPORT_ENGINEER')")
    public ResponseEntity<List<ConsumableStock>> listConsumables() {
        return ResponseEntity.ok(consumableStockRepository.findAll());
    }

    @GetMapping("/consumables/low-stock")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<List<ConsumableStock>> listLowStock() {
        return ResponseEntity.ok(consumableStockRepository.findLowStockItems());
    }

    @PutMapping("/consumables/{id}/adjust")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ConsumableStock> adjustStock(@PathVariable UUID id,
                                                       @RequestParam int delta) {
        return consumableStockRepository.findById(id).map(stock -> {
            stock.setQtyAvailable(Math.max(0, stock.getQtyAvailable() + delta));
            return ResponseEntity.ok(consumableStockRepository.save(stock));
        }).orElse(ResponseEntity.notFound().build());
    }
}
