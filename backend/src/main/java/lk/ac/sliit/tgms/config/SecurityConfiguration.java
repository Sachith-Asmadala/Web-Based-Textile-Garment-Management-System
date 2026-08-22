package lk.ac.sliit.tgms.config;

import static org.springframework.security.config.Customizer.withDefaults;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import lk.ac.sliit.tgms.auth.AuthCookieService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {

    private static final List<String> AUTHENTICATION_FREE_PATHS = List.of(
            "/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/health");

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecretKey jwtSecretKey(@Value("${tgms.auth.jwt-secret}") String jwtSecret) {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 UTF-8 bytes.");
        }
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return NimbusJwtEncoder.withSecretKey(jwtSecretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey jwtSecretKey, @Value("${tgms.auth.issuer}") String issuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(), new JwtIssuerValidator(issuer)));
        return decoder;
    }

    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        return request -> {
            if (AUTHENTICATION_FREE_PATHS.contains(request.getRequestURI())) {
                return null;
            }
            if (request.getCookies() == null) {
                return null;
            }
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> AuthCookieService.COOKIE_NAME.equals(cookie.getName()))
                    .map(cookie -> cookie.getValue())
                    .filter(value -> !value.isBlank())
                    .findFirst()
                    .orElse(null);
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http, BearerTokenResolver bearerTokenResolver) throws Exception {
        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            return role == null ? List.of() : List.of(new SimpleGrantedAuthority("ROLE_" + role));
        });

        http.cors(withDefaults())
                // The session cookie is SameSite=Strict and the API is stateless. No browser
                // credential is accepted from a cross-site request.
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/me")
                        .authenticated()
                        .anyRequest()
                        .permitAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                writeSecurityError(
                                        response,
                                        401,
                                        "UNAUTHORIZED",
                                        "Authentication is required."))
                        .accessDeniedHandler((request, response, exception) ->
                                writeSecurityError(
                                        response,
                                        403,
                                        "FORBIDDEN",
                                        "You do not have permission to perform this action.")))
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenResolver(bearerTokenResolver)
                        .authenticationEntryPoint((request, response, exception) ->
                                writeSecurityError(
                                        response,
                                        401,
                                        "INVALID_SESSION",
                                        "The authenticated session is invalid or expired."))
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter)));

        return http.build();
    }

    private void writeSecurityError(
            jakarta.servlet.http.HttpServletResponse response,
            int status,
            String code,
            String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter()
                .write("{\"error\":{\"code\":\"" + code + "\",\"message\":\"" + message
                        + "\",\"fields\":{}}}");
    }
}
