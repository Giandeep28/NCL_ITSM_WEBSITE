package in.gov.ncl.itsm.asset.software.application;

import in.gov.ncl.itsm.asset.software.domain.SoftwareLicense;
import in.gov.ncl.itsm.asset.software.infrastructure.SoftwareLicenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LicenseExpiryScheduler {

    private final SoftwareLicenseRepository softwareLicenseRepository;

    // Run every day at 01:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void checkLicenseExpirations() {
        log.info("Starting scheduled software license expiry verification scan...");
        
        LocalDate today = LocalDate.now();
        
        // Scan thresholds (90, 60, 30 days remaining)
        checkThreshold(today.plusDays(90), 90);
        checkThreshold(today.plusDays(60), 60);
        checkThreshold(today.plusDays(30), 30);
        
        log.info("License expiry verification scan finished.");
    }

    private void checkThreshold(LocalDate targetDate, int daysRemaining) {
        // Find licenses expiring on exactly targetDate across all tenants
        // In prototype mode, we check all expiring matching that date
        List<SoftwareLicense> licenses = softwareLicenseRepository.findAll().stream()
                .filter(l -> l.getExpiryDate().isEqual(targetDate))
                .toList();

        for (SoftwareLicense license : licenses) {
            log.warn("ALERT: Software license for '{}' is expiring in {} days! Expiry Date: {}. Key Hash: {}. Tenant: {}",
                    license.getProduct(),
                    daysRemaining,
                    license.getExpiryDate(),
                    license.getLicenseKeyHash(),
                    license.getTenantId()
            );
            // Future step: Publish event to RabbitMQ for Notification Service (email/SMS dispatch)
        }
    }
}
