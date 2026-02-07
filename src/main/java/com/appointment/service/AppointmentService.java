package com.appointment.service;

import com.appointment.dto.AppointmentRequest;
import com.appointment.dto.AppointmentResponse;
import com.appointment.entity.Appointment;
import com.appointment.entity.User;
import com.appointment.repository.AppointmentRepository;
import com.appointment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AppointmentResponse createAppointment(Long userId, AppointmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check for overlapping appointments
        validateNoOverlap(request.getStartTime(), request.getEndTime());
        
        Appointment appointment = Appointment.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .build();
        
        Appointment saved = appointmentRepository.save(appointment);
        return AppointmentResponse.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUserAppointments(Long userId) {
        return appointmentRepository.findByUserId(userId).stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return AppointmentResponse.fromEntity(appointment);
    }
    
    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setTitle(request.getTitle());
        appointment.setDescription(request.getDescription());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        
        Appointment updated = appointmentRepository.save(appointment);
        return AppointmentResponse.fromEntity(updated);
    }
    
    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }
    
    @Transactional
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAvailableSlots(LocalDateTime date) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        List<Appointment> bookedAppointments = appointmentRepository.findByDate(startOfDay, endOfDay);
        
        // Generate all possible 1-hour slots for the day (24/7)
        return generateAllDaySlots(startOfDay);
    }
    
    private List<AppointmentResponse> generateAllDaySlots(LocalDateTime startOfDay) {
        List<AppointmentResponse> slots = new java.util.ArrayList<>();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        LocalDateTime currentSlot = startOfDay;
        
        // Generate 1-hour slots from 8 AM to 6 PM
        while (currentSlot.plusHours(1).isBefore(endOfDay) || currentSlot.plusHours(1).equals(endOfDay)) {
            if (currentSlot.getHour() >= 8 && currentSlot.getHour() < 18) {
                slots.add(AppointmentResponse.builder()
                        .title("Available Slot")
                        .startTime(currentSlot)
                        .endTime(currentSlot.plusHours(1))
                        .status("AVAILABLE")
                        .build());
            }
            currentSlot = currentSlot.plusHours(1);
        }
        
        return slots;
    }
    
    private void validateNoOverlap(LocalDateTime startTime, LocalDateTime endTime) {
        List<Appointment> overlaps = appointmentRepository.findAppointmentsBetweenDates(startTime, endTime);
        if (!overlaps.isEmpty()) {
            throw new RuntimeException("Time slot overlaps with an existing appointment");
        }
    }
}
