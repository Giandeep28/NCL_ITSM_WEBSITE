package in.gov.ncl.itsm.user.application;

import in.gov.ncl.itsm.user.domain.Role;
import in.gov.ncl.itsm.user.domain.User;
import in.gov.ncl.itsm.user.infrastructure.RoleRepository;
import in.gov.ncl.itsm.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private void checkAndAutoUnlock(User user) {
        if (user.getLockedAt() != null) {
            if (LocalDateTime.now().isAfter(user.getLockedAt().plusHours(24))) {
                user.setFailedLoginCount(0);
                user.setLockedAt(null);
                user.setIsActive(true);
                userRepository.save(user);
            }
        }
    }

    @Override
    @Transactional
    public Optional<User> findById(java.util.UUID id) {
        Optional<User> userOpt = userRepository.findById(id);
        userOpt.ifPresent(this::checkAndAutoUnlock);
        return userOpt;
    }

    @Override
    @Transactional
    public Optional<User> findByEisNumber(String eisNumber) {
        Optional<User> userOpt = userRepository.findByEisNumber(eisNumber);
        userOpt.ifPresent(this::checkAndAutoUnlock);
        return userOpt;
    }

    @Override
    @Transactional
    public Optional<User> findByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        userOpt.ifPresent(this::checkAndAutoUnlock);
        return userOpt;
    }

    @Override
    @Transactional
    public Optional<User> findByUsernameOrEisNumber(String username, String eisNumber) {
        Optional<User> userOpt = userRepository.findByUsernameOrEisNumber(username, eisNumber);
        userOpt.ifPresent(this::checkAndAutoUnlock);
        return userOpt;
    }

    @Override
    @Transactional
    public Optional<User> findByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        userOpt.ifPresent(this::checkAndAutoUnlock);
        return userOpt;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEisNumber(String eisNumber) {
        return userRepository.findByEisNumber(eisNumber).isPresent();
    }

    @Override
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User saveUserWithRole(User user, String roleName, String tenantId) {
        // First save the user without roles to get a managed entity with an ID
        user.setRoles(null);
        User savedUser = userRepository.save(user);

        // Find or create the role within the same transaction context (role will be managed)
        Role role = roleRepository.findByNameAndTenantId(roleName, tenantId)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(roleName)
                                .tenantId(tenantId)
                                .scope("GLOBAL")
                                .build()));

        // Assign the managed role to the managed user and save again
        savedUser.setRoles(new java.util.HashSet<>(java.util.Collections.singletonList(role)));
        return userRepository.save(savedUser);
    }

    @Override
    @Transactional
    public void handleFailedLogin(String eisNumber) {
        userRepository.findByEisNumber(eisNumber).ifPresent(user -> {
            int newCount = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(newCount);
            if (newCount >= MAX_FAILED_ATTEMPTS) {
                user.setLockedAt(LocalDateTime.now());
                user.setIsActive(false); // Lockout state
            }
            userRepository.save(user);
        });
    }

    @Override
    @Transactional
    public void resetFailedLogin(String eisNumber) {
        userRepository.findByEisNumber(eisNumber).ifPresent(user -> {
            user.setFailedLoginCount(0);
            user.setLockedAt(null);
            user.setIsActive(true);
            userRepository.save(user);
        });
    }

    @Override
    @Transactional
    public void lockUser(String eisNumber) {
        userRepository.findByEisNumber(eisNumber).ifPresent(user -> {
            user.setLockedAt(LocalDateTime.now());
            user.setIsActive(false);
            userRepository.save(user);
        });
    }

    @Override
    @Transactional
    public void unlockUser(String eisNumber) {
        userRepository.findByEisNumber(eisNumber).ifPresent(user -> {
            user.setFailedLoginCount(0);
            user.setLockedAt(null);
            user.setIsActive(true);
            userRepository.save(user);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<User> findUsersByRole(String roleName, String tenantId) {
        return userRepository.findByRoleNameAndTenantId(roleName, tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<User> findAllUsers() {
        return userRepository.findAll();
    }
}
