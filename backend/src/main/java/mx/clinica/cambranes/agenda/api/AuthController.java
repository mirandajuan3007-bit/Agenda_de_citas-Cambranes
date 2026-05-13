package mx.clinica.cambranes.agenda.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.LoginRequest;
import mx.clinica.cambranes.agenda.api.dto.UserDto;
import mx.clinica.cambranes.agenda.api.mapper.DtoMapper;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final DtoMapper mapper;

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody LoginRequest req) {
        User u = authService.authenticate(req);
        return ResponseEntity.ok(mapper.toDto(u));
    }
}
