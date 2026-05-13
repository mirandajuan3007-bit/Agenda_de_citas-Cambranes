package mx.clinica.cambranes.agenda.api.security;

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
 * Resuelve el usuario actual leyendo el header X-User-Id que envia el frontend
 * tras hacer login. Es una autenticacion deliberadamente simple — suficiente
 * para el contexto administrativo cerrado del modulo.
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
        String header = req.getHeader("X-User-Id");
        if (header == null || header.isBlank()) {
            throw new NotFoundException("Falta el header X-User-Id.");
        }
        try {
            return authService.getById(Long.parseLong(header));
        } catch (NumberFormatException e) {
            throw new NotFoundException("X-User-Id invalido.");
        }
    }
}
