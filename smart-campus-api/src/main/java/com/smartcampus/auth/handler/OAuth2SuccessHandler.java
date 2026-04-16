package com.smartcampus.auth.handler;

import com.smartcampus.auth.service.AuthenticationService;
import com.smartcampus.auth.service.JwtService;
import com.smartcampus.user.entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/auth/callback}")
    private String authorizedRedirectUri;

    public OAuth2SuccessHandler(AuthenticationService authenticationService, JwtService jwtService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof OAuth2User oAuth2User)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 authentication failed");
            return;
        }

        User user = authenticationService.processOAuth2User(oAuth2User);
        String token = jwtService.generateToken(user);
        String targetUrl = UriComponentsBuilder
                .fromUriString(authorizedRedirectUri)
                .queryParam("token", token)
                .build(true)
                .toUriString();

        response.sendRedirect(targetUrl);
    }
}
