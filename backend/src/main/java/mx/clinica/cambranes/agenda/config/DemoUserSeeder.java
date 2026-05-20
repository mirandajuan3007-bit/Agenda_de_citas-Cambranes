package mx.clinica.cambranes.agenda.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mx.clinica.cambranes.agenda.domain.model.User;
import mx.clinica.cambranes.agenda.domain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Asegura que los usuarios demo tengan un BCrypt fresco al arrancar.
 * Permite definir las contrasenas en el codigo sin meter hashes hardcodeados
 * en las migraciones SQL.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DemoUserSeeder implements CommandLineRunner {

    private static final Map<String, String> DEMO_PASSWORDS = Map.of(
            "secretaria@clinica.mx",  "secretaria123",
            "coordinador@clinica.mx", "coordinador123"
    );

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        for (var entry : DEMO_PASSWORDS.entrySet()) {
            userRepository.findByEmail(entry.getKey()).ifPresent(u -> {
                if (!isValidBcrypt(u.getPasswordHash()) || !BCrypt.checkpw(entry.getValue(), u.getPasswordHash())) {
                    u.setPasswordHash(BCrypt.hashpw(entry.getValue(), BCrypt.gensalt()));
                    userRepository.save(u);
                    log.info("Seed: password renovada para {}", u.getEmail());
                }
            });
        }
    }

    private boolean isValidBcrypt(String hash) {
        return hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }
}
