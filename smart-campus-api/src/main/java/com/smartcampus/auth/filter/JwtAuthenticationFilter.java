package com.smartcampus.auth.filter;

import com.smartcampus.auth.service.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationFilter extends JwtAuthFilter {

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        super(jwtService, userDetailsService);
    }
}
