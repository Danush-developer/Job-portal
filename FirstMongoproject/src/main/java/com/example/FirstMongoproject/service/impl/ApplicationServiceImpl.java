package com.example.FirstMongoproject.service.impl;

import com.example.FirstMongoproject.dto.DashboardStats;
import com.example.FirstMongoproject.model.Job;
import com.example.FirstMongoproject.model.JobApplication;
import com.example.FirstMongoproject.repository.ApplicationRepository;
import com.example.FirstMongoproject.repository.EmployeeRepository;
import com.example.FirstMongoproject.repository.JobRepository;
import com.example.FirstMongoproject.repository.UserRepository;
import com.example.FirstMongoproject.service.ApplicationService;
import com.example.FirstMongoproject.service.EmailService;
import com.example.FirstMongoproject.service.NotificationService;
import com.example.FirstMongoproject.service.AIService;
import com.example.FirstMongoproject.service.DocumentParserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AIService aiService;

    @Autowired
    private DocumentParserService documentParserService;

    @Override
    public JobApplication applyForJob(JobApplication application) {
        log.info("Applying for job: {} for employee: {}", application.getJobId(), application.getEmployeeId());
        
        if (application.getJobId() == null) throw new RuntimeException("Job ID is missing");
        if (application.getEmployeeId() == null) throw new RuntimeException("Employee ID is missing");

        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + application.getJobId()));

        applicationRepository.findByJobIdAndEmployeeId(application.getJobId(), application.getEmployeeId())
                .ifPresent(a -> { throw new RuntimeException("You have already applied for this position."); });

        application.setJobTitle(job.getTitle());
        
        if (application.getEmployeeName() == null || application.getEmployeeName().isEmpty()) {
            employeeRepository.findByUserId(application.getEmployeeId()).ifPresent(e -> {
                application.setEmployeeName(e.getName());
                application.setEmployeeEmail(e.getEmail());
            });
            if (application.getEmployeeName() == null) {
                employeeRepository.findById(application.getEmployeeId()).ifPresent(e -> {
                    application.setEmployeeName(e.getName());
                    application.setEmployeeEmail(e.getEmail());
                });
            }
            if (application.getEmployeeName() == null) {
                userRepository.findById(application.getEmployeeId()).ifPresent(u -> {
                    application.setEmployeeName(u.getName());
                    application.setEmployeeEmail(u.getEmail());
                });
            }
        }

        application.setStatus("PENDING");
        application.setAppliedDate(LocalDateTime.now());
        application.setUpdatedDate(LocalDateTime.now());

        JobApplication saved = applicationRepository.save(application);

        jobRepository.findById(application.getJobId()).ifPresent(j -> {
            int count = j.getTotalApplications() == null ? 0 : j.getTotalApplications();
            j.setTotalApplications(count + 1);
            jobRepository.save(j);
        });

        try {
            emailService.sendApplicationConfirmation(saved);
        } catch (Exception e) {
            log.error("Error sending application confirmation email: {}", e.getMessage());
        }

        return saved;
    }

    @Override
    public JobApplication updateApplicationStatus(String applicationId, String status) {
        JobApplication app = getApplicationById(applicationId);
        app.setStatus(status);
        app.setUpdatedDate(LocalDateTime.now());
        JobApplication updated = applicationRepository.save(app);

        try {
            emailService.sendStatusUpdateEmail(updated);
            notificationService.sendNotification(updated.getEmployeeId(), 
                "Your application for " + updated.getJobTitle() + " has been updated to: " + status);
        } catch (Exception e) {
            log.error("Error sending status update notification: {}", e.getMessage());
        }

        return updated;
    }

    @Override
    public JobApplication scheduleInterview(String applicationId, String date, String link) {
        JobApplication app = getApplicationById(applicationId);
        
        if (date != null && !date.isEmpty()) {
            try {
                String normalizedDate = date.replace(" ", "T");
                if (normalizedDate.endsWith("Z")) {
                    normalizedDate = normalizedDate.substring(0, normalizedDate.length() - 1);
                }
                if (normalizedDate.contains(".")) {
                    normalizedDate = normalizedDate.substring(0, normalizedDate.indexOf("."));
                }
                
                // Handle DD-MM-YYYY format (e.g. 08-05-2026)
                if (normalizedDate.length() >= 10 && normalizedDate.charAt(2) == '-' && normalizedDate.charAt(5) == '-') {
                    String[] parts = normalizedDate.split("T");
                    String datePart = parts[0];
                    String timePart = parts.length > 1 ? parts[1] : "00:00:00";
                    
                    String[] d = datePart.split("-");
                    normalizedDate = d[2] + "-" + d[1] + "-" + d[0] + "T" + timePart;
                }

                if (normalizedDate.length() == 16) {
                    normalizedDate += ":00";
                }
                app.setInterviewDate(LocalDateTime.parse(normalizedDate));
            } catch (Exception e) {
                log.warn("Failed to parse interview date: {} - Using fallback. Error: {}", date, e.getMessage());
                app.setInterviewDate(LocalDateTime.now().plusDays(1));
            }
        }
        
        if (link != null) {
            String cleanLink = link;
            if (link.contains("https://")) {
                int start = link.indexOf("https://");
                int end = link.indexOf(" ", start);
                if (end == -1) end = link.indexOf("\n", start);
                if (end == -1) end = link.length();
                cleanLink = link.substring(start, end).trim();
            }
            app.setMeetingLink(cleanLink);
        }
        app.setStatus("INTERVIEW");
        app.setUpdatedDate(LocalDateTime.now());
        JobApplication saved = applicationRepository.save(app);

        try {
            emailService.sendStatusUpdateEmail(saved);
            notificationService.sendNotification(saved.getEmployeeId(), 
                "Interview scheduled for " + saved.getJobTitle() + " on " + date);
        } catch (Exception e) {
            log.error("Error sending interview notification: {}", e.getMessage());
        }

        return saved;
    }

    @Override
    public JobApplication rejectApplication(String applicationId, String rejectionReason) {
        JobApplication app = getApplicationById(applicationId);
        app.setStatus("REJECTED");
        app.setRejectionReason(rejectionReason);
        app.setUpdatedDate(LocalDateTime.now());
        JobApplication rejected = applicationRepository.save(app);

        try {
            emailService.sendStatusUpdateEmail(rejected);
            notificationService.sendNotification(rejected.getEmployeeId(), 
                "Your application for " + rejected.getJobTitle() + " was unfortunately rejected.");
        } catch (Exception e) {
            log.error("Error sending rejection notification: {}", e.getMessage());
        }

        return rejected;
    }

    @Override
    public JobApplication getApplicationById(String id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    @Override
    public List<JobApplication> getApplicationsByJob(String jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    @Override
    public List<JobApplication> getApplicationsByEmployee(String employeeId) {
        return applicationRepository.findByEmployeeId(employeeId);
    }

    @Override
    public List<JobApplication> getApplicationsByStatus(String status) {
        return applicationRepository.findByStatus(status);
    }

    @Override
    public List<JobApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Override
    public void deleteApplication(String id) {
        applicationRepository.findById(id).ifPresent(app -> {
            String jobId = app.getJobId();
            applicationRepository.deleteById(id);
            
            if (jobId != null) {
                jobRepository.findById(jobId).ifPresent(job -> {
                    int count = job.getTotalApplications() == null ? 0 : job.getTotalApplications();
                    if (count > 0) {
                        job.setTotalApplications(count - 1);
                        jobRepository.save(job);
                    }
                });
            }
        });
    }

    @Override
    public JobApplication screenApplication(String applicationId) {
        log.info("Starting AI screening for application: {}", applicationId);
        JobApplication app = getApplicationById(applicationId);
        
        if (app.getResumeData() == null || app.getResumeData().length == 0) {
            throw new RuntimeException("No resume data found for this application");
        }

        Job job = jobRepository.findById(app.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found for application: " + applicationId));

        try {
            // 1. Parse Resume
            String resumeText = documentParserService.parseToString(app.getResumeData());
            
            // 2. AI Analysis
            Map<String, Object> insights = aiService.analyzeResume(resumeText, job);
            
            // 3. Update Application
            app.setAiMatchScore((Integer) insights.getOrDefault("matchScore", 0));
            app.setAiSummary((String) insights.getOrDefault("summary", ""));
            app.setAiStrengths((List<String>) insights.getOrDefault("strengths", null));
            app.setAiMissingSkills((List<String>) insights.getOrDefault("missingSkills", null));
            app.setIsScreened(true);
            app.setUpdatedDate(LocalDateTime.now());

            return applicationRepository.save(app);
        } catch (Exception e) {
            log.error("AI Screening failed: {}", e.getMessage());
            throw new RuntimeException("AI Screening failed: " + e.getMessage());
        }
    }

    @Override
    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        stats.setTotalJobs(jobRepository.count());
        
        List<JobApplication> allApps = applicationRepository.findAll();
        stats.setTotalApplications((long) allApps.size());
        stats.setTotalEmployees(employeeRepository.count());

        Map<String, Long> counts = allApps.stream()
                .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));
        stats.setStatusCounts(counts);

        return stats;
    }
}