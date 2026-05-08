package com.example.FirstMongoproject.controller;

import com.example.FirstMongoproject.dto.ApiResponse;
import com.example.FirstMongoproject.model.Job;
import com.example.FirstMongoproject.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<ApiResponse<Job>> createJob(@RequestBody Job job) {
        Job createdJob = jobService.createJob(job);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job created successfully", createdJob));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> updateJob(@PathVariable String id, @RequestBody Job jobDetails) {
        Job updatedJob = jobService.updateJob(id, jobDetails);
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", updatedJob));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> getJob(@PathVariable String id) {
        Job job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success("Job fetched successfully", job));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Job>>> getAllJobs() {
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(ApiResponse.success("All jobs fetched", jobs));
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<ApiResponse<List<Job>>> getJobsByAdmin(@PathVariable String adminId) {
        List<Job> jobs = jobService.getJobsByAdmin(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin jobs fetched", jobs));
    }

    @GetMapping("/search/title")
    public ResponseEntity<ApiResponse<List<Job>>> searchByTitle(@RequestParam String title) {
        List<Job> jobs = jobService.searchJobsByTitle(title);
        return ResponseEntity.ok(ApiResponse.success("Search results for title", jobs));
    }

    @GetMapping("/search/location")
    public ResponseEntity<ApiResponse<List<Job>>> searchByLocation(@RequestParam String location) {
        List<Job> jobs = jobService.searchJobsByLocation(location);
        return ResponseEntity.ok(ApiResponse.success("Search results for location", jobs));
    }
}