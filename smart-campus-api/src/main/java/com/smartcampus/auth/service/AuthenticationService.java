package com.smartcampus.auth.service;

import java.util.Optional;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.smartcampus.common.entity.Role;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.repository.UserRepository;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;

    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            updateUser(user, oAuth2User);
        } else {
            user = registerNewUser(oAuth2User);
        }
        return user;
    }

    private User registerNewUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user = new User();
        user.setEmail(email);
        user.setFullName(name);
        user.setPictureUrl(picture);
        user.setRole(Role.USER);
        user.setActive(true);

        return userRepository.save(user);
    }

    private void updateUser(User existingUser, OAuth2User oAuth2User) {
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        existingUser.setFullName(name);
        existingUser.setPictureUrl(picture);
        userRepository.save(existingUser);
    }
}
