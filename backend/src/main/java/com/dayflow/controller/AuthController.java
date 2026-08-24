package com.dayflow.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dayflow.entity.Attendance;
import com.dayflow.entity.Company;
import com.dayflow.entity.Employee;
import com.dayflow.entity.LeaveBalance;
import com.dayflow.entity.SalaryStructure;
import com.dayflow.entity.enums.AttendanceStatus;
import com.dayflow.entity.enums.Role;
import com.dayflow.entity.enums.WageType;
import com.dayflow.repository.AttendanceRepository;
import com.dayflow.repository.CompanyRepository;
import com.dayflow.repository.EmployeeRepository;
import com.dayflow.repository.LeaveBalanceRepository;
import com.dayflow.repository.SalaryStructureRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final AttendanceRepository attendanceRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String identifier = (request.getLoginIdOrEmail() != null ? request.getLoginIdOrEmail() : "").trim();
        if (identifier.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Login ID or Email is required"));
        }

        Optional<Employee> empOpt = employeeRepository.findByLoginId(identifier);
        if (empOpt.isEmpty()) {
            empOpt = employeeRepository.findByEmail(identifier);
        }

        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Account not found with Login ID / Email: " + identifier));
        }

        Employee employee = empOpt.get();

        // Auto check-in on login to record attendance in database
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        Attendance att = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today).orElseGet(() -> {
            Attendance a = new Attendance();
            a.setEmployee(employee);
            a.setDate(today);
            return a;
        });

        if (att.getCheckInTime() == null || att.getCheckOutTime() != null) {
            att.setCheckInTime(now);
            att.setCheckOutTime(null);
            att.setStatus(AttendanceStatus.PRESENT);
            attendanceRepository.save(att);
        }

        Map<String, Object> userMap = buildUserMap(employee);
        String token = "dayflow-jwt-token-" + employee.getId() + "-" + System.currentTimeMillis();

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", userMap,
            "message", "Login successful"
        ));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterAdminRequest request) {
        String companyName = request.getCompanyName() != null ? request.getCompanyName() : "Company";
        Company company = companyRepository.findAll().stream().findFirst().orElseGet(() -> {
            Company c = new Company();
            c.setName(companyName);
            c.setCountryCode(request.getCountryCode() != null ? request.getCountryCode() : "IN");
            return companyRepository.save(c);
        });

        String name = request.getName() != null ? request.getName().trim() : "Admin";
        String[] parts = name.split(" ");
        String fName = parts[0];
        String lName = parts.length > 1 ? parts[parts.length - 1] : "Admin";

        long count = employeeRepository.count() + 1;
        String cc = (request.getCountryCode() != null ? request.getCountryCode() : "IN").toUpperCase();
        String initials = (fName.charAt(0) + "" + lName.charAt(0)).toUpperCase();
        String loginId = String.format("%s-%s-%d-%04d", cc, initials, 2026, count);

        Employee admin = new Employee();
        admin.setLoginId(loginId);
        admin.setFirstName(fName);
        admin.setLastName(lName);
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setRole(Role.ADMIN);
        admin.setCompany(company);
        admin.setDepartment("Executive Management");
        admin.setJobTitle("HR Director / Admin");
        admin.setMustChangePassword(false);
        admin = employeeRepository.save(admin);

        Map<String, Object> userMap = buildUserMap(admin);
        String token = "dayflow-jwt-token-admin-" + admin.getId();

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", userMap,
            "message", "Admin registered successfully"
        ));
    }

    @PostMapping("/register-employee")
    public ResponseEntity<?> registerEmployee(@RequestBody RegisterEmployeeRequest request) {
        String fullName = request.getFullName() != null ? request.getFullName().trim() : "New Employee";
        String[] parts = fullName.split(" ");
        String fName = parts[0];
        String lName = parts.length > 1 ? parts[parts.length - 1] : "Employee";

        Company company = companyRepository.findAll().stream().findFirst().orElse(null);

        long count = employeeRepository.count() + 1;
        String cc = (request.getCountryCode() != null ? request.getCountryCode() : "IN").toUpperCase();
        String initials = (fName.charAt(0) + "" + lName.charAt(0)).toUpperCase();
        String loginId = String.format("%s-%s-%d-%04d", cc, initials, 2026, count);

        Employee emp = new Employee();
        emp.setLoginId(loginId);
        emp.setFirstName(fName);
        emp.setLastName(lName);
        emp.setEmail(request.getEmail());
        emp.setPhone(request.getPhone());
        emp.setRole(Role.EMPLOYEE);
        emp.setCompany(company);
        emp.setDepartment("Engineering");
        emp.setJobTitle("Software Engineer");
        emp.setMustChangePassword(true);
        emp = employeeRepository.save(emp);

        // Save initial Leave Balance
        LeaveBalance lb = new LeaveBalance();
        lb.setEmployee(emp);
        lb.setPaidTimeOffAvailable(14.0);
        lb.setSickTimeOffAvailable(7.0);
        leaveBalanceRepository.save(lb);

        // Save initial Salary Structure
        SalaryStructure ss = new SalaryStructure();
        ss.setEmployee(emp);
        ss.setWageType(WageType.MONTHLY);
        ss.setMonthlyWage(60000.0);
        salaryStructureRepository.save(ss);

        Map<String, Object> userMap = buildUserMap(emp);
        String token = "dayflow-jwt-token-emp-" + emp.getId();

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", userMap,
            "loginId", loginId,
            "message", "Employee registered successfully. Login ID: " + loginId
        ));
    }

    private Map<String, Object> buildUserMap(Employee e) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", String.valueOf(e.getId()));
        m.put("loginId", e.getLoginId());
        String fullName = (e.getFirstName() + " " + e.getLastName()).trim();
        m.put("fullName", fullName);
        m.put("name", fullName);
        m.put("email", e.getEmail());
        m.put("phone", e.getPhone() != null ? e.getPhone() : "");
        m.put("address", e.getAddress() != null ? e.getAddress() : "");
        m.put("department", e.getDepartment() != null ? e.getDepartment() : "");
        m.put("jobTitle", e.getJobTitle() != null ? e.getJobTitle() : "");
        m.put("role", e.getRole() != null ? e.getRole().name().toLowerCase() : "employee");
        m.put("userRole", e.getRole() != null ? e.getRole().name().toLowerCase() : "employee");
        m.put("status", "green");
        String initials = "";
        if (!e.getFirstName().isEmpty()) initials += e.getFirstName().charAt(0);
        if (!e.getLastName().isEmpty()) initials += e.getLastName().charAt(0);
        m.put("avatarInitials", initials.toUpperCase());
        return m;
    }

    @Data
    public static class LoginRequest {
        private String loginIdOrEmail;
        private String password;
    }

    @Data
    public static class RegisterAdminRequest {
        private String companyName;
        private String name;
        private String email;
        private String phone;
        private String password;
        private String countryCode;
    }

    @Data
    public static class RegisterEmployeeRequest {
        private String fullName;
        private String email;
        private String phone;
        private String password;
        private String countryCode;
    }
}
