package com.dayflow.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dayflow.entity.Employee;
import com.dayflow.entity.LeaveBalance;
import com.dayflow.entity.TimeOffRequest;
import com.dayflow.entity.enums.TimeOffStatus;
import com.dayflow.entity.enums.TimeOffType;
import com.dayflow.repository.EmployeeRepository;
import com.dayflow.repository.LeaveBalanceRepository;
import com.dayflow.repository.TimeOffRequestRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/timeoff")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TimeOffController {

    private final TimeOffRequestRepository timeOffRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRequests() {
        List<TimeOffRequest> list = timeOffRequestRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (TimeOffRequest req : list) {
            result.add(buildRequestMap(req));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeRequests(@PathVariable Long employeeId) {
        List<TimeOffRequest> list = timeOffRequestRepository.findByEmployeeId(employeeId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (TimeOffRequest req : list) {
            result.add(buildRequestMap(req));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        String typeStr = (String) body.getOrDefault("leaveType", "PAID");
        TimeOffType type = TimeOffType.valueOf(typeStr.toUpperCase());

        LocalDate startDate = LocalDate.parse((String) body.get("startDate"));
        LocalDate endDate = LocalDate.parse((String) body.get("endDate"));
        String reason = (String) body.getOrDefault("reason", "");

        TimeOffRequest req = new TimeOffRequest();
        req.setEmployee(empOpt.get());
        req.setType(type);
        req.setStartDate(startDate);
        req.setEndDate(endDate);
        req.setAllocationDays((double) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1);
        req.setRemarks(reason);
        req.setStatus(TimeOffStatus.PENDING);

        req = timeOffRequestRepository.save(req);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Leave request submitted successfully. Status: Pending Admin Approval.",
            "request", buildRequestMap(req)
        ));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Optional<TimeOffRequest> reqOpt = timeOffRequestRepository.findById(id);
        if (reqOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Time off request not found"));
        }

        TimeOffRequest req = reqOpt.get();
        req.setStatus(TimeOffStatus.APPROVED);
        req.setReviewedAt(LocalDateTime.now());
        if (body != null && body.containsKey("comments")) {
            req.setReviewComments((String) body.get("comments"));
        }
        req = timeOffRequestRepository.save(req);

        return ResponseEntity.ok(Map.of("message", "Leave request approved successfully.", "request", buildRequestMap(req)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Optional<TimeOffRequest> reqOpt = timeOffRequestRepository.findById(id);
        if (reqOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Time off request not found"));
        }

        TimeOffRequest req = reqOpt.get();
        req.setStatus(TimeOffStatus.REJECTED);
        req.setReviewedAt(LocalDateTime.now());
        if (body != null && body.containsKey("comments")) {
            req.setReviewComments((String) body.get("comments"));
        }
        req = timeOffRequestRepository.save(req);

        return ResponseEntity.ok(Map.of("message", "Leave request rejected successfully.", "request", buildRequestMap(req)));
    }

    @GetMapping("/balance/{employeeId}")
    public ResponseEntity<?> getLeaveBalance(@PathVariable Long employeeId) {
        Optional<LeaveBalance> lbOpt = leaveBalanceRepository.findByEmployeeId(employeeId);
        if (lbOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "paidTimeOffAvailable", 14.0,
                "sickTimeOffAvailable", 7.0,
                "unpaidTaken", 0.0
            ));
        }
        LeaveBalance lb = lbOpt.get();
        return ResponseEntity.ok(Map.of(
            "paidTimeOffAvailable", lb.getPaidTimeOffAvailable(),
            "sickTimeOffAvailable", lb.getSickTimeOffAvailable(),
            "unpaidTaken", lb.getUnpaidTaken()
        ));
    }

    private Map<String, Object> buildRequestMap(TimeOffRequest r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", String.valueOf(r.getId()));
        String empName = r.getEmployee() != null ? (r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName()).trim() : "Employee";
        m.put("employeeName", empName);
        m.put("leaveType", r.getType() != null ? r.getType().name().toLowerCase() : "paid");
        m.put("startDate", r.getStartDate() != null ? r.getStartDate().toString() : "");
        m.put("endDate", r.getEndDate() != null ? r.getEndDate().toString() : "");
        m.put("reason", r.getRemarks() != null ? r.getRemarks() : "");
        m.put("status", r.getStatus() != null ? r.getStatus().name() : "PENDING");
        m.put("submittedAt", r.getStartDate() != null ? r.getStartDate().toString() : "");
        return m;
    }
}
