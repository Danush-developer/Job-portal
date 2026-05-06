package com.example.FirstMongoproject.repository;

import com.example.FirstMongoproject.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EmployeeRepository extends MongoRepository<Employee, String> {

    Optional<Employee> findByUserId(String userId);
}