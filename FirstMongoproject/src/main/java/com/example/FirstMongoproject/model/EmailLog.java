package com.example.FirstMongoproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "email_logs")
public class EmailLog {

    @Id
    private String id;

    private String recipientEmail;
    private String subject;
    private String content;
    private String status; // SENT, FAILED
    private String errorMessage;
    private LocalDateTime sentAt = LocalDateTime.now();
    
    private String applicationId;
    private String jobTitle;
}
