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

    private Optional<Employee> findEmployee(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Optional.empty();
        }
        String cleanId = identifier.trim();
        try {
            Long id = Long.valueOf(cleanId);
            Optional<Employee> emp = employeeRepository.findById(id);
            if (emp.isPresent()) return emp;
        } catch (NumberFormatException ignored) {}

        Optional<Employee> emp = employeeRepository.findByLoginId(cleanId);
        if (emp.isPresent()) return emp;

        return employeeRepository.findByEmail(cleanId);
    }

    @GetMapping("/status/{employeeId}")
    public ResponseEntity<?> getAttendanceStatus(@PathVariable String employeeId) {
        Optional<Employee> empOpt = findEmployee(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("isCheckedIn", true));
        }
        Long id = empOpt.get().getId();
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Attendance att = attendanceRepository.findByEmployeeIdAndDate(id, today).orElseGet(() -> {
            Attendance a = new Attendance();
            a.setEmployee(empOpt.get());
            a.setDate(today);
            return a;
        });

        if (att.getCheckInTime() == null || att.getCheckOutTime() != null) {
            att.setCheckInTime(now);
            att.setCheckOutTime(null);
            att.setStatus(AttendanceStatus.PRESENT);
            attendanceRepository.save(att);
        }

        String checkInStr = att.getCheckInTime().format(DateTimeFormatter.ofPattern("hh:mm a"));
        return ResponseEntity.ok(Map.of(
            "isCheckedIn", true,
            "checkInTime", checkInStr,
            "status", att.getStatus().name()
        ));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>> getEmployeeAttendanceLogs(
            @PathVariable String employeeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Optional<Employee> empOpt = findEmployee(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("logs", List.of(), "payableDaysInfo", Map.of("totalWorkingDays", 0, "presentDays", 0, "paidLeaveDays", 0, "payableDays", 0)));
        }

        Long id = empOpt.get().getId();
        LocalDate today = LocalDate.now();

        // Automatically ensure today's attendance record exists and user is checked in
        Optional<Attendance> todayAtt = attendanceRepository.findByEmployeeIdAndDate(id, today);
        if (todayAtt.isEmpty()) {
            Attendance a = new Attendance();
            a.setEmployee(empOpt.get());
            a.setDate(today);
            a.setCheckInTime(LocalDateTime.now());
            a.setStatus(AttendanceStatus.PRESENT);
            attendanceRepository.save(a);
        } else if (todayAtt.get().getCheckInTime() == null) {
            Attendance a = todayAtt.get();
            a.setCheckInTime(LocalDateTime.now());
            a.setStatus(AttendanceStatus.PRESENT);
            attendanceRepository.save(a);
        }

        List<Attendance> logs;
        if (startDate != null || endDate != null) {
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().withDayOfMonth(1);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            logs = attendanceRepository.findByEmployeeIdAndDateBetween(id, start, end);
        } else {
            logs = attendanceRepository.findByEmployeeIdOrderByDateDesc(id);
        }

        List<Map<String, Object>> logList = new ArrayList<>();

        for (Attendance a : logs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", String.valueOf(a.getId()));
            map.put("date", a.getDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
            map.put("checkIn", a.getCheckInTime() != null ? a.getCheckInTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "--:--");
            map.put("checkOut", a.getCheckOutTime() != null ? a.getCheckOutTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "--:--");
            map.put("workHours", a.getCheckOutTime() == null ? "Active" : (a.getWorkHours() != null ? a.getWorkHours() + "h" : "0h"));
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
                map.put("workHours", a.getCheckOutTime() == null && a.getCheckInTime() != null ? "Active" : (a.getWorkHours() != null ? a.getWorkHours() + "h" : "0h"));
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
        String empIdStr = body.get("employeeId") != null ? body.get("employeeId").toString() : "";
        Optional<Employee> empOpt = findEmployee(empIdStr);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        Employee emp = empOpt.get();
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Attendance att = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), today).orElseGet(() -> {
            Attendance a = new Attendance();
            a.setEmployee(emp);
            a.setDate(today);
            return a;
        });

        att.setCheckInTime(now);
        att.setCheckOutTime(null);
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
        String empIdStr = body.get("employeeId") != null ? body.get("employeeId").toString() : "";
        Optional<Employee> empOpt = findEmployee(empIdStr);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        Employee emp = empOpt.get();
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> attOpt = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), today);
        if (attOpt.isEmpty() || attOpt.get().getCheckInTime() == null) {
            // Auto check-in at start of day if missing check-in
            Attendance a = attOpt.orElseGet(() -> {
                Attendance newA = new Attendance();
                newA.setEmployee(emp);
                newA.setDate(today);
                return newA;
            });
            a.setCheckInTime(now.minusHours(8));
            a.setCheckOutTime(now);
            a.setWorkHours(8.0);
            a.setExtraHours(0.0);
            a.setStatus(AttendanceStatus.PRESENT);
            attendanceRepository.save(a);

            String timeStr = now.format(DateTimeFormatter.ofPattern("hh:mm a"));
            return ResponseEntity.ok(Map.of(
                "message", "Checked out successfully at " + timeStr + " (8.0 hrs recorded)",
                "checkOutTime", timeStr,
                "workHours", "8.0h"
            ));
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
