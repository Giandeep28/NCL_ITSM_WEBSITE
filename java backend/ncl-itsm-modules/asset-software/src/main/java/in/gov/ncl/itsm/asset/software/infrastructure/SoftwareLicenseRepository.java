package in.gov.ncl.itsm.asset.software.infrastructure;

import in.gov.ncl.itsm.asset.software.domain.SoftwareLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SoftwareLicenseRepository extends JpaRepository<SoftwareLicense, UUID> {
    List<SoftwareLicense> findByTenantId(String tenantId);
    
    // Find licenses expiring between two dates for notifications
    List<SoftwareLicense> findByExpiryDateBetweenAndTenantId(LocalDate startDate, LocalDate endDate, String tenantId);

    // Find all licenses expiring before a given date (for threshold alerts)
    List<SoftwareLicense> findByExpiryDateBefore(LocalDate date);
}
