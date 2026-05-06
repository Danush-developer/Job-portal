package com.example.FirstMongoproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "email_templates")
public class EmailTemplate {

    @Id
    private String id;
    
    private String event; // e.g., APPLIED, SHORTLISTED, HIRED, REJECTED
    private String subject;
    private String body; // Can contain placeholders like {name}, {jobTitle}, {reason}
}
