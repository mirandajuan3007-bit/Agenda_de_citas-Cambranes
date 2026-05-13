package mx.clinica.cambranes.agenda.service;

import lombok.RequiredArgsConstructor;
import mx.clinica.cambranes.agenda.api.dto.LoginRequest;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.domain.repository.UserRepository;
import mx.clinica.cambranes.agenda.service.exception.NotFoundException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User authenticate(LoginRequest req) {
        User u = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new NotFoundException("Credenciales invalidas."));
        if (!BCrypt.checkpw(req.password(), u.getPasswordHash())) {
            throw new NotFoundException("Credenciales invalidas.");
        }
        return u;
    }

    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario " + id + " no existe."));
    }
}
