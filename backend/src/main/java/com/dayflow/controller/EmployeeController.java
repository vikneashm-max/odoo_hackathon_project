package com.dayflow.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dayflow.entity.Company;
import com.dayflow.entity.Employee;
import com.dayflow.entity.LeaveBalance;
import com.dayflow.entity.SalaryStructure;
import com.dayflow.entity.enums.Role;
import com.dayflow.entity.enums.WageType;
import com.dayflow.repository.CompanyRepository;
import com.dayflow.repository.EmployeeRepository;
import com.dayflow.repository.LeaveBalanceRepository;
import com.dayflow.repository.SalaryStructureRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEmployees() {
        List<Employee> list = employeeRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Employee e : list) {
            response.add(buildEmployeeMap(e));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        Optional<Employee> empOpt = employeeRepository.findById(id);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }
        return ResponseEntity.ok(buildEmployeeMap(empOpt.get()));
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Map<String, Object> body) {
        String fullName = (String) body.getOrDefault("fullName", body.getOrDefault("name", "Employee"));
        String[] parts = fullName.trim().split(" ");
        String fName = parts[0];
        String lName = parts.length > 1 ? parts[parts.length - 1] : "Employee";

        Company company = companyRepository.findAll().stream().findFirst().orElse(null);

        long count = employeeRepository.count() + 1;
        String countryCode = (String) body.getOrDefault("countryCode", "IN");
        String initials = (fName.charAt(0) + "" + lName.charAt(0)).toUpperCase();
        String loginId = String.format("%s-%s-%d-%04d", countryCode.toUpperCase(), initials, 2026, count);

        Employee emp = new Employee();
        emp.setLoginId(loginId);
        emp.setFirstName(fName);
        emp.setLastName(lName);
        emp.setEmail((String) body.getOrDefault("email", fName.toLowerCase() + "." + lName.toLowerCase() + "@dayflow.com"));
        emp.setPhone((String) body.getOrDefault("phone", ""));
        emp.setAddress((String) body.getOrDefault("address", ""));
        emp.setDepartment((String) body.getOrDefault("department", "Engineering"));
        emp.setJobTitle((String) body.getOrDefault("jobTitle", "Staff Member"));
        emp.setRole(Role.EMPLOYEE);
        emp.setCompany(company);
        emp.setMustChangePassword(true);

        emp = employeeRepository.save(emp);

        // Leave Balance
        LeaveBalance lb = new LeaveBalance();
        lb.setEmployee(emp);
        lb.setPaidTimeOffAvailable(14.0);
        lb.setSickTimeOffAvailable(7.0);
        leaveBalanceRepository.save(lb);

        // Salary Structure
        SalaryStructure ss = new SalaryStructure();
        ss.setEmployee(emp);
        ss.setWageType(WageType.MONTHLY);
        ss.setMonthlyWage(60000.0);
        salaryStructureRepository.save(ss);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Employee created. Auto-generated Login ID: " + loginId,
            "employee", buildEmployeeMap(emp),
            "loginId", loginId,
            "tempPassword", "Temp@2026"
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<Employee> empOpt = employeeRepository.findById(id);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        Employee emp = empOpt.get();
        if (body.containsKey("firstName")) emp.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) emp.setLastName((String) body.get("lastName"));
        if (body.containsKey("fullName")) {
            String fullName = (String) body.get("fullName");
            String[] parts = fullName.trim().split(" ");
            emp.setFirstName(parts[0]);
            if (parts.length > 1) emp.setLastName(parts[parts.length - 1]);
        }
        if (body.containsKey("email")) emp.setEmail((String) body.get("email"));
        if (body.containsKey("phone")) emp.setPhone((String) body.get("phone"));
        if (body.containsKey("address")) emp.setAddress((String) body.get("address"));
        if (body.containsKey("department")) emp.setDepartment((String) body.get("department"));
        if (body.containsKey("jobTitle")) emp.setJobTitle((String) body.get("jobTitle"));
        if (body.containsKey("gender")) emp.setGender((String) body.get("gender"));
        if (body.containsKey("maritalStatus")) emp.setMaritalStatus((String) body.get("maritalStatus"));
        if (body.containsKey("about")) emp.setAbout((String) body.get("about"));
        if (body.containsKey("interests")) emp.setInterests((String) body.get("interests"));

        emp = employeeRepository.save(emp);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully.", "employee", buildEmployeeMap(emp)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }
        employeeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }

    private Map<String, Object> buildEmployeeMap(Employee e) {
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
        m.put("gender", e.getGender() != null ? e.getGender() : "");
        m.put("maritalStatus", e.getMaritalStatus() != null ? e.getMaritalStatus() : "");
        m.put("about", e.getAbout() != null ? e.getAbout() : "");
        m.put("interests", e.getInterests() != null ? e.getInterests() : "");
        m.put("dateOfJoining", e.getDateOfJoining() != null ? e.getDateOfJoining().toString() : "2026-01-01");
        m.put("status", "green");

        String initials = "";
        if (!e.getFirstName().isEmpty()) initials += e.getFirstName().charAt(0);
        if (!e.getLastName().isEmpty()) initials += e.getLastName().charAt(0);
        m.put("avatarInitials", initials.toUpperCase());
        return m;
    }
}
