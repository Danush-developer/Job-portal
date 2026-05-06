package com.example.FirstMongoproject.repository;

import com.example.FirstMongoproject.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByIsActiveTrue();
    List<Job> findByPostedBy(String adminId);
    List<Job> findByLocationIgnoreCase(String location);
    List<Job> findByJobTypeIgnoreCase(String jobType);
    List<Job> findByTitleIgnoreCaseContaining(String title);
}