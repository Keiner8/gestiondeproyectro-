package grupo6.mapeo.config;

import grupo6.mapeo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true
)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilterBean() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                // CORS Configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF disabled for JWT authentication
                .csrf(csrf -> csrf.disable())
                // Session management - stateless (JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Endpoint security configuration
                .authorizeHttpRequests(auth -> auth
                    // Public endpoints
                    .requestMatchers("/", "/index.html", "/welcome", "/css/**", "/js/**", "/img/**", "/static/**").permitAll()
                    .requestMatchers("/login", "/register", "/api/auth/**").permitAll()
                    .requestMatchers("/favicon.ico", "/.well-known/**").permitAll()
                    .requestMatchers("/dashboard/**").permitAll()
                    // Require authentication for all other endpoints
                    .anyRequest().authenticated()
                )
                // Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // Headers security
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                // Exception handling
                .exceptionHandling(exception -> exception
                    .authenticationEntryPoint((request, response, authException) -> {
                        String requestURI = request.getRequestURI();
                        // Si es una solicitud AJAX o API, devolver JSON
                        if (requestURI.startsWith("/api/")) {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(401);
                            response.getWriter().write("{\"error\": \"Unauthorized - Token inválido o expirado\"}");
                        } else {
                            // Si es una página, redirigir a login
                            response.sendRedirect("/login");
                        }
                    })
                    .accessDeniedHandler((request, response, accessDeniedException) -> {
                        String requestURI = request.getRequestURI();
                        // Si es una solicitud AJAX o API, devolver JSON
                        if (requestURI.startsWith("/api/")) {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(403);
                            response.getWriter().write("{\"error\": \"Access Denied - No tienes permisos para acceder a este recurso\"}");
                        } else {
                            // Si es una página, redirigir a login
                            response.sendRedirect("/login");
                        }
                    })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
