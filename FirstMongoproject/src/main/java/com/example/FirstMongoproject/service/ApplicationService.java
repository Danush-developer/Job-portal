package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.JobApplication;
import com.example.FirstMongoproject.dto.DashboardStats;

import java.util.List;
import java.util.Map;

public interface ApplicationService {

    JobApplication applyForJob(JobApplication application);

    JobApplication updateApplicationStatus(String applicationId, String status);

    JobApplication scheduleInterview(String applicationId, String date, String link);

    JobApplication rejectApplication(String applicationId, String rejectionReason);

    JobApplication getApplicationById(String id);

    List<JobApplication> getApplicationsByJob(String jobId);

    List<JobApplication> getApplicationsByEmployee(String employeeId);

    List<JobApplication> getApplicationsByStatus(String status);

    void deleteApplication(String id);
    
    List<JobApplication> getAllApplications();

    DashboardStats getDashboardStats();
}