package lk.ac.sliit.tgms.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lk.ac.sliit.tgms.auth.InvalidSessionException;
import lk.ac.sliit.tgms.auth.UserAccount;
import lk.ac.sliit.tgms.auth.UserRole;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ProfileResponse getProfile(@AuthenticationPrincipal Jwt jwt) {
        return ProfileResponse.from(userProfileService.getProfile(authenticatedUserId(jwt)));
    }

    @PutMapping
    public ProfileResponse updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ProfileResponse.from(userProfileService.updateProfile(
                authenticatedUserId(jwt), request.fullName()));
    }

    private long authenticatedUserId(Jwt jwt) {
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException | NullPointerException exception) {
            throw new InvalidSessionException();
        }
    }

    public record UpdateProfileRequest(
            @NotBlank(message = "Full name is required.")
                    @Size(max = 120, message = "Full name must not exceed 120 characters.")
                    String fullName) {}

    public record ProfileResponse(long id, String fullName, String email, UserRole role) {
        static ProfileResponse from(UserAccount account) {
            return new ProfileResponse(
                    account.id(), account.fullName(), account.email(), account.role());
        }
    }
}
