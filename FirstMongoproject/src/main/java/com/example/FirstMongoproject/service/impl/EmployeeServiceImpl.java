package com.example.FirstMongoproject.service.impl;

import com.example.FirstMongoproject.model.Employee;
import com.example.FirstMongoproject.repository.EmployeeRepository;
import com.example.FirstMongoproject.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Employee createEmployeeProfile(Employee employee) {
        employee.setAppliedDate(LocalDateTime.now());
        employee.setUpdatedDate(LocalDateTime.now());
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployeeProfile(String id, Employee data) {
        Employee emp = getEmployeeById(id);

        emp.setName(data.getName());
        emp.setEmail(data.getEmail());
        emp.setPhone(data.getPhone());
        emp.setResume(data.getResume());
        emp.setSkills(data.getSkills());
        emp.setExperience(data.getExperience());
        emp.setEducation(data.getEducation());
        emp.setDesignation(data.getDesignation());
        emp.setBio(data.getBio());
        emp.setUpdatedDate(LocalDateTime.now());

        return employeeRepository.save(emp);
    }

    @Override
    public Employee getEmployeeById(String id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    @Override
    public Employee getEmployeeByUserId(String userId) {
        return employeeRepository.findByUserId(userId)
                .orElse(null);
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }
}