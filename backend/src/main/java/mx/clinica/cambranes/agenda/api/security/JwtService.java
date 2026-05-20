package mx.clinica.cambranes.agenda.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Firma y verifica tokens JWT (HS256) para autenticar usuarios.
 *
 * El token contiene como subject el id del usuario y una expiracion
 * configurada en application.yml (app.security.jwt.expiration-minutes).
 *
 * Sustituye al mecanismo previo de header X-User-Id que era falsificable
 * trivialmente.
 */
@Slf4j
@Service
public class JwtService {

    @Value("${app.security.jwt.secret}")
    private String secret;

    @Value("${app.security.jwt.expiration-minutes}")
    private long expirationMinutes;

    private SecretKey key;

    @PostConstruct
    void init() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "El secreto JWT debe tener al menos 32 bytes (256 bits) para HS256.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public String issue(Long userId) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationMinutes * 60);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** Devuelve el userId si el token es valido, o null si no lo es. */
    public Long verify(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Long.parseLong(claims.getSubject());
        } catch (Exception e) {
            log.debug("JWT invalido: {}", e.getMessage());
            return null;
        }
    }

    public long expirationMinutes() {
        return expirationMinutes;
    }
}
