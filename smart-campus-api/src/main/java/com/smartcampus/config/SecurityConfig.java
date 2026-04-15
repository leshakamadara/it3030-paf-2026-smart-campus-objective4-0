package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())   //  disable CSRF for APIs
            .cors(withDefaults())          // enable CORS
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**", "/error").permitAll()  // allow API calls and error endpoint
                .anyRequest().authenticated()
            );

        return http.build();
    }
}