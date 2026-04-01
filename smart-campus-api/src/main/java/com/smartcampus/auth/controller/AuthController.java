package com.smartcampus.auth.controller;

import com.smartcampus.auth.service.AuthenticationService;
import com.smartcampus.auth.service.JwtTokenProvider;
import com.smartcampus.user.dto.UserDto;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationService authenticationService, JwtTokenProvider tokenProvider) {
        this.authenticationService = authenticationService;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User oAuth2User, Authentication authentication) {
        User user = authenticationService.processOAuth2User(oAuth2User);
        String token = tokenProvider.generateToken(authentication);
        UserDto userDto = UserMapper.INSTANCE.userToUserDto(user);
        return ResponseEntity.ok().header("Authorization", "Bearer " + token).body(userDto);
    }
}
