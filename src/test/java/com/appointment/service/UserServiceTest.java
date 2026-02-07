package com.appointment.service;

import com.appointment.dto.RegisterRequest;
import com.appointment.entity.User;
import com.appointment.repository.UserRepository;
import com.appointment.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private UserService userService;
    
    private RegisterRequest registerRequest;
    private User testUser;
    
    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password123")
                .build();
        
        testUser = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("encodedPassword")
                .role(User.UserRole.USER)
                .build();
    }
    
    @Test
    void registerUser_Success() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        // When
        User result = userService.registerUser(registerRequest);
        
        // Then
        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("john@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }
    
    @Test
    void registerUser_EmailAlreadyExists_ThrowsException() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.registerUser(registerRequest));
        
        assertEquals("Email is already registered", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void findByEmail_UserExists_ReturnsUser() {
        // Given
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        
        // When
        Optional<User> result = userService.findByEmail("john@example.com");
        
        // Then
        assertTrue(result.isPresent());
        assertEquals("John", result.get().getFirstName());
    }
    
    @Test
    void findByEmail_UserNotExists_ReturnsEmpty() {
        // Given
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());
        
        // When
        Optional<User> result = userService.findByEmail("unknown@example.com");
        
        // Then
        assertTrue(result.isEmpty());
    }
}
