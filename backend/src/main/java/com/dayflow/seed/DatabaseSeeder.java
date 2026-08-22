package com.dayflow.seed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.dayflow.entity.Attendance;
import com.dayflow.entity.Certification;
import com.dayflow.entity.Company;
import com.dayflow.entity.Employee;
import com.dayflow.entity.LeaveBalance;
import com.dayflow.entity.SalaryComponent;
import com.dayflow.entity.SalaryStructure;
import com.dayflow.entity.Skill;
import com.dayflow.entity.TimeOffRequest;
import com.dayflow.entity.enums.AttendanceStatus;
import com.dayflow.entity.enums.ComputationType;
import com.dayflow.entity.enums.Role;
import com.dayflow.entity.enums.TimeOffStatus;
import com.dayflow.entity.enums.TimeOffType;
import com.dayflow.entity.enums.WageType;
import com.dayflow.repository.AttendanceRepository;
import com.dayflow.repository.CompanyRepository;
import com.dayflow.repository.EmployeeRepository;
import com.dayflow.repository.LeaveBalanceRepository;
import com.dayflow.repository.SalaryStructureRepository;
import com.dayflow.repository.TimeOffRequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final TimeOffRequestRepository timeOffRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() > 0) {
            log.info("Database already seeded with {} employees. Skipping seed execution.", employeeRepository.count());
            return;
        }

        log.info("Seeding initial database records for Dayflow HRMS...");

        // 1. Seed Company
        Company company = new Company();
        company.setName("Dayflow Technologies");
        company.setLogoUrl("https://dayflow.local/logo.png");
        company.setCountryCode("IN");
        company = companyRepository.save(company);

        // 2. Seed Admin Employee
        Employee admin = new Employee();
        admin.setLoginId("ADMIN001");
        admin.setFirstName("System");
        admin.setLastName("Administrator");
        admin.setEmail("admin@dayflow.com");
        admin.setPhone("+91 98765 43210");
        admin.setPasswordHash("$2a$10$7Q1Vn6eE3u/S.6zV0P4m.e7n8F9G0H1I2J3K4L5M6N7O8P9Q0R"); // example hash
        admin.setRole(Role.ADMIN);
        admin.setCompany(company);
        admin.setDepartment("Executive Management");
        admin.setJobTitle("HR Director / System Admin");
        admin.setDateOfJoining(LocalDate.of(2025, 1, 1));
        admin.setAddress("Headquarters Tech Park, Bangalore");
        admin.setGender("Other");
        admin.setMustChangePassword(false);
        admin = employeeRepository.save(admin);

        // 3. Seed Sample Employees
        Employee emp1 = createEmployee("IN-SJ-2026-0001", "Sarah", "Jenkins", "sarah.jenkins@dayflow.com", "+1 (555) 234-5678", "Engineering", "Senior Software Engineer", company, admin, LocalDate.of(2025, 3, 15));
        Employee emp2 = createEmployee("IN-AR-2026-0002", "Alex", "Rivera", "alex.rivera@dayflow.com", "+1 (555) 345-6789", "Product", "Lead Product Designer", company, admin, LocalDate.of(2025, 4, 10));
        Employee emp3 = createEmployee("IN-MB-2026-0003", "Michael", "Brown", "michael.brown@dayflow.com", "+1 (555) 456-7890", "Data & Analytics", "Senior Data Analyst", company, admin, LocalDate.of(2025, 5, 20));

        List<Employee> sampleEmployees = Arrays.asList(emp1, emp2, emp3);

        // 4. Seed Skills & Certifications for Employees
        seedSkillsAndCertifications(emp1, "Java", "Spring Boot", "React", "AWS Solutions Architect");
        seedSkillsAndCertifications(emp2, "UI/UX Design", "Figma", "Design Systems", "Certified UX Professional");
        seedSkillsAndCertifications(emp3, "Python", "SQL", "Tableau", "Google Data Engineer");

        // 5. Seed Attendance for past 7 days
        LocalDate today = LocalDate.now();
        for (Employee emp : sampleEmployees) {
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                if (date.getDayOfWeek().getValue() <= 5) { // Weekdays
                    Attendance att = new Attendance();
                    att.setEmployee(emp);
                    att.setDate(date);
                    att.setCheckInTime(date.atTime(9, 0));
                    att.setCheckOutTime(date.atTime(18, 0));
                    att.setWorkHours(8.0);
                    att.setExtraHours(1.0);
                    att.setStatus(AttendanceStatus.PRESENT);
                    attendanceRepository.save(att);
                }
            }
        }

        // 6. Seed TimeOffRequests
        TimeOffRequest req1 = new TimeOffRequest();
        req1.setEmployee(emp1);
        req1.setType(TimeOffType.PAID);
        req1.setStartDate(today.plusDays(3));
        req1.setEndDate(today.plusDays(5));
        req1.setAllocationDays(3.0);
        req1.setRemarks("Annual family vacation");
        req1.setStatus(TimeOffStatus.PENDING);
        timeOffRequestRepository.save(req1);

        TimeOffRequest req2 = new TimeOffRequest();
        req2.setEmployee(emp2);
        req2.setType(TimeOffType.SICK);
        req2.setStartDate(today.minusDays(10));
        req2.setEndDate(today.minusDays(9));
        req2.setAllocationDays(2.0);
        req2.setRemarks("Medical checkup and recovery");
        req2.setStatus(TimeOffStatus.APPROVED);
        req2.setReviewedBy(admin);
        req2.setReviewComments("Approved upon doctor note verification.");
        req2.setReviewedAt(LocalDateTime.now().minusDays(9));
        timeOffRequestRepository.save(req2);

        TimeOffRequest req3 = new TimeOffRequest();
        req3.setEmployee(emp3);
        req3.setType(TimeOffType.UNPAID);
        req3.setStartDate(today.minusDays(20));
        req3.setEndDate(today.minusDays(18));
        req3.setAllocationDays(3.0);
        req3.setRemarks("Personal business leave");
        req3.setStatus(TimeOffStatus.REJECTED);
        req3.setReviewedBy(admin);
        req3.setReviewComments("High project delivery load; please reschedule.");
        req3.setReviewedAt(LocalDateTime.now().minusDays(19));
        timeOffRequestRepository.save(req3);

        // 7. Seed SalaryStructures and LeaveBalances for all employees
        for (Employee emp : sampleEmployees) {
            // Leave Balance
            LeaveBalance lb = new LeaveBalance();
            lb.setEmployee(emp);
            lb.setPaidTimeOffAvailable(14.0);
            lb.setSickTimeOffAvailable(7.0);
            lb.setUnpaidTaken(0.0);
            leaveBalanceRepository.save(lb);

            // Salary Structure
            SalaryStructure ss = new SalaryStructure();
            ss.setEmployee(emp);
            ss.setWageType(WageType.MONTHLY);
            ss.setMonthlyWage(80000.0);
            ss.setYearlyWage(960000.0);
            ss.setWorkingDaysPerWeek(5);
            ss.setBreakTimeHrs(1.0);
            ss.setPfRatePercent(12.0);
            ss.setProfessionalTax(200.0);

            // Components
            SalaryComponent basic = new SalaryComponent();
            basic.setSalaryStructure(ss);
            basic.setName("Basic Pay");
            basic.setComputationType(ComputationType.PERCENTAGE);
            basic.setValue(50.0);
            basic.setPercentageOf("Monthly Wage");
            basic.setResolvedAmount(40000.0);

            SalaryComponent hra = new SalaryComponent();
            hra.setSalaryStructure(ss);
            hra.setName("House Rent Allowance (HRA)");
            hra.setComputationType(ComputationType.PERCENTAGE);
            hra.setValue(20.0);
            hra.setPercentageOf("Monthly Wage");
            hra.setResolvedAmount(16000.0);

            ss.setComponents(Arrays.asList(basic, hra));
            salaryStructureRepository.save(ss);
        }

        log.info("Database successfully seeded with Dayflow HRMS records!");
    }

    private Employee createEmployee(String loginId, String firstName, String lastName, String email, String phone, String department, String jobTitle, Company company, Employee manager, LocalDate joinDate) {
        Employee emp = new Employee();
        emp.setLoginId(loginId);
        emp.setFirstName(firstName);
        emp.setLastName(lastName);
        emp.setEmail(email);
        emp.setPhone(phone);
        emp.setPasswordHash("$2a$10$7Q1Vn6eE3u/S.6zV0P4m.e7n8F9G0H1I2J3K4L5M6N7O8P9Q0R");
        emp.setRole(Role.EMPLOYEE);
        emp.setCompany(company);
        emp.setDepartment(department);
        emp.setJobTitle(jobTitle);
        emp.setManager(manager);
        emp.setDateOfJoining(joinDate);
        emp.setDateOfBirth(LocalDate.of(1995, 6, 15));
        emp.setGender("Prefer not to say");
        emp.setMaritalStatus("Single");
        emp.setAddress("Tech Hub Apartments, Bangalore");
        emp.setMustChangePassword(true);
        return employeeRepository.save(emp);
    }

    private void seedSkillsAndCertifications(Employee emp, String s1, String s2, String s3, String certName) {
        Skill skill1 = new Skill(null, s1, emp);
        Skill skill2 = new Skill(null, s2, emp);
        Skill skill3 = new Skill(null, s3, emp);
        emp.setSkills(Arrays.asList(skill1, skill2, skill3));

        Certification cert = new Certification(null, certName, "Global Certification Authority", LocalDate.of(2024, 1, 10), "https://dayflow.local/cert.pdf", emp);
        emp.setCertifications(Arrays.asList(cert));

        employeeRepository.save(emp);
    }
}
