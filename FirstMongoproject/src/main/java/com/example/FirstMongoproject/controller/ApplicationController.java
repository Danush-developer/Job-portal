package com.example.FirstMongoproject.controller;

import com.example.FirstMongoproject.dto.ApiResponse;
import com.example.FirstMongoproject.model.JobApplication;
import com.example.FirstMongoproject.service.ApplicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/applications")
@CrossOrigin("*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @GetMapping("/download/{id}")
    public ResponseEntity<org.springframework.core.io.ByteArrayResource> downloadFile(@PathVariable String id) {
        JobApplication application = applicationService.getApplicationById(id);
        if (application != null && application.getResumeData() != null) {
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + application.getResumeFileName() + "\"")
                    .contentType(org.springframework.http.MediaType.parseMediaType(application.getResumeContentType()))
                    .body(new org.springframework.core.io.ByteArrayResource(application.getResumeData()));
        }
        return ResponseEntity.notFound().build();
    }


    @GetMapping({"", "/all"})
    public ResponseEntity<ApiResponse<List<JobApplication>>> getAllApplications() {
        return ResponseEntity.ok(ApiResponse.success("All applications fetched", applicationService.getAllApplications()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobApplication>> applyForJob(@Valid @RequestBody JobApplication application) {
        JobApplication savedApplication = applicationService.applyForJob(application);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Applied successfully", savedApplication));
    }

    @PostMapping("/apply-with-resume")
    public ResponseEntity<ApiResponse<JobApplication>> applyWithResume(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("application") String applicationJson) {
        try {
            JobApplication application = objectMapper.readValue(applicationJson, JobApplication.class);

            if (file != null && !file.isEmpty()) {
                application.setResumeData(file.getBytes());
                application.setResumeFileName(file.getOriginalFilename());
                application.setResumeContentType(file.getContentType());
            }

            JobApplication savedApplication = applicationService.applyForJob(application);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Applied successfully", savedApplication));
        } catch (Throwable e) {
            e.printStackTrace();
            String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("System Error: " + message));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<JobApplication>> updateStatus(
            @PathVariable String id, 
            @RequestParam(value = "status", required = false) String statusParam,
            @RequestBody(required = false) Map<String, String> body) {
        String status = statusParam;
        if (status == null && body != null) {
            status = body.get("status");
        }
        
        if (status == null) throw new RuntimeException("Status is required (as param or in body)");
        
        JobApplication updatedApplication = applicationService.updateApplicationStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updatedApplication));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<JobApplication>> rejectApplication(
            @PathVariable String id, 
            @RequestParam(value = "reason", required = false) String reasonParam,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = reasonParam;
        if (reason == null && body != null) {
            reason = body.get("reason");
        }

        if (reason == null) throw new RuntimeException("Reason is required (as param or in body)");

        JobApplication rejectedApplication = applicationService.rejectApplication(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Application rejected", rejectedApplication));
    }

    @PutMapping("/{id}/schedule-interview")
    public ResponseEntity<ApiResponse<JobApplication>> scheduleInterview(
            @PathVariable String id, 
            @RequestBody Map<String, String> request) {
        try {
            String dateStr = request.get("interviewDate"); 
            String link = request.get("meetingLink");
    
            JobApplication updatedApplication = applicationService.scheduleInterview(id, dateStr, link);
            return ResponseEntity.ok(ApiResponse.success("Interview scheduled successfully", updatedApplication));
        } catch (Exception e) {
            log.error("Schedule Interview failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Scheduling failed: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<JobApplication>>> getApplicationsByEmployee(@PathVariable String employeeId) {
        List<JobApplication> applications = applicationService.getApplicationsByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employee applications fetched", applications));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<JobApplication>>> getApplicationsByJob(@PathVariable String jobId) {
        List<JobApplication> applications = applicationService.getApplicationsByJob(jobId);
        return ResponseEntity.ok(ApiResponse.success("Job applications fetched", applications));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", applicationService.getDashboardStats()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable String id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Application deleted successfully", null));
    }


}