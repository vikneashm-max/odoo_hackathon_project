package com.dayflow.entity;

import java.util.ArrayList;
import java.util.List;

import com.dayflow.entity.enums.WageType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salary_structure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee is required")
    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "wage_type")
    private WageType wageType = WageType.MONTHLY;

    @Column(name = "monthly_wage")
    private Double monthlyWage;

    @Column(name = "yearly_wage")
    private Double yearlyWage;

    @Column(name = "working_days_per_week")
    private Integer workingDaysPerWeek = 5;

    @Column(name = "break_time_hrs")
    private Double breakTimeHrs = 1.0;

    @Column(name = "pf_rate_percent")
    private Double pfRatePercent = 12.0;

    @Column(name = "professional_tax")
    private Double professionalTax = 200.0;

    @OneToMany(mappedBy = "salaryStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalaryComponent> components = new ArrayList<>();
}
