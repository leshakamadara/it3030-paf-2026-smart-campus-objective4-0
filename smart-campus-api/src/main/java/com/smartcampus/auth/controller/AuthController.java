package com.smartcampus.auth.controller;

import com.smartcampus.auth.service.AuthenticationService;
import com.smartcampus.auth.service.JwtTokenProvider;
import com.smartcampus.common.entity.Role;
import com.smartcampus.user.dto.UserDto;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.mapper.UserMapper;
import com.smartcampus.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public AuthController(AuthenticationService authenticationService, JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.authenticationService = authenticationService;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User oAuth2User, Authentication authentication) {
        User user = authenticationService.processOAuth2User(oAuth2User);
        String token = tokenProvider.generateToken(authentication);
        UserDto userDto = UserMapper.INSTANCE.userToUserDto(user);
        return ResponseEntity.ok().header("Authorization", "Bearer " + token).body(userDto);
    }

    @PostMapping("/dummy-login")
    public ResponseEntity<?> dummyLogin(@RequestBody DummyLoginRequest request) {
        String email = request.getEmail();
        String fullName = request.getFullName();

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(fullName != null && !fullName.isBlank() ? fullName : email);
            newUser.setRole(Role.USER);
            newUser.setActive(true);
            return userRepository.save(newUser);
        });

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String token = tokenProvider.generateToken(authToken);
        UserDto userDto = UserMapper.INSTANCE.userToUserDto(user);
        return ResponseEntity.ok().header("Authorization", "Bearer " + token).body(userDto);
    }

    public static class DummyLoginRequest {
        private String email;
        private String fullName;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }
}
