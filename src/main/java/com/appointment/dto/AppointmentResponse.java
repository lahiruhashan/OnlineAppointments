package com.appointment.dto;

import com.appointment.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
    
    public static AppointmentResponse fromEntity(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .title(appointment.getTitle())
                .description(appointment.getDescription())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus().name())
                .userName(appointment.getUser().getFullName())
                .userEmail(appointment.getUser().getEmail())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
