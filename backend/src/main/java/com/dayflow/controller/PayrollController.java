package com.dayflow.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dayflow.entity.Employee;
import com.dayflow.entity.SalaryComponent;
import com.dayflow.entity.SalaryStructure;
import com.dayflow.repository.EmployeeRepository;
import com.dayflow.repository.SalaryStructureRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PayrollController {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/structure/{employeeId}")
    public ResponseEntity<?> getSalaryStructure(@PathVariable Long employeeId) {
        Optional<SalaryStructure> ssOpt = salaryStructureRepository.findByEmployeeId(employeeId);
        if (ssOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "grossMonthly", 60000.0,
                "basic", 30000.0,
                "hra", 12000.0,
                "pfRate", 12.0,
                "professionalTax", 200.0
            ));
        }

        SalaryStructure ss = ssOpt.get();
        Map<String, Object> result = new HashMap<>();
        result.put("id", String.valueOf(ss.getId()));
        result.put("grossMonthly", ss.getMonthlyWage() != null ? ss.getMonthlyWage() : 60000.0);
        result.put("pfRate", ss.getPfRatePercent() != null ? ss.getPfRatePercent() : 12.0);
        result.put("professionalTax", ss.getProfessionalTax() != null ? ss.getProfessionalTax() : 200.0);

        List<Map<String, Object>> components = new ArrayList<>();
        if (ss.getComponents() != null) {
            for (SalaryComponent sc : ss.getComponents()) {
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", String.valueOf(sc.getId()));
                cMap.put("name", sc.getName());
                cMap.put("type", sc.getComputationType() != null ? sc.getComputationType().name().toLowerCase() : "fixed");
                cMap.put("value", sc.getValue());
                cMap.put("resolvedAmount", sc.getResolvedAmount());
                components.add(cMap);
            }
        }
        result.put("components", components);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/structure/{employeeId}")
    public ResponseEntity<?> updateSalaryStructure(@PathVariable Long employeeId, @RequestBody Map<String, Object> body) {
        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        SalaryStructure ss = salaryStructureRepository.findByEmployeeId(employeeId).orElseGet(() -> {
            SalaryStructure s = new SalaryStructure();
            s.setEmployee(empOpt.get());
            return s;
        });

        if (body.containsKey("grossMonthly")) {
            ss.setMonthlyWage(Double.valueOf(body.get("grossMonthly").toString()));
            ss.setYearlyWage(ss.getMonthlyWage() * 12);
        }
        if (body.containsKey("pfRate")) {
            ss.setPfRatePercent(Double.valueOf(body.get("pfRate").toString()));
        }
        if (body.containsKey("professionalTax")) {
            ss.setProfessionalTax(Double.valueOf(body.get("professionalTax").toString()));
        }

        ss = salaryStructureRepository.save(ss);
        return ResponseEntity.ok(Map.of("message", "Salary structure updated successfully.", "salaryStructure", ss));
    }
}
