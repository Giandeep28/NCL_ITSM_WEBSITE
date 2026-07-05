package in.gov.ncl.itsm.asset.software.infrastructure;

import in.gov.ncl.itsm.asset.software.domain.SoftwareLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
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

    List<SoftwareLicense> findByExpiryDate(LocalDate expiryDate);

    @Modifying
    @Transactional
    @Query("UPDATE SoftwareLicense l SET l.allocatedCount = l.allocatedCount + 1 WHERE l.id = :id AND l.allocatedCount < l.seatCount")
    int incrementAllocatedCount(@org.springframework.data.repository.query.Param("id") UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE SoftwareLicense l SET l.allocatedCount = CASE WHEN l.allocatedCount > 0 THEN l.allocatedCount - 1 ELSE 0 END WHERE l.id = :id")
    int decrementAllocatedCount(@org.springframework.data.repository.query.Param("id") UUID id);
}
