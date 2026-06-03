package com.example.FirstMongoproject.repository;

import com.example.FirstMongoproject.model.Job;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JobRepository {

    @Autowired
    private MongoTemplate mongoTemplate;
    
    public long count() {
        return mongoTemplate.count(
                new Query(),
                Job.class
        );
    }


    public Job save(Job job) {
        return mongoTemplate.save(job);
    }

    public Optional<Job> findById(String id) {
        return Optional.ofNullable(
                mongoTemplate.findById(id, Job.class)
        );
    }

    public List<Job> findAll() {
        return mongoTemplate.findAll(Job.class);
    }

    public void deleteById(String id) {
        Query query = new Query(
                Criteria.where("id").is(id)
        );

        mongoTemplate.remove(query, Job.class);
    }

    public List<Job> findByIsActiveTrue() {
        Query query = new Query(
                Criteria.where("isActive").is(true)
        );

        return mongoTemplate.find(query, Job.class);
    }

    public List<Job> findByPostedBy(String adminId) {
        Query query = new Query(
                Criteria.where("postedBy").is(adminId)
        );

        return mongoTemplate.find(query, Job.class);
    }

    public List<Job> findByLocationIgnoreCase(String location) {
        Query query = new Query(
                Criteria.where("location").regex("^" + location + "$", "i")
        );

        return mongoTemplate.find(query, Job.class);
    }

    public List<Job> findByJobTypeIgnoreCase(String jobType) {
        Query query = new Query(
                Criteria.where("jobType").regex("^" + jobType + "$", "i")
        );

        return mongoTemplate.find(query, Job.class);
    }

    public List<Job> findByTitleIgnoreCaseContaining(String title) {
        Query query = new Query(
                Criteria.where("title").regex(title, "i")
        );

        return mongoTemplate.find(query, Job.class);
    }
}