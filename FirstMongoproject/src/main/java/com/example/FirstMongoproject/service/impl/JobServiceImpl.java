package com.example.FirstMongoproject.service.impl;

import com.example.FirstMongoproject.model.Job;
import com.example.FirstMongoproject.repository.JobRepository;
import com.example.FirstMongoproject.service.EmailService;
import com.example.FirstMongoproject.service.JobService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public Job createJob(Job job) {
        job.setPostedDate(LocalDateTime.now());
        job.setUpdatedDate(LocalDateTime.now());
        
        // Instant check: if endDate is in the past, mark as inactive immediately
        if (job.getEndDate() != null && job.getEndDate().isBefore(LocalDateTime.now())) {
            job.setIsActive(false);
        } else {
            job.setIsActive(true);
        }
        
        job.setTotalApplications(0);
        Job saved = jobRepository.save(job);

        try {
            emailService.sendNewJobAlert(saved);
        } catch (Exception e) {
            log.error("Failed to send job alert: {}", e.getMessage());
        }

        return saved;
    }

    @Override
    public Job updateJob(String id, Job jobDetails) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setCompany(jobDetails.getCompany());
        job.setLocation(jobDetails.getLocation());
        job.setJobType(jobDetails.getJobType());
        job.setExperienceLevel(jobDetails.getExperienceLevel());
        job.setSalary(jobDetails.getSalary());
        job.setRequiredSkills(jobDetails.getRequiredSkills());
        job.setStartDate(jobDetails.getStartDate());
        job.setEndDate(jobDetails.getEndDate());
        job.setUpdatedDate(LocalDateTime.now());

        // Instant check on update
        if (job.getEndDate() != null && job.getEndDate().isBefore(LocalDateTime.now())) {
            job.setIsActive(false);
        } else if (jobDetails.getIsActive() != null) {
            job.setIsActive(jobDetails.getIsActive());
        }

        return jobRepository.save(job);
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 * * * * *")
    public void deactivateExpiredJobs() {
        LocalDateTime now = LocalDateTime.now();
        log.info("--- STARTING EXPIRY CHECK at {} ---", now);
        
        List<Job> allJobs = jobRepository.findAll();
        int deactivatedCount = 0;
        
        for (Job job : allJobs) {
            if (Boolean.TRUE.equals(job.getIsActive())) {
                if (job.getEndDate() != null) {
                    log.info("Checking Job: '{}' | EndDate: {} | Current Server Time: {}", 
                             job.getTitle(), job.getEndDate(), now);
                    
                    if (job.getEndDate().isBefore(now)) {
                        job.setIsActive(false);
                        jobRepository.save(job);
                        deactivatedCount++;
                        log.info(">>> SUCCESS: DEACTIVATED JOB: '{}' because it expired at {}", job.getTitle(), job.getEndDate());
                    }
                }
            }
        }
        log.info("--- EXPIRY CHECK FINISHED. Deactivated {} jobs ---", deactivatedCount);
    }

    @Override
    public void deleteJob(String id) {
        jobRepository.deleteById(id);
    }

    @Override
    public Job getJobById(String id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public List<Job> getJobsByAdmin(String adminId) {
        return jobRepository.findByPostedBy(adminId);
    }

    @Override
    public List<Job> searchJobsByTitle(String title) {
        return jobRepository.findByTitleIgnoreCaseContaining(title);
    }

    @Override
    public List<Job> searchJobsByLocation(String location) {
        return jobRepository.findByLocationIgnoreCase(location);
    }
}