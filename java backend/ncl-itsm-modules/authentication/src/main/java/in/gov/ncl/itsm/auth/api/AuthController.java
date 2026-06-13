package in.gov.ncl.itsm.auth.api;

import in.gov.ncl.itsm.auth.api.dto.AuthResponse;
import in.gov.ncl.itsm.auth.api.dto.LoginRequest;
import in.gov.ncl.itsm.auth.infrastructure.JwtTokenProvider;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.Role;
import in.gov.ncl.itsm.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String eisNumber = request.getEisNumber();
        String password = request.getPassword();

        // 1. Locate or Auto-Create Mock User (Prototype convenience matching blueprints)
        Optional<User> userOpt = userService.findByEisNumber(eisNumber);
        User user;
        if (userOpt.isEmpty()) {
            // Auto-provision mock users based on prefix/number
            String roleName = eisNumber.startsWith("8") ? "Support Engineer" : "Employee";
            Role defaultRole = Role.builder()
                    .name(roleName)
                    .tenantId("NCL_HQ")
                    .scope("GLOBAL")
                    .build();

            user = User.builder()
                    .eisNumber(eisNumber)
                    .fullName(eisNumber.startsWith("8") ? "Marcus Thorne" : "J. Henderson")
                    .email(eisNumber + "@ncl.gov.in")
                    .mobileEnc("ENCRYPTED_MOBILE")
                    .designation(eisNumber.startsWith("8") ? "Electrical Specialist" : "Operations Lead")
                    .departmentId(eisNumber.startsWith("8") ? "Power Systems" : "Power Generation")
                    .tenantId("NCL_HQ")
                    .orgId("HQ_OPS")
                    .locationId("Bay 7")
                    .roles(new HashSet<>(Collections.singletonList(defaultRole)))
                    .build();
            user = userService.saveUser(user);
        } else {
            user = userOpt.get();
        }

        // 2. Lockout Check
        if (!user.getIsActive()) {
            throw new LockedException("Account is locked due to multiple failed attempts. Please contact IT support.");
        }

        // 3. Simple Mock Password Check ("password" matches)
        if (!"password".equals(password)) {
            userService.handleFailedLogin(eisNumber);
            throw new BadCredentialsException("Invalid credentials. Please try again.");
        }

        // 4. Reset failed logins on success
        userService.resetFailedLogin(eisNumber);

        // 5. Generate Access & Refresh Tokens
        String primaryRole = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("Employee");

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + primaryRole.toUpperCase().replace(" ", "_"))
        );

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                eisNumber,
                "",
                authorities
        );

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(primaryRole)
                .fullName(user.getFullName())
                .eisNumber(user.getEisNumber())
                .departmentId(user.getDepartmentId())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam String refreshToken) {
        try {
            String eisNumber = jwtTokenProvider.getUsernameFromToken(refreshToken);
            Optional<User> userOpt = userService.findByEisNumber(eisNumber);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String primaryRole = user.getRoles().stream()
                        .map(Role::getName)
                        .findFirst()
                        .orElse("Employee");

                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + primaryRole.toUpperCase().replace(" ", "_"))
                );

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        eisNumber,
                        "",
                        authorities
                );

                String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
                String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                AuthResponse response = AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .role(primaryRole)
                        .fullName(user.getFullName())
                        .eisNumber(user.getEisNumber())
                        .departmentId(user.getDepartmentId())
                        .build();

                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User context not found");
    }
}
