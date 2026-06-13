package in.gov.ncl.itsm.config.api;

import in.gov.ncl.itsm.config.application.ConfigurationService;
import in.gov.ncl.itsm.config.domain.Configuration;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/configurations")
@RequiredArgsConstructor
public class ConfigurationController {

    private final ConfigurationService configurationService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<?> getConfigurations(@AuthenticationPrincipal UserDetails principal) {
        String tenantId = "NCL_HQ";
        List<Configuration> configs = configurationService.getConfigurations(tenantId);
        return ResponseEntity.ok(configs);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<?> setConfiguration(
            @RequestParam String key,
            @RequestParam String value,
            @RequestParam String scope,
            @RequestParam(required = false) String description,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Optional<User> userOpt = userService.findByEisNumber(principal.getUsername());
        UUID userId = userOpt.map(User::getId).orElse(null);
        String tenantId = "NCL_HQ";

        Configuration config = configurationService.setConfigValue(key, value, tenantId, scope, description, userId);
        return ResponseEntity.ok(config);
    }
}
