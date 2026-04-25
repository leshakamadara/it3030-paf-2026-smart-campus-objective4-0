package com.smartcampus.config;

import com.smartcampus.auth.filter.JwtAuthenticationFilter;
import com.smartcampus.auth.handler.OAuth2FailureHandler;
import com.smartcampus.auth.handler.OAuth2SuccessHandler;
import com.smartcampus.auth.service.OAuth2UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import jakarta.servlet.DispatcherType;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;
    private final OAuth2UserService oAuth2UserService;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider;
    private final Environment environment;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            OAuth2SuccessHandler oAuth2SuccessHandler,
            OAuth2FailureHandler oAuth2FailureHandler,
            OAuth2UserService oAuth2UserService,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider,
            Environment environment
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
        this.oAuth2UserService = oAuth2UserService;
        this.clientRegistrationRepositoryProvider = clientRegistrationRepositoryProvider;
        this.environment = environment;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**", "/error").permitAll()
                .requestMatchers("/api/auth/dummy-login").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/register-admin", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/emailTester").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bookings/qr/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bookings/resource/*/upcoming").authenticated()
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/me", "/api/auth/refresh").hasAnyRole("USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").hasAnyRole("USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/users/me", "/api/users/me/profile").hasAnyRole("USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/users/me/notification-prefs").hasAnyRole("USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(formLogin -> formLogin.disable());

        ClientRegistrationRepository repository = clientRegistrationRepositoryProvider.getIfAvailable();
        String googleClientId = environment.getProperty("spring.security.oauth2.client.registration.google.client-id", "");
        log.info("Google OAuth client-id configured: {}", googleClientId.isBlank() ? "no" : "yes");

        if (repository != null) {
            http.oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                .failureHandler(oAuth2FailureHandler)
                .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
            );
        } else {
            log.warn("ClientRegistrationRepository is not available; OAuth2 login endpoints will not be active");
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
        roleHierarchy.setHierarchy("ROLE_SUPER_ADMIN > ROLE_ADMIN\nROLE_ADMIN > ROLE_TECHNICIAN\nROLE_TECHNICIAN > ROLE_USER");
        return roleHierarchy;
    }

    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
        expressionHandler.setRoleHierarchy(roleHierarchy);
        return expressionHandler;
    }

}
