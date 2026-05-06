package com.example.FirstMongoproject.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "employees")
public class Employee {

    @Id
    private String id;

    private String userId;
    private String name;
    private String email;
    private String phone;
    private String resume;
    private String skills;
    private String experience;
    private String education;
    private String designation;
    private String bio;

    private LocalDateTime appliedDate = LocalDateTime.now();
    private LocalDateTime updatedDate = LocalDateTime.now();
}