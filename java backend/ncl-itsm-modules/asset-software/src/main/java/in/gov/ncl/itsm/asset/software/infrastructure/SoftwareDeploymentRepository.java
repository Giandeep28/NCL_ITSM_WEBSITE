package in.gov.ncl.itsm.asset.software.infrastructure;

import in.gov.ncl.itsm.asset.software.domain.SoftwareDeployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SoftwareDeploymentRepository extends JpaRepository<SoftwareDeployment, UUID> {
    List<SoftwareDeployment> findByLicenseIdAndUndeployedAtIsNull(UUID licenseId);
    List<SoftwareDeployment> findByAssetIdAndUndeployedAtIsNull(UUID assetId);
    List<SoftwareDeployment> findByUserIdAndUndeployedAtIsNull(UUID userId);

    // All deployments for a license (including historical)
    List<SoftwareDeployment> findByLicenseId(UUID licenseId);
}
