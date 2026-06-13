package in.gov.ncl.itsm.config.application;

import in.gov.ncl.itsm.config.domain.Configuration;
import java.util.List;
import java.util.UUID;

public interface ConfigurationService {
    String getConfigValue(String configKey, String tenantId, String defaultValue);
    Configuration setConfigValue(String configKey, String configValue, String tenantId, String scope, String description, UUID modifiedBy);
    List<Configuration> getConfigurations(String tenantId);
}
