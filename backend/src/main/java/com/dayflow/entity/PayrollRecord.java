package com.dayflow.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "payroll_record")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee is required")
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Month date is required")
    @Column(name = "month", nullable = false)
    private LocalDate month;

    @Column(name = "total_working_days")
    private Integer totalWorkingDays;

    @Column(name = "present_days")
    private Integer presentDays;

    @Column(name = "paid_leave_days")
    private Integer paidLeaveDays;

    @Column(name = "unpaid_leave_days")
    private Integer unpaidLeaveDays;

    @Column(name = "payable_days")
    private Integer payableDays;

    @Column(name = "gross_pay")
    private Double grossPay;

    @Column(name = "net_pay")
    private Double netPay;

    @Column(name = "payslip_url")
    private String payslipUrl;
}
