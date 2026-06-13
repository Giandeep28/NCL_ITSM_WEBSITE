package in.gov.ncl.itsm.config.application;

import in.gov.ncl.itsm.config.domain.Configuration;
import in.gov.ncl.itsm.config.infrastructure.ConfigurationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ConfigurationServiceImpl implements ConfigurationService {

    private final ConfigurationRepository configurationRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "configs", key = "#configKey + '_' + #tenantId")
    public String getConfigValue(String configKey, String tenantId, String defaultValue) {
        Optional<Configuration> config = configurationRepository.findByConfigKeyAndTenantId(configKey, tenantId);
        return config.map(Configuration::getConfigValue).orElse(defaultValue);
    }

    @Override
    @CacheEvict(value = "configs", key = "#configKey + '_' + #tenantId")
    public Configuration setConfigValue(String configKey, String configValue, String tenantId, 
                                        String scope, String description, UUID modifiedBy) {
        
        Optional<Configuration> existing = configurationRepository.findByConfigKeyAndTenantId(configKey, tenantId);
        Configuration configuration;

        if (existing.isPresent()) {
            configuration = existing.get();
            configuration.setConfigValue(configValue);
            configuration.setLastModifiedBy(modifiedBy);
            configuration.setLastModifiedAt(LocalDateTime.now());
        } else {
            configuration = Configuration.builder()
                    .configKey(configKey)
                    .configValue(configValue)
                    .tenantId(tenantId)
                    .scope(scope)
                    .description(description)
                    .lastModifiedBy(modifiedBy)
                    .lastModifiedAt(LocalDateTime.now())
                    .build();
        }

        return configurationRepository.save(configuration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Configuration> getConfigurations(String tenantId) {
        return configurationRepository.findByTenantId(tenantId);
    }
}
