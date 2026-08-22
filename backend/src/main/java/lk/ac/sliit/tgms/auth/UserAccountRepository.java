package lk.ac.sliit.tgms.auth;

import java.util.Optional;

public interface UserAccountRepository {

    Optional<UserAccount> findByEmail(String normalizedEmail);

    Optional<UserAccount> findById(long id);

    UserAccount create(String fullName, String normalizedEmail, String passwordHash, UserRole role);
}
