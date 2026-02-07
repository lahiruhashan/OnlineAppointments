package com.appointment.repository;

import com.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByUserId(Long userId);
    
    List<Appointment> findByUserIdAndStatus(Long userId, Appointment.AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.startTime >= :startTime AND a.endTime <= :endTime ORDER BY a.startTime ASC")
    List<Appointment> findAppointmentsBetweenDates(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.startTime >= :date AND a.startTime < :datePlusOne ORDER BY a.startTime ASC")
    List<Appointment> findByDate(@Param("date") LocalDateTime date, @Param("datePlusOne") LocalDateTime datePlusOne);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") Appointment.AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.startTime >= :now AND a.status = 'SCHEDULED' ORDER BY a.startTime ASC")
    List<Appointment> findUpcomingAppointments(@Param("now") LocalDateTime now);
}
