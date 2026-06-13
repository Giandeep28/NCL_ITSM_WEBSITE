package in.gov.ncl.itsm.asset.hardware.infrastructure;

import in.gov.ncl.itsm.asset.hardware.domain.ConsumableStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
