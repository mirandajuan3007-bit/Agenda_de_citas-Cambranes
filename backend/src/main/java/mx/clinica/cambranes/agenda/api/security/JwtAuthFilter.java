package mx.clinica.cambranes.agenda.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Filtro que lee el header Authorization, valida el JWT y guarda el userId
 * resuelto como atributo de request para que CurrentUserArgumentResolver lo
 * recoja al inyectar @CurrentUser User en los controllers.
 *
 * Rutas publicas (login, swagger, etc.) se dejan pasar sin token.
 *
 * No es @Component: WebConfig lo declara como @Bean y lo registra solo
 * para /api/* via FilterRegistrationBean.
 */
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String USER_ID_ATTRIBUTE = "auth.userId";

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/auth/login",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-ui.html"
    );

    private final JwtService jwt;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (!isPublic(req)) {
            String header = req.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Long userId = jwt.verify(header.substring("Bearer ".length()));
                if (userId != null) {
                    req.setAttribute(USER_ID_ATTRIBUTE, userId);
                }
            }
        }
        chain.doFilter(req, res);
    }

    private boolean isPublic(HttpServletRequest req) {
        String path = req.getRequestURI();
        if (path == null) return false;
        for (String p : PUBLIC_PATHS) {
            if (path.startsWith(p)) return true;
        }
        // CORS preflight
        return "OPTIONS".equalsIgnoreCase(req.getMethod());
    }
}
