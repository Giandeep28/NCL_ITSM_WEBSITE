package in.gov.ncl.itsm.auth.api;

import in.gov.ncl.itsm.auth.api.dto.*;
import in.gov.ncl.itsm.auth.infrastructure.JwtTokenProvider;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.Role;
import in.gov.ncl.itsm.user.domain.User;
import in.gov.ncl.itsm.user.domain.PasswordResetToken;
import in.gov.ncl.itsm.user.infrastructure.PasswordResetTokenRepository;
import in.gov.ncl.itsm.audit.application.AuditLogService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Official Email ID is already registered."));
        }
        if (userService.existsByEisNumber(request.getEisNumber())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Employee ID is already registered."));
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match."));
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = User.builder()
                .eisNumber(request.getEisNumber())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(hashedPassword)
                .mobile(request.getMobile())
                .designation("Staff")
                .departmentId("Operations")
                .tenantId("NCL_HQ")
                .orgId("HQ_OPS")
                .locationId("Main Building")
                .build();

        User savedUser = userService.saveUserWithRole(newUser, "Employee", "NCL_HQ");

        // Audit log registration event
        auditLogService.logEvent(savedUser.getId(), "USER_REGISTERED", "User", savedUser.getId(),
                null, null, httpRequest.getRemoteAddr(), savedUser.getTenantId());

        return ResponseEntity.ok(Map.of("message", "Registration successful. You can now log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String usernameOrEis = request.getUsernameOrEmployeeId();
        String password = request.getPassword();

        // 1. Locate user
        Optional<User> userOpt = userService.findByUsernameOrEisNumber(usernameOrEis, usernameOrEis);
        if (userOpt.isEmpty()) {
            auditLogService.logEvent(null, "USER_LOGIN_FAILED", "User", null, 
                    "Attempted login with: " + usernameOrEis, null, httpRequest.getRemoteAddr(), "NCL_HQ");
            throw new BadCredentialsException("Invalid credentials. Please try again.");
        }

        User user = userOpt.get();

        // 2. Lockout Check
        if (!user.getIsActive()) {
            auditLogService.logEvent(user.getId(), "USER_LOGIN_LOCKED", "User", user.getId(), 
                    "Attempted login while locked", null, httpRequest.getRemoteAddr(), user.getTenantId());
            throw new LockedException("Account is locked due to multiple failed attempts. Please try again after 24 hours.");
        }

        // 3. Password Check (Supports both BCrypt and plain for fallback mock convenience)
        boolean matches = false;
        if (user.getPassword() != null) {
            if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$") || user.getPassword().startsWith("$2y$")) {
                matches = passwordEncoder.matches(password, user.getPassword());
            } else {
                matches = password.equals(user.getPassword());
            }
        } else {
            // Default sandbox mock passwords
            matches = "password".equals(password);
        }

        if (!matches) {
            userService.handleFailedLogin(user.getEisNumber());
            
            // Check if the lockout triggered
            User updatedUser = userService.findByEisNumber(user.getEisNumber()).orElse(user);
            if (!updatedUser.getIsActive()) {
                auditLogService.logEvent(updatedUser.getId(), "USER_LOCKED", "User", updatedUser.getId(), 
                        "Account locked due to 5 consecutive failed logins", null, httpRequest.getRemoteAddr(), updatedUser.getTenantId());
                throw new LockedException("Account has been locked due to 5 consecutive failed attempts. Please try again after 24 hours.");
            } else {
                auditLogService.logEvent(user.getId(), "USER_LOGIN_FAILED", "User", user.getId(), 
                        "Failed login attempt", null, httpRequest.getRemoteAddr(), user.getTenantId());
                int remaining = 5 - updatedUser.getFailedLoginCount();
                throw new BadCredentialsException("Invalid credentials. " + remaining + " attempts remaining.");
            }
        }

        // 4. Success -> Reset failed logins
        userService.resetFailedLogin(user.getEisNumber());

        // Audit log successful login
        auditLogService.logEvent(user.getId(), "USER_LOGIN_SUCCESS", "User", user.getId(), 
                null, null, httpRequest.getRemoteAddr(), user.getTenantId());

        // 5. Generate Access & Refresh Tokens
        String primaryRole = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("Employee");

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + primaryRole.toUpperCase().replace(" ", "_"))
        );

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEisNumber(),
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        String identity = request.getIdentity();

        // Find user by email, employee ID, or username
        Optional<User> userOpt = userService.findByEisNumber(identity);
        if (userOpt.isEmpty()) {
            userOpt = userService.findByUsername(identity);
        }
        if (userOpt.isEmpty()) {
            userOpt = userService.findByEmail(identity);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User with provided Email, Username or Employee ID does not exist."));
        }

        User user = userOpt.get();

        // Generate 6-digit OTP
        String otp = String.valueOf(100000 + new java.util.Random().nextInt(900000));

        // Clean up previous tokens
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        // Store new password reset token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(otp)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Print to console for simulation
        System.out.println("=================================================");
        System.out.println("🔑 SIMULATED PASSWORD RESET OTP");
        System.out.println("Recipient: " + user.getEmail() + " (" + user.getFullName() + ")");
        System.out.println("OTP Code: " + otp);
        System.out.println("=================================================");

        // Audit log password reset request
        auditLogService.logEvent(user.getId(), "PASSWORD_RESET_REQUESTED", "User", user.getId(), 
                "OTP requested", null, httpRequest.getRemoteAddr(), user.getTenantId());

        return ResponseEntity.ok(Map.of(
                "message", "A secure OTP has been sent to your registered email address.",
                "simulationOtp", otp
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest httpRequest) {
        String otp = request.getOtp();
        String identity = request.getIdentity();

        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(otp);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or incorrect OTP."));
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token);
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }

        User user = token.getUser();

        // Verify identity matches the token owner
        if (!user.getEmail().equalsIgnoreCase(identity) &&
            !user.getEisNumber().equals(identity) &&
            !user.getUsername().equalsIgnoreCase(identity)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification failed. Identity mismatch."));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match."));
        }

        // Reset password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        
        // Auto-unlock and reset attempts on successful verification reset
        user.setFailedLoginCount(0);
        user.setLockedAt(null);
        user.setIsActive(true);

        userService.saveUser(user);
        passwordResetTokenRepository.delete(token);

        // Audit log password reset completion
        auditLogService.logEvent(user.getId(), "PASSWORD_RESET_COMPLETED", "User", user.getId(), 
                "Password reset completed successfully", null, httpRequest.getRemoteAddr(), user.getTenantId());

        return ResponseEntity.ok(Map.of("message", "Password updated successfully. You can now log in."));
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

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<?> handleLocked(LockedException ex) {
        return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of("message", ex.getMessage()));
    }
}
