package com.dayflow.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dayflow.entity.Attendance;
import com.dayflow.entity.Employee;
import com.dayflow.entity.enums.AttendanceStatus;
import com.dayflow.repository.AttendanceRepository;
import com.dayflow.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/status/{employeeId}")
    public ResponseEntity<?> getAttendanceStatus(@PathVariable Long employeeId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> attOpt = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (attOpt.isPresent() && attOpt.get().getCheckInTime() != null && attOpt.get().getCheckOutTime() == null) {
            String checkInStr = attOpt.get().getCheckInTime().format(DateTimeFormatter.ofPattern("hh:mm a"));
            return ResponseEntity.ok(Map.of(
                "isCheckedIn", true,
                "checkInTime", checkInStr,
                "status", attOpt.get().getStatus().name()
            ));
        }
        return ResponseEntity.ok(Map.of("isCheckedIn", false));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>> getEmployeeAttendanceLogs(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        List<Attendance> logs = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, start, end);
        List<Map<String, Object>> logList = new ArrayList<>();

        for (Attendance a : logs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", String.valueOf(a.getId()));
            map.put("date", a.getDate().toString());
            map.put("checkIn", a.getCheckInTime() != null ? a.getCheckInTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "--:--");
            map.put("checkOut", a.getCheckOutTime() != null ? a.getCheckOutTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "--:--");
            map.put("workHours", a.getWorkHours() != null ? a.getWorkHours() + "h" : "0h");
            map.put("extraHours", a.getExtraHours() != null ? a.getExtraHours() + "h" : "0h");
            map.put("status", a.getStatus() != null ? a.getStatus().name() : "PRESENT");
            logList.add(map);
        }

        int presentCount = (int) logs.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        int leaveCount = (int) logs.stream().filter(a -> a.getStatus() == AttendanceStatus.LEAVE).count();

        Map<String, Object> response = new HashMap<>();
        response.put("logs", logList);
        response.put("payableDaysInfo", Map.of(
            "totalWorkingDays", logs.size(),
            "presentDays", presentCount,
            "paidLeaveDays", leaveCount,
            "payableDays", presentCount + leaveCount
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyAttendance(@RequestParam(required = false) String dateStr) {
        LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
        List<Employee> employees = employeeRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Employee emp : employees) {
            Optional<Attendance> attOpt = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), date);
            Map<String, Object> map = new HashMap<>();
            map.put("id", String.valueOf(emp.getId()));
            map.put("name", (emp.getFirstName() + " " + emp.getLastName()).trim());
            map.put("role", emp.getJobTitle() != null ? emp.getJobTitle() : "Employee");

            if (attOpt.isPresent()) {
                Attendance a = attOpt.get();
                map.put("checkIn", a.getCheckInTime() != null ? a.getCheckInTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "--:--");
                map.put("checkOut", a.getCheckOutTime() != null ? a.getCheckOutTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "--:--");
                map.put("workHours", a.getWorkHours() != null ? a.getWorkHours() + "h" : "0h");
                map.put("extraHours", a.getExtraHours() != null ? a.getExtraHours() + "h" : "0h");
                map.put("status", a.getStatus() != null ? a.getStatus().name() : "PRESENT");
            } else {
                map.put("checkIn", "--:--");
                map.put("checkOut", "--:--");
                map.put("workHours", "0h");
                map.put("extraHours", "0h");
                map.put("status", "ABSENT");
            }
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Attendance att = attendanceRepository.findByEmployeeIdAndDate(employeeId, today).orElseGet(() -> {
            Attendance a = new Attendance();
            a.setEmployee(empOpt.get());
            a.setDate(today);
            return a;
        });

        att.setCheckInTime(now);
        att.setStatus(AttendanceStatus.PRESENT);
        attendanceRepository.save(att);

        String timeStr = now.format(DateTimeFormatter.ofPattern("hh:mm a"));
        return ResponseEntity.ok(Map.of(
            "message", "Checked in successfully at " + timeStr,
            "checkInTime", timeStr,
            "status", "PRESENT"
        ));
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> attOpt = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (attOpt.isEmpty() || attOpt.get().getCheckInTime() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Please check in first before checking out."));
        }

        Attendance att = attOpt.get();
        att.setCheckOutTime(now);

        long seconds = java.time.Duration.between(att.getCheckInTime(), now).getSeconds();
        double hours = Math.round((seconds / 3600.0) * 10.0) / 10.0;
        att.setWorkHours(hours);
        att.setExtraHours(Math.max(0.0, hours - 8.0));
        attendanceRepository.save(att);

        String timeStr = now.format(DateTimeFormatter.ofPattern("hh:mm a"));
        return ResponseEntity.ok(Map.of(
            "message", "Checked out successfully at " + timeStr + " (" + hours + " hrs recorded)",
            "checkOutTime", timeStr,
            "workHours", hours + "h"
        ));
    }
}
