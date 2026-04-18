package br.com.catec.security;

import br.com.catec.api.error.ApiError;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(
            JwtService jwtService, UsuarioRepository usuarioRepository, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7).trim();
                if (!token.isEmpty()) {
                    String email = jwtService.extractSubject(token);
                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        usuarioRepository
                                .findByEmailIgnoreCase(email)
                                .filter(u -> u.isAtivo() || u.isRequerTrocaSenha())
                                .filter(u -> jwtService.isTokenValid(token, u))
                                .ifPresent(u -> {
                                    UsuarioAutenticado principal = UsuarioAutenticado.from(u);
                                    var authentication =
                                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                });
                    }
                }
            }
            filterChain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            var body = ApiError.of(401, "Token inválido ou expirado.", request.getRequestURI());
            objectMapper.writeValue(response.getOutputStream(), body);
        }
    }
}
