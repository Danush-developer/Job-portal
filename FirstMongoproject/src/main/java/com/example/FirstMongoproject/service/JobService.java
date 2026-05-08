package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.Job;
import java.util.List;

public interface JobService {
    Job createJob(Job job);
    Job updateJob(String id, Job job);
    void deleteJob(String id);
    Job getJobById(String id);
    List<Job> getAllJobs();
    List<Job> getJobsByAdmin(String adminId);
    List<Job> searchJobsByTitle(String title);
    List<Job> searchJobsByLocation(String location);
}