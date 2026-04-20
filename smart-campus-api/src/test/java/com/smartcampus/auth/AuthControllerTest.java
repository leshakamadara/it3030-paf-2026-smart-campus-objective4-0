package com.smartcampus.auth;

import com.smartcampus.auth.controller.AuthController;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
class AuthControllerTest {

    private final AuthController authController = new AuthController(null, null, null);

    @Test
    void dummyLoginShouldReturnBadRequestWhenEmailMissing() {
        ReflectionTestUtils.setField(authController, "allowDummyLogin", true);

        AuthController.DummyLoginRequest request = new AuthController.DummyLoginRequest();
        request.setEmail("   ");

        ResponseEntity<?> response = authController.dummyLogin(request);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());
    }

    @Test
    void dummyLoginShouldReturnForbiddenWhenDisabled() {
        ReflectionTestUtils.setField(authController, "allowDummyLogin", false);

        AuthController.DummyLoginRequest request = new AuthController.DummyLoginRequest();
        request.setEmail("student@smartcampus.com");

        ResponseEntity<?> response = authController.dummyLogin(request);

        assertEquals(403, response.getStatusCode().value());
    }
}
