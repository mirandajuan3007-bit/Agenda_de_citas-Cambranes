package mx.clinica.cambranes.agenda.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.LoginRequest;
import mx.clinica.cambranes.agenda.api.dto.LoginResponse;
import mx.clinica.cambranes.agenda.api.mapper.DtoMapper;
import mx.clinica.cambranes.agenda.api.security.JwtService;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final DtoMapper mapper;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        User u = authService.authenticate(req);
        String token = jwtService.issue(u.getId());
        return ResponseEntity.ok(new LoginResponse(
                token, jwtService.expirationMinutes(), mapper.toDto(u)));
    }
}
