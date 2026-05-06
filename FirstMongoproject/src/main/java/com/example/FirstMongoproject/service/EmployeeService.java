package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.Employee;

import java.util.List;

public interface EmployeeService {

    Employee createEmployeeProfile(Employee employee);

    Employee updateEmployeeProfile(String id, Employee employee);

    Employee getEmployeeById(String id);

    Employee getEmployeeByUserId(String userId);

    List<Employee> getAllEmployees();

    void deleteEmployee(String id);
}