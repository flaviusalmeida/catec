package br.com.catec.security;

import br.com.catec.api.error.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Enquanto {@link UsuarioAutenticado#requerTrocaSenha()} for verdadeiro, só é permitido o mínimo para concluir
 * o primeiro acesso (definir senha) e consultar o perfil básico.
 */
@Component
public class TrocaSenhaObrigatoriaFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    public TrocaSenhaObrigatoriaFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null
                && auth.getPrincipal() instanceof UsuarioAutenticado ua
                && ua.requerTrocaSenha()) {
            if (!isPermitidoDuranteTrocaObrigatoria(request)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                var body = ApiError.of(
                        403,
                        "É necessário definir uma nova senha antes de continuar.",
                        request.getRequestURI());
                objectMapper.writeValue(response.getOutputStream(), body);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private static boolean isPermitidoDuranteTrocaObrigatoria(HttpServletRequest request) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String uri = request.getRequestURI();
        if (HttpMethod.GET.matches(request.getMethod()) && "/api/v1/me".equals(uri)) {
            return true;
        }
        return HttpMethod.POST.matches(request.getMethod()) && "/api/v1/auth/trocar-senha".equals(uri);
    }
}
