package lk.ac.sliit.tgms.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthTokenService authTokenService;
    private final AuthCookieService authCookieService;

    public AuthController(
            AuthService authService,
            AuthTokenService authTokenService,
            AuthCookieService authCookieService) {
        this.authService = authService;
        this.authTokenService = authTokenService;
        this.authCookieService = authCookieService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserAccount account = authService.registerCustomer(
                request.fullName(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse("Account created successfully.", UserResponse.from(account)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        UserAccount account = authService.login(request.email(), request.password());
        String token = authTokenService.issue(account);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createSessionCookie(token))
                .body(new AuthResponse("Login successful.", UserResponse.from(account)));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearSessionCookie())
                .body(new MessageResponse("Logged out successfully."));
    }

    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal Jwt jwt) {
        long userId;
        try {
            userId = Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException exception) {
            throw new InvalidSessionException();
        }
        return UserResponse.from(authService.requireActiveUser(userId));
    }

    public record RegisterRequest(
            @NotBlank(message = "Full name is required.")
                    @Size(max = 120, message = "Full name must not exceed 120 characters.")
                    String fullName,
            @NotBlank(message = "Email is required.")
                    @Email(message = "Enter a valid email address.")
                    @Size(max = 254, message = "Email must not exceed 254 characters.")
                    String email,
            @NotBlank(message = "Password is required.")
                    @Size(min = 8, max = 72, message = "Password must contain 8 to 72 characters.")
                    String password) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required.")
                    @Email(message = "Enter a valid email address.")
                    @Size(max = 254, message = "Email must not exceed 254 characters.")
                    String email,
            @NotBlank(message = "Password is required.")
                    @Size(max = 72, message = "Password must not exceed 72 characters.")
                    String password) {}

    public record AuthResponse(String message, UserResponse user) {}

    public record MessageResponse(String message) {}

    public record UserResponse(long id, String fullName, String email, UserRole role) {
        static UserResponse from(UserAccount account) {
            return new UserResponse(
                    account.id(), account.fullName(), account.email(), account.role());
        }
    }
}
