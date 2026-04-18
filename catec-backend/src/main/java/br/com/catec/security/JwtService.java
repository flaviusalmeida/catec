package br.com.catec.security;

import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioPerfil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] keyBytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "app.security.jwt.secret deve ter pelo menos 32 bytes (256 bits) para HS256.");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public long getExpirationSeconds() {
        return properties.expirationMinutes() * 60L;
    }

    public String generateToken(Usuario usuario) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(getExpirationSeconds());
        List<String> roles =
                usuario.getPerfis().stream().map(UsuarioPerfil::getPerfil).collect(Collectors.toList());
        return Jwts.builder()
                .subject(usuario.getEmail().toLowerCase())
                .claim("uid", usuario.getId())
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(secretKey)
                .compact();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, Usuario usuario) {
        try {
            Claims claims = parseClaims(token);
            String subject = claims.getSubject();
            return subject != null
                    && subject.equalsIgnoreCase(usuario.getEmail())
                    && !claims.getExpiration().before(new Date());
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
