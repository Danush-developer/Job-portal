package com.example.FirstMongoproject.service.impl;

import com.example.FirstMongoproject.model.*;
import com.example.FirstMongoproject.repository.EmailLogRepository;
import com.example.FirstMongoproject.repository.EmailTemplateRepository;
import com.example.FirstMongoproject.repository.EmployeeRepository;
import com.example.FirstMongoproject.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    @PostConstruct
    public void initTemplates() {
        createTemplateIfAbsent("APPLIED", "Application Submitted Successfully - {jobTitle}",
                "Hello {name},\n\nYou have successfully applied for the position of \"{jobTitle}\".\nWe have received your application and it is currently under review.\n{resumeInfo}\n\nBest Regards,\nJob Portal Team");

        createTemplateIfAbsent("SHORTLISTED", "Job Application Status Updated - {jobTitle}",
                "Hello {name},\n\nCongratulations! You have been shortlisted for the position of \"{jobTitle}\". Our team will contact you soon for the next steps.\n\nBest Regards,\nJob Portal Team");

        createTemplateIfAbsent("INTERVIEW", "Interview Scheduled: {jobTitle}",
                "Hello {name},\n\nWe are excited to invite you for an interview for the position of \"{jobTitle}\".\n\nDate & Time: {interviewTime}\nMeeting Link: {meetingLink}\n\nPlease be prepared and join on time.\n\nBest Regards,\nJob Portal Team");

        createTemplateIfAbsent("HIRED", "Job Application Status Updated - {jobTitle}",
                "Hello {name},\n\nWe are thrilled to inform you that you have been hired for the position of \"{jobTitle}\"! Welcome to the team.\n\nBest Regards,\nJob Portal Team");

        createTemplateIfAbsent("REJECTED", "Application Status: Rejected - {jobTitle}",
                "Hello {name},\n\nThank you for applying for the position of \"{jobTitle}\". After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nFeedback:\n{reason}\n\nWe wish you the best of luck in your job search.\n\nBest Regards,\nJob Portal Team");

        createTemplateIfAbsent("NEW_JOB", "New Job Opportunity: {jobTitle} at {company}",
                "Hello {name},\n\nA new job position has just been posted that might interest you!\n\nPosition: {jobTitle}\nCompany: {company}\nLocation: {location}\nSalary: {salary}\n\nCheck it out and apply today!\n\nBest Regards,\nJob Portal Team");
        
        createTemplateIfAbsent("FORGOT_PASSWORD", "Password Reset OTP",
                "Hello {name},\n\nYour 6-digit OTP for password reset is:\n\nOTP Code: {resetToken}\n\nThis OTP will expire in 1 hour.\n\nBest Regards,\nJob Portal Team");
    }

    private void createTemplateIfAbsent(String event, String subject, String body) {
        if (!emailTemplateRepository.findByEvent(event).isPresent()) {
            emailTemplateRepository.save(new EmailTemplate(null, event, subject, body));
        }
    }

    @Override
    public void sendApplicationConfirmation(JobApplication application) {
        sendTemplateEmail("APPLIED", application);
    }

    @Override
    public void sendStatusUpdateEmail(JobApplication application) {
        String event = application.getStatus().toUpperCase();
        sendTemplateEmail(event, application);
    }

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        EmailTemplate template = emailTemplateRepository.findByEvent("FORGOT_PASSWORD")
                .orElse(new EmailTemplate(null, "FORGOT_PASSWORD", "Reset Your Password", "Use OTP Code: {resetToken}"));

        String subject = template.getSubject();
        String content = template.getBody()
                .replace("{name}", user.getName() != null ? user.getName() : "User")
                .replace("{resetToken}", token);

        sendSimpleEmail(user.getEmail(), subject, content, null, "Password Reset");
    }

    @Override
    public void sendNewJobAlert(Job job) {
        List<Employee> employees = employeeRepository.findAll();
        for (Employee emp : employees) {
            EmailTemplate template = emailTemplateRepository.findByEvent("NEW_JOB")
                    .orElse(new EmailTemplate(null, "NEW_JOB", "New Job Posted: {jobTitle}", "A new job {jobTitle} is available."));

            String subject = replaceJobPlaceholders(template.getSubject(), job, emp);
            String content = replaceJobPlaceholders(template.getBody(), job, emp);

            sendSimpleEmail(emp.getEmail(), subject, content, null, job.getTitle());
        }
    }

    private void sendTemplateEmail(String event, JobApplication application) {
        EmailTemplate template = emailTemplateRepository.findByEvent(event)
                .orElse(new EmailTemplate(null, event, "Status Update - " + application.getJobTitle(), 
                        "Your application status for {jobTitle} has been updated to {status}."));

        String subject = replaceApplicationPlaceholders(template.getSubject(), application);
        String content = replaceApplicationPlaceholders(template.getBody(), application);

        sendSimpleEmail(application.getEmployeeEmail(), subject, content, application.getId(), application.getJobTitle());
    }

    private String replaceApplicationPlaceholders(String text, JobApplication application) {
        if (text == null) return "";
        String resumeInfo = (application.getResumeData() != null && application.getResumeData().length > 0) ? "We have successfully received your attached resume." : "No resume was attached to this application.";
        String interviewTime = application.getInterviewDate() != null ? 
                application.getInterviewDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "To be decided";
        
        return text.replace("{name}", application.getEmployeeName() != null ? application.getEmployeeName() : "User")
                   .replace("{jobTitle}", application.getJobTitle() != null ? application.getJobTitle() : "Position")
                   .replace("{status}", application.getStatus())
                   .replace("{resumeInfo}", resumeInfo)
                   .replace("{interviewTime}", interviewTime)
                   .replace("{meetingLink}", application.getMeetingLink() != null ? application.getMeetingLink() : "Not provided yet")
                   .replace("{reason}", application.getRejectionReason() != null ? application.getRejectionReason() : "No specific feedback provided.");
    }

    private String replaceJobPlaceholders(String text, Job job, Employee emp) {
        if (text == null) return "";
        return text.replace("{name}", emp.getName() != null ? emp.getName() : "User")
                   .replace("{jobTitle}", job.getTitle())
                   .replace("{company}", job.getCompany() != null ? job.getCompany() : "Confidential")
                   .replace("{location}", job.getLocation() != null ? job.getLocation() : "Remote")
                   .replace("{salary}", job.getSalary() != null ? job.getSalary() : "Negotiable");
    }

    private void sendSimpleEmail(String to, String subject, String content, String appId, String jobTitle) {
        EmailLog log = new EmailLog();
        log.setRecipientEmail(to);
        log.setSubject(subject);
        log.setContent(content);
        log.setApplicationId(appId);
        log.setJobTitle(jobTitle);
        log.setSentAt(LocalDateTime.now());

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.setStatus("SENT");
        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorMessage(e.getMessage());
        }
        emailLogRepository.save(log);
    }
}
