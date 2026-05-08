package com.clinica.agenda.config;

import com.clinica.agenda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garantiza que los usuarios semilla tengan un hash BCrypt valido para "password123".
 * Asi cualquier persona que clone el repo entra inmediatamente.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String demoHash = passwordEncoder.encode("password123");
        userRepository.findAll().forEach(u -> {
            if (!u.getPasswordHash().startsWith("$2a$") || !passwordEncoder.matches("password123", u.getPasswordHash())) {
                u.setPasswordHash(demoHash);
                userRepository.save(u);
                log.info("seeded password for user {}", u.getEmail());
            }
        });
    }
}
