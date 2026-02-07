package com.appointment.controller;

import com.appointment.dto.ApiResponse;
import com.appointment.dto.AppointmentRequest;
import com.appointment.dto.AppointmentResponse;
import com.appointment.entity.User;
import com.appointment.repository.UserRepository;
import com.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    
    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
    
    @PutMapping("/appointments/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request
    ) {
        AppointmentResponse response = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", response));
    }
    
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    // Simple UserResponse DTO for admin user listing
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class UserResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        
        public static UserResponse fromEntity(User user) {
            UserResponse response = new UserResponse();
            response.id = user.getId();
            response.email = user.getEmail();
            response.firstName = user.getFirstName();
            response.lastName = user.getLastName();
            response.role = user.getRole().name();
            return response;
        }
    }
}
