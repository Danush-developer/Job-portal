package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.Job;
import com.example.FirstMongoproject.model.JobApplication;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class AIService {

    @Value("${google.api.key:}")
    private String apiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> analyzeResume(String resumeText, Job job) {
        if (apiKey == null || apiKey.isEmpty()) {
            return getFallbackAnalysis();
        }

        try {
            String prompt = String.format(
                "You are an expert HR recruiter. Analyze the following resume text against the job requirements.\n\n" +
                "JOB TITLE: %s\n" +
                "JOB DESCRIPTION: %s\n" +
                "REQUIRED SKILLS: %s\n" +
                "EXPERIENCE LEVEL: %s\n\n" +
                "RESUME TEXT:\n%s\n\n" +
                "Provide a JSON response with the following keys:\n" +
                "1. matchScore (0-100)\n" +
                "2. summary (short summary of the candidate)\n" +
                "3. strengths (list of strings)\n" +
                "4. missingSkills (list of strings)\n\n" +
                "Return ONLY the JSON object.",
                job.getTitle(), job.getDescription(), job.getRequiredSkills(), job.getExperienceLevel(), resumeText
            );

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", Collections.singletonList(part));
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL + apiKey, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String aiResponseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                
                // Extract JSON from potential markdown blocks
                if (aiResponseText.contains("```json")) {
                    aiResponseText = aiResponseText.substring(aiResponseText.indexOf("```json") + 7, aiResponseText.lastIndexOf("```"));
                } else if (aiResponseText.contains("```")) {
                    aiResponseText = aiResponseText.substring(aiResponseText.indexOf("```") + 3, aiResponseText.lastIndexOf("```"));
                }

                return objectMapper.readValue(aiResponseText, Map.class);
            }
        } catch (Exception e) {
            System.err.println("AI Analysis failed: " + e.getMessage());
        }

        return getFallbackAnalysis();
    }

    private Map<String, Object> getFallbackAnalysis() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("matchScore", 0);
        fallback.put("summary", "AI screening is currently unavailable or API key is missing.");
        fallback.put("strengths", Collections.singletonList("N/A"));
        fallback.put("missingSkills", Collections.singletonList("N/A"));
        return fallback;
    }
}
