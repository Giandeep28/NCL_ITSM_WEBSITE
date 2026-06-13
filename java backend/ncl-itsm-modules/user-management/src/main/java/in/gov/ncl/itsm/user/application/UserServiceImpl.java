package in.gov.ncl.itsm.user.application;

import in.gov.ncl.itsm.user.domain.User;
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
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEisNumber(String eisNumber) {
        return userRepository.findByEisNumber(eisNumber);
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
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
    public void resetFailedLogin(String eisNumber) {
        userRepository.findByEisNumber(eisNumber).ifPresent(user -> {
            user.setFailedLoginCount(0);
            user.setLockedAt(null);
            user.setIsActive(true);
            userRepository.save(user);
        });
    }

    @Override
    public void lockUser(String eisNumber) {
        userRepository.findByEisNumber(eisNumber).ifPresent(user -> {
            user.setLockedAt(LocalDateTime.now());
            user.setIsActive(false);
            userRepository.save(user);
        });
    }

    @Override
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
