package com.backend.hrmanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double grossMonthly;
    private Double basic;
    private Double hra;
    private Double standardAllowance;
    private Double performanceBonus;
    private Double lta;
    private Double fixedAllowance;
    private Double pfRate;
    private Double professionalTax;

    @OneToOne
    private Employee employee;
}
