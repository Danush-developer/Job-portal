package com.example.FirstMongoproject.controller;

import com.example.FirstMongoproject.dto.ApiResponse;
import com.example.FirstMongoproject.model.Employee;
import com.example.FirstMongoproject.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> createProfile(@RequestBody Employee employee) {
        Employee createdEmployee = employeeService.createEmployeeProfile(employee);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile created successfully", createdEmployee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateProfile(@PathVariable String id, @RequestBody Employee employeeDetails) {
        Employee updatedEmployee = employeeService.updateEmployeeProfile(id, employeeDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedEmployee));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployee(@PathVariable String id) {
        Employee employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success("Employee profile fetched", employee));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeByUserId(@PathVariable String userId) {
        Employee employee = employeeService.getEmployeeByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("User profile fetched", employee));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(ApiResponse.success("All employees fetched", employees));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }
}