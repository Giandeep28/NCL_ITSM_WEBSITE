package in.gov.ncl.itsm.asset.hardware.infrastructure;

import in.gov.ncl.itsm.asset.hardware.domain.HardwareAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HardwareAssetRepository extends JpaRepository<HardwareAsset, UUID> {
    Optional<HardwareAsset> findByAssetTag(String assetTag);
    List<HardwareAsset> findByTenantId(String tenantId);
    List<HardwareAsset> findByAssignedUserId(UUID assignedUserId);
}
