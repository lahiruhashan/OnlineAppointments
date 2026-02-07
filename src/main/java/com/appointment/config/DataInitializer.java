package com.appointment.config;

import com.appointment.entity.User;
import com.appointment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@appointment.com")) {
            User admin = User.builder()
                    .email("admin@appointment.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .role(User.UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin@appointment.com / admin123");
        }
    }
}
