package com.backend.hrmanagement.entity;

import java.time.LocalDate;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String loginId;          // auto-generated: CC-XX-YYYY-####
    private String firstName;
    private String lastName;
    @Column(unique = true)
    private String email;
    private String phone;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToOne
    private Company company;

    private String department;
    @ManyToOne
    private Employee manager;        // self-referencing

    private String jobTitle;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String address;
    private String gender;
    private String maritalStatus;
    private LocalDate dateOfJoining;

    @Column(length = 2000)
    private String about;
    @Column(length = 2000)
    private String interests;

    private boolean mustChangePassword;  // true until first login password change

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    private List<Skill> skills;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    private List<Certification> certifications;

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
    private LeaveBalance leaveBalance;

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
    private SalaryStructure salaryStructure;
}
