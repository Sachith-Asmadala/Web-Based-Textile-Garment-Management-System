package lk.ac.sliit.tgms.profile;

import java.text.Normalizer;
import lk.ac.sliit.tgms.auth.InvalidSessionException;
import lk.ac.sliit.tgms.auth.UserAccount;
import lk.ac.sliit.tgms.auth.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserAccountRepository userAccountRepository;

    public UserProfileService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserAccount getProfile(long authenticatedUserId) {
        return requireActiveUser(authenticatedUserId);
    }

    @Transactional
    public UserAccount updateProfile(long authenticatedUserId, String fullName) {
        UserAccount current = requireActiveUser(authenticatedUserId);
        String normalizedName = normalizeName(fullName);
        return userAccountRepository.updateProfile(current.id(), normalizedName);
    }

    private UserAccount requireActiveUser(long userId) {
        return userAccountRepository.findById(userId)
                .filter(UserAccount::active)
                .orElseThrow(InvalidSessionException::new);
    }

    private String normalizeName(String fullName) {
        return Normalizer.normalize(fullName.trim(), Normalizer.Form.NFKC)
                .replaceAll("\\s+", " ");
    }
}
