package in.gov.ncl.itsm.user.api;

import in.gov.ncl.itsm.user.application.UserService;
import in.gov.ncl.itsm.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_IT_ADMINISTRATOR', 'ROLE_SUPER_ADMINISTRATOR')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
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
}
