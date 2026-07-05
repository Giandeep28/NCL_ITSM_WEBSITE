package in.gov.ncl.itsm.asset.hardware.infrastructure;

import in.gov.ncl.itsm.asset.hardware.domain.ConsumableStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsumableStockRepository extends JpaRepository<ConsumableStock, UUID> {
    Optional<ConsumableStock> findByMaterialCode(String materialCode);
    List<ConsumableStock> findByTenantId(String tenantId);

    @Query("SELECT c FROM ConsumableStock c WHERE c.qtyAvailable <= c.reorderLevel")
    List<ConsumableStock> findLowStockItems();

    @Modifying
    @Transactional
    @Query("UPDATE ConsumableStock s SET s.qtyAvailable = CASE WHEN s.qtyAvailable + :delta < 0 THEN 0 ELSE s.qtyAvailable + :delta END WHERE s.id = :id")
    int adjustStockQty(@org.springframework.data.repository.query.Param("id") UUID id, @org.springframework.data.repository.query.Param("delta") int delta);
}
