package com.dayflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dayflow.entity.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
}
