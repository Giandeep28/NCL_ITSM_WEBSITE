package in.gov.ncl.itsm.user.application;

import in.gov.ncl.itsm.user.domain.User;
import java.util.Optional;

public interface UserService {
    Optional<User> findByEisNumber(String eisNumber);
    User saveUser(User user);
    void handleFailedLogin(String eisNumber);
    void resetFailedLogin(String eisNumber);
    void lockUser(String eisNumber);
    void unlockUser(String eisNumber);
    java.util.List<User> findUsersByRole(String roleName, String tenantId);
    java.util.List<User> findAllUsers();
}
