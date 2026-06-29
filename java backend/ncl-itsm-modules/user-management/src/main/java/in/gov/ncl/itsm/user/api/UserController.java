package in.gov.ncl.itsm.user.api;

import in.gov.ncl.itsm.user.api.dto.ProfileUpdateRequest;
import in.gov.ncl.itsm.user.api.dto.ProfileResponse;
import in.gov.ncl.itsm.user.api.dto.UserAdminUpdateRequest;
import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/engineers")
    public ResponseEntity<List<User>> getSupportEngineers() {
        List<User> engineers = userService.findUsersByRole("Support Engineer", "NCL_HQ");
        return ResponseEntity.ok(engineers);
    }

    @PutMapping("/{eisNumber}/toggle-active")
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<?> toggleUserActive(@PathVariable String eisNumber) {
        Optional<User> userOpt = userService.findByEisNumber(eisNumber);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (Boolean.TRUE.equals(user.getIsActive())) {
            userService.lockUser(eisNumber);
        } else {
            userService.unlockUser(eisNumber);
        }

        // Return updated user
        return ResponseEntity.ok(userService.findByEisNumber(eisNumber).orElseThrow());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails principal) {
        Optional<User> userOpt = userService.findByEisNumber(principal.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User context not found");
        }
        return ResponseEntity.ok(ProfileResponse.from(userOpt.get()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Optional<User> userOpt = userService.findByEisNumber(principal.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User context not found");
        }

        User user = userOpt.get();
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            String trimmedMobile = request.getMobile().trim();
            if (!trimmedMobile.matches("^\\d{10}$")) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Mobile number must be exactly 10 digits."));
            }
            user.setMobile(trimmedMobile);
        }
        if (request.getDepartmentId() != null && !request.getDepartmentId().isBlank()) {
            user.setDepartmentId(request.getDepartmentId().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        User saved = userService.saveUser(user);
        return ResponseEntity.ok(ProfileResponse.from(saved));
    }

    @PutMapping("/{eisNumber}")
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<?> adminUpdateUser(
            @PathVariable String eisNumber,
            @RequestBody UserAdminUpdateRequest request
    ) {
        Optional<User> userOpt = userService.findByEisNumber(eisNumber);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            Optional<User> existingEmail = userService.findByEmail(request.getEmail().trim());
            if (existingEmail.isPresent() && !existingEmail.get().getEisNumber().equals(eisNumber)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Official Email ID is already in use."));
            }
            user.setEmail(request.getEmail().trim());
        }
        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            String trimmedMobile = request.getMobile().trim();
            if (!trimmedMobile.matches("^\\d{10}$")) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Mobile number must be exactly 10 digits."));
            }
            user.setMobile(trimmedMobile);
        }
        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation().trim());
        }
        if (request.getDepartmentId() != null) {
            user.setDepartmentId(request.getDepartmentId().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        User savedUser;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            savedUser = userService.saveUserWithRole(user, request.getRole(), "NCL_HQ");
        } else {
            savedUser = userService.saveUser(user);
        }

        return ResponseEntity.ok(savedUser);
    }

    @DeleteMapping("/{eisNumber}")
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<?> deleteUser(@PathVariable String eisNumber) {
        Optional<User> userOpt = userService.findByEisNumber(eisNumber);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUserByEisNumber(eisNumber);
        return ResponseEntity.ok(java.util.Map.of("message", "User account deleted successfully."));
    }
}
