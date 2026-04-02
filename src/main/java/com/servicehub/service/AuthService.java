package com.servicehub.service;

import com.servicehub.dto.request.*;
import com.servicehub.dto.response.AuthResponse;
import com.servicehub.model.ServiceProvider;
import com.servicehub.model.User;
import com.servicehub.repository.ServiceProviderRepository;
import com.servicehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // ✅ REGISTER
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .enabled(true) // 🔥 IMPORTANT (avoid login block)
                .build();

        userRepository.save(user);

        if (com.servicehub.model.enums.Role.PROVIDER.equals(request.getRole()) && request.getServiceType() != null) {
            ServiceProvider provider = ServiceProvider.builder()
                    .user(user)
                    .serviceType(request.getServiceType())
                    .city("") // Needs to be filled in dashboard
                    .address("")
                    .description("")
                    .hourlyRate(0.0)
                    .experienceYears(0)
                    .build();
            serviceProviderRepository.save(provider);
        }

        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            System.out.println("Email sending failed");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getName()
        );
    }

    // ✅ LOGIN
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        } catch (DisabledException e) {
            throw new RuntimeException("User account is disabled");
        } catch (LockedException e) {
            throw new RuntimeException("User account is locked");
        } catch (Exception e) {
            e.printStackTrace(); // 🔥 DEBUG
            throw new RuntimeException("Login failed: " + e.getMessage());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getName()
        );
    }
}