package com.dayflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dayflow.entity.TimeOffRequest;
import com.dayflow.entity.enums.TimeOffStatus;

@Repository
public interface TimeOffRequestRepository extends JpaRepository<TimeOffRequest, Long> {
    List<TimeOffRequest> findByEmployeeId(Long employeeId);
    List<TimeOffRequest> findByStatus(TimeOffStatus status);
    List<TimeOffRequest> findByEmployeeCompanyIdAndStatus(Long companyId, TimeOffStatus status);
}
