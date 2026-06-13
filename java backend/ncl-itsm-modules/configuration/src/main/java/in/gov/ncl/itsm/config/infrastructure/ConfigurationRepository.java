package in.gov.ncl.itsm.config.infrastructure;

import in.gov.ncl.itsm.config.domain.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfigurationRepository extends JpaRepository<Configuration, UUID> {
    Optional<Configuration> findByConfigKeyAndTenantId(String configKey, String tenantId);
    List<Configuration> findByTenantId(String tenantId);
}
