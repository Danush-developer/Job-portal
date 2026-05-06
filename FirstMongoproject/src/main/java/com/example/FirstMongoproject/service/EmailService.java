package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.Job;
import com.example.FirstMongoproject.model.JobApplication;
import com.example.FirstMongoproject.model.User;

public interface EmailService {
    void sendApplicationConfirmation(JobApplication application);
    void sendStatusUpdateEmail(JobApplication application);
    void sendNewJobAlert(Job job);
    void sendPasswordResetEmail(User user, String token);
}
