package com.dayflow.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.dayflow.entity.enums.TimeOffStatus;
import com.dayflow.entity.enums.TimeOffType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "time_off_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeOffRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee is required")
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TimeOffType type;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "allocation_days")
    private Double allocationDays;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TimeOffStatus status = TimeOffStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_id")
    private Employee reviewedBy;

    @Column(name = "review_comments")
    private String reviewComments;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
