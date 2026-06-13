package in.gov.ncl.itsm.asset.software.api;

import in.gov.ncl.itsm.asset.software.domain.SoftwareLicense;
import in.gov.ncl.itsm.asset.software.domain.SoftwareDeployment;
import in.gov.ncl.itsm.asset.software.infrastructure.SoftwareLicenseRepository;
import in.gov.ncl.itsm.asset.software.infrastructure.SoftwareDeploymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets/software")
@RequiredArgsConstructor
public class SoftwareLicenseController {

    private final SoftwareLicenseRepository licenseRepository;
    private final SoftwareDeploymentRepository deploymentRepository;

    /* ------------------------------------------------------------------ */
    /* SOFTWARE LICENSES                                                    */
    /* ------------------------------------------------------------------ */

    @GetMapping
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<List<SoftwareLicense>> listAll() {
        return ResponseEntity.ok(licenseRepository.findAll());
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<List<SoftwareLicense>> listExpiringSoon(
            @RequestParam(defaultValue = "90") int withinDays) {
        LocalDate threshold = LocalDate.now().plusDays(withinDays);
        return ResponseEntity.ok(licenseRepository.findByExpiryDateBefore(threshold));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<SoftwareLicense> getById(@PathVariable UUID id) {
        return licenseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<SoftwareLicense> create(@RequestBody SoftwareLicense license) {
        SoftwareLicense saved = licenseRepository.save(license);
        return ResponseEntity.status(201).body(saved);
    }

    /* ------------------------------------------------------------------ */
    /* DEPLOYMENTS (SEAT ALLOCATIONS)                                       */
    /* ------------------------------------------------------------------ */

    @GetMapping("/deployments")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<List<SoftwareDeployment>> listDeployments(
            @RequestParam(required = false) UUID licenseId) {
        if (licenseId != null) {
            return ResponseEntity.ok(deploymentRepository.findByLicenseId(licenseId));
        }
        return ResponseEntity.ok(deploymentRepository.findAll());
    }

    @PostMapping("/deployments")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<SoftwareDeployment> deploy(@RequestBody SoftwareDeployment deployment) {
        // Validate seat availability
        SoftwareLicense license = deployment.getLicense();
        if (license != null && license.getAllocatedCount() >= license.getSeatCount()) {
            return ResponseEntity.badRequest().build(); // No seats available
        }
        SoftwareDeployment saved = deploymentRepository.save(deployment);
        // Increment allocated count
        if (license != null) {
            license.setAllocatedCount(license.getAllocatedCount() + 1);
            licenseRepository.save(license);
        }
        return ResponseEntity.status(201).body(saved);
    }

    @DeleteMapping("/deployments/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMINISTRATOR', 'SUPER_ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<Void> undeploy(@PathVariable UUID id) {
        return deploymentRepository.findById(id).map(dep -> {
            dep.setUndeployedAt(java.time.LocalDateTime.now());
            deploymentRepository.save(dep);
            // Decrement allocated count on license
            SoftwareLicense license = dep.getLicense();
            if (license != null) {
                license.setAllocatedCount(Math.max(0, license.getAllocatedCount() - 1));
                licenseRepository.save(license);
            }
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
