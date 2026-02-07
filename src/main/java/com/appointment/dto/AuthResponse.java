package com.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String tokenType;
    private Long expiresIn;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
