package com.example.FirstMongoproject.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
public class HealthCheckController {

    @GetMapping({"/", "/health", "/api/health"})
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        status.put("message", "StepForwardx Backend is running smoothly");
        return status;
    }
}
