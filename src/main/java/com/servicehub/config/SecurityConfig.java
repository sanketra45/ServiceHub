package com.servicehub.config;

import com.servicehub.repository.UserRepository;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthFilter jwtAuthFilter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // ✅ CORS enable
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers("/api/auth/**").permitAll()

                        // IMAGES
                        .requestMatchers("/api/images/**").hasAuthority("PROVIDER")

                        // PUBLIC provider listing
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/providers/**").permitAll()

                        // PROVIDER-only
                        .requestMatchers("/api/providers/me/**").hasAuthority("PROVIDER")

                        .requestMatchers("/uploads/**").permitAll()

                        // CUSTOMER APIs
                        .requestMatchers("/api/emergency/**").hasAuthority("CUSTOMER")

                        // REVIEWS
                        .requestMatchers("/api/reviews/**").hasAnyAuthority("CUSTOMER", "PROVIDER")

                        // BOOKINGS
                        .requestMatchers("/api/bookings/**").hasAnyAuthority("CUSTOMER", "PROVIDER")

                        // ADMIN
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )

                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                    "User not found: " + email));

            return new CustomUserDetails(user);
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ FIXED CORS CONFIG
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();

        // 🔥 Allow Vercel and Localhost for CORS (Adding * pattern back if needed)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "https://service-hub-seven-phi.vercel.app",
                "*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 1 hour

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source =
                new org.springframework.web.cors.UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}