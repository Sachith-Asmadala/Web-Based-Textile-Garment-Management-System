package lk.ac.sliit.tgms.auth;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Locale;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final int MINIMUM_PASSWORD_BYTES = 8;
    private static final int MAXIMUM_PASSWORD_BYTES = 72;

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final String dummyPasswordHash;

    public AuthService(
            UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyPasswordHash = passwordEncoder.encode("tgms-invalid-password-placeholder");
    }

    @Transactional
    public UserAccount registerCustomer(String fullName, String email, String password) {
        validatePassword(password);

        String normalizedEmail = normalizeEmail(email);
        if (userAccountRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new EmailAlreadyRegisteredException();
        }

        String normalizedName = normalizeName(fullName);
        String passwordHash = passwordEncoder.encode(password);

        try {
            return userAccountRepository.create(
                    normalizedName, normalizedEmail, passwordHash, UserRole.CUSTOMER);
        } catch (DuplicateKeyException exception) {
            throw new EmailAlreadyRegisteredException();
        }
    }

    public UserAccount login(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        var account = userAccountRepository.findByEmail(normalizedEmail);
        String storedHash = account.map(UserAccount::passwordHash).orElse(dummyPasswordHash);
        String passwordCandidate = isBcryptCompatible(password) ? password : "invalid-password";
        boolean passwordMatches = passwordEncoder.matches(passwordCandidate, storedHash);

        if (account.isEmpty() || !account.get().active() || !passwordMatches) {
            throw new InvalidCredentialsException();
        }

        return account.get();
    }

    public UserAccount requireActiveUser(long userId) {
        return userAccountRepository.findById(userId)
                .filter(UserAccount::active)
                .orElseThrow(InvalidSessionException::new);
    }

    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String fullName) {
        return Normalizer.normalize(fullName.trim(), Normalizer.Form.NFKC)
                .replaceAll("\\s+", " ");
    }

    private void validatePassword(String password) {
        if (!isBcryptCompatible(password)
                || password.getBytes(StandardCharsets.UTF_8).length < MINIMUM_PASSWORD_BYTES) {
            throw new PasswordPolicyException();
        }
    }

    private boolean isBcryptCompatible(String password) {
        return password != null
                && password.getBytes(StandardCharsets.UTF_8).length <= MAXIMUM_PASSWORD_BYTES;
    }
}
