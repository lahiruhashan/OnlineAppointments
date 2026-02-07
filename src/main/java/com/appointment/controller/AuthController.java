package com.appointment.controller;

import com.appointment.dto.*;
import com.appointment.entity.User;
import com.appointment.security.JwtService;
import com.appointment.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerUser(request);
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();
        
        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());
        
        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", authResponse));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.findByEmail(request.getEmail()).orElseThrow();
        
        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());
        
        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> getProfile(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName()).orElseThrow();
        
        AuthResponse authResponse = AuthResponse.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }
}
