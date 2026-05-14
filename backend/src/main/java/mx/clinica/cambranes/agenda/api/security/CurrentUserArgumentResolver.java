package mx.clinica.cambranes.agenda.api.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.service.AuthService;
import mx.clinica.cambranes.agenda.service.exception.NotFoundException;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Resuelve el usuario actual a partir del atributo de request que el
 * JwtAuthFilter coloca tras validar el token JWT.
 *
 * Conserva como fallback la lectura del header X-User-Id para mantener el
 * modo demo local del frontend mientras el equipo termina la migracion.
 */
@Component
@RequiredArgsConstructor
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthService authService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && User.class.isAssignableFrom(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest req, WebDataBinderFactory binderFactory) {
        HttpServletRequest http = (HttpServletRequest) req.getNativeRequest();
        Long userId = (Long) http.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);

        if (userId == null) {
            // Fallback de transicion: el frontend antiguo manda X-User-Id sin token.
            String legacy = req.getHeader("X-User-Id");
            if (legacy != null && !legacy.isBlank()) {
                try {
                    userId = Long.parseLong(legacy);
                } catch (NumberFormatException ignored) { /* sigue al throw */ }
            }
        }

        if (userId == null) {
            throw new NotFoundException("Token de autenticacion ausente o invalido.");
        }
        return authService.getById(userId);
    }
}
