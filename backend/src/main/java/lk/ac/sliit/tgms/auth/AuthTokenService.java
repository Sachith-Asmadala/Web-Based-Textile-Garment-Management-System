package lk.ac.sliit.tgms.auth;

import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final Duration sessionDuration;

    public AuthTokenService(
            JwtEncoder jwtEncoder,
            @Value("${tgms.auth.issuer}") String issuer,
            @Value("${tgms.auth.session-hours}") long sessionHours) {
        if (sessionHours <= 0) {
            throw new IllegalStateException("JWT_SESSION_HOURS must be greater than zero.");
        }
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.sessionDuration = Duration.ofHours(sessionHours);
    }

    public String issue(UserAccount account) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(sessionDuration))
                .subject(Long.toString(account.id()))
                .claim("role", account.role().name())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public Duration sessionDuration() {
        return sessionDuration;
    }
}
