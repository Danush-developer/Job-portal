package com.example.FirstMongoproject.repository;

import com.example.FirstMongoproject.model.JobApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ApplicationRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public JobApplication save(JobApplication application) {
        return mongoTemplate.save(application);
    }

    public Optional<JobApplication> findById(String id) {
        return Optional.ofNullable(mongoTemplate.findById(id, JobApplication.class));
    }

    public List<JobApplication> findAll() {
        return mongoTemplate.findAll(JobApplication.class);
    }

    public void deleteById(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        mongoTemplate.remove(query, JobApplication.class);
    }

    public Optional<JobApplication> findByJobIdAndEmployeeId(String jobId, String employeeId) {
        Query query = new Query(Criteria.where("jobId").is(jobId).and("employeeId").is(employeeId));
        return Optional.ofNullable(mongoTemplate.findOne(query, JobApplication.class));
    }

    public List<JobApplication> findByJobId(String jobId) {
        Query query = new Query(Criteria.where("jobId").is(jobId));
        return mongoTemplate.find(query, JobApplication.class);
    }

    public List<JobApplication> findByEmployeeId(String employeeId) {
        Query query = new Query(Criteria.where("employeeId").is(employeeId));
        return mongoTemplate.find(query, JobApplication.class);
    }

    public List<JobApplication> findByStatus(String status) {
        Query query = new Query(Criteria.where("status").is(status));
        return mongoTemplate.find(query, JobApplication.class);
    }
}