package mx.clinica.cambranes.agenda.api.dto;

/**
 * Respuesta del endpoint /api/auth/login: incluye el token JWT
 * y el perfil del usuario autenticado.
 */
public record LoginResponse(
        String token,
        long expiresInMinutes,
        UserDto user
) {}
