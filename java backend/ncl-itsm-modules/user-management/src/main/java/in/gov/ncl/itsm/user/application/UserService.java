package in.gov.ncl.itsm.user.application;

import in.gov.ncl.itsm.user.domain.User;
import java.util.Optional;

public interface UserService {
    Optional<User> findById(java.util.UUID id);
    Optional<User> findByEisNumber(String eisNumber);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEisNumber(String username, String eisNumber);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByEisNumber(String eisNumber);
    User saveUser(User user);
    User saveUserWithRole(User user, String roleName, String tenantId);
    void handleFailedLogin(String eisNumber);
    void resetFailedLogin(String eisNumber);
    void lockUser(String eisNumber);
    void unlockUser(String eisNumber);
    java.util.List<User> findUsersByRole(String roleName, String tenantId);
    java.util.List<User> findAllUsers();
}
