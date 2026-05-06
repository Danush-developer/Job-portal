package com.example.FirstMongoproject.repository;

import com.example.FirstMongoproject.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<JobApplication, String> {

    Optional<JobApplication> findByJobIdAndEmployeeId(String jobId, String employeeId);

    List<JobApplication> findByJobId(String jobId);

    List<JobApplication> findByEmployeeId(String employeeId);

    List<JobApplication> findByStatus(String status);
}