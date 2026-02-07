package com.appointment.controller;

import com.appointment.dto.*;
import com.appointment.entity.User;
import com.appointment.repository.UserRepository;
import com.appointment.security.JwtService;
import com.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            Authentication authentication
    ) {
        Long userId = jwtService.extractUserId(authentication.getName());
        AppointmentResponse response = appointmentService.createAppointment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment created successfully", response));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(Authentication authentication) {
        Long userId = jwtService.extractUserId(authentication.getName());
        List<AppointmentResponse> appointments = appointmentService.getUserAppointments(userId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointment(@PathVariable Long id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request
    ) {
        AppointmentResponse response = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", null));
    }
    
    @GetMapping("/slots/{date}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAvailableSlots(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime date
    ) {
        List<AppointmentResponse> slots = appointmentService.getAvailableSlots(date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}
