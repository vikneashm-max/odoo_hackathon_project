package com.dayflow.entity;

import com.dayflow.entity.enums.ComputationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salary_component")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "salary_structure_id")
    private SalaryStructure salaryStructure;

    @NotBlank(message = "Component name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "computation_type")
    private ComputationType computationType;

    @Column(name = "value")
    private Double value;

    @Column(name = "percentage_of")
    private String percentageOf;

    @Column(name = "resolved_amount")
    private Double resolvedAmount;

    @PrePersist
    @PreUpdate
    public void validateAndCalculateResolvedAmount() {
        if (salaryStructure != null && salaryStructure.getMonthlyWage() != null) {
            double baseWage = salaryStructure.getMonthlyWage();
            if (computationType == ComputationType.PERCENTAGE && value != null) {
                this.resolvedAmount = (baseWage * value) / 100.0;
            } else if (computationType == ComputationType.FIXED && value != null) {
                this.resolvedAmount = value;
            }

            if (this.resolvedAmount != null && this.resolvedAmount > baseWage) {
                throw new IllegalArgumentException(
                    "Component '" + name + "' resolved amount (" + this.resolvedAmount + 
                    ") exceeds monthly wage (" + baseWage + ")"
                );
            }
        }
    }
}
