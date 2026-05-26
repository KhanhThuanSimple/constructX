package com.constructx.backend;

import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ConstructxBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConstructxBackendApplication.class, args);
    }

    @Bean
    public Hibernate6Module hibernate6Module() {
        return new Hibernate6Module();
    }

    @Bean
    public org.springframework.boot.CommandLineRunner initAdmin(
            UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        return args -> {
            userRepository.findByEmail("admin@constructx.com").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    userRepository.save(admin);
                    System.out.println(">>> Updated existing ADMIN account password: admin@constructx.com / admin123");
                },
                () -> {
                    User admin = new User();
                    admin.setFullName("Admin Hệ Thống");
                    admin.setEmail("admin@constructx.com");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole(User.Role.ADMIN);
                    admin.setActive(true);
                    admin.setCreatedAt(java.time.LocalDateTime.now());
                    userRepository.save(admin);
                    System.out.println(">>> Created new default ADMIN account: admin@constructx.com / admin123");
                }
            );
        };
    }
}
