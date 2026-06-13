package in.gov.ncl.itsm.user.infrastructure;

import in.gov.ncl.itsm.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEisNumber(String eisNumber);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEisNumber(String username, String eisNumber);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.tenantId = :tenantId AND u.isActive = true")
    java.util.List<User> findByRoleNameAndTenantId(@org.springframework.data.repository.query.Param("roleName") String roleName, @org.springframework.data.repository.query.Param("tenantId") String tenantId);
}
