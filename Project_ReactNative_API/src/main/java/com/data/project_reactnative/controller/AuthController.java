
package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.AuthResponse;
import com.data.project_reactnative.dto.LoginRequest;
import com.data.project_reactnative.dto.MessageResponse;
import com.data.project_reactnative.dto.RegisterRequest;
import com.data.project_reactnative.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@RequestBody RegisterRequest request) {
        MessageResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}