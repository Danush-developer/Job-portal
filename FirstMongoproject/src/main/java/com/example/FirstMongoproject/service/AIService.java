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
            return getFallbackAnalysis(resumeText, job);
        }

        try {
            String prompt = String.format(
                "INSTRUCTIONS: You are a binary scoring calculator. Perform a strict point-based analysis. No conversational filler.\n\n" +
                "JOB DATA:\n" +
                "Title: %s\n" +
                "Description: %s\n" +
                "Required Skills: %s\n" +
                "Experience Level: %s\n\n" +
                "RESUME DATA:\n" +
                "%s\n\n" +
                "SCORING RUBRIC (STRICT):\n" +
                "1. Technical Skills (50pts): Identify each required skill. Award points proportionally (matched/total * 50).\n" +
                "2. Experience (30pts): Award 30 if years/level matches or exceeds. Award (CandidateExp/RequiredExp * 30) if less.\n" +
                "3. Role Relevance (20pts): Award 20 if resume history matches the job title/domain.\n\n" +
                "JSON RESPONSE FORMAT:\n" +
                "{ \"matchScore\": integer, \"breakdown\": {\"skills\": int, \"experience\": int, \"relevance\": int}, \"summary\": \"string\", \"strengths\": [\"string\"], \"missingSkills\": [\"string\"], \"extractedSkills\": \"string\" }\n" +
                "Return ONLY the JSON.",
                job.getTitle(), job.getDescription(), job.getRequiredSkills(), job.getExperienceLevel(), resumeText
            );

            Map<String, Object> requestBody = new HashMap<>();
            
            // Generation Config for Determinism
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.0);
            generationConfig.put("topP", 1.0);
            generationConfig.put("maxOutputTokens", 2048);
            requestBody.put("generationConfig", generationConfig);

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

        return getFallbackAnalysis(resumeText, job);
    }

    private Map<String, Object> getFallbackAnalysis(String resumeText, Job job) {
        Map<String, Object> fallback = new HashMap<>();
        
        List<String> requiredSkills = new ArrayList<>();
        if (job != null && job.getRequiredSkills() != null && !job.getRequiredSkills().isEmpty()) {
            for (String s : job.getRequiredSkills().split(",")) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty()) {
                    requiredSkills.add(trimmed);
                }
            }
        }

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        
        String resumeLower = resumeText != null ? resumeText.toLowerCase() : "";
        
        for (String reqSkill : requiredSkills) {
            String reqSkillLower = reqSkill.toLowerCase();
            // Match substring or whole word (e.g. 'java' matches 'java', 'springboot' matches 'springboot')
            if (resumeLower.contains(reqSkillLower)) {
                matchedSkills.add(reqSkill);
            } else {
                missingSkills.add(reqSkill);
            }
        }

        // Add required skills list to the response so the frontend can show them
        fallback.put("requiredSkills", job.getRequiredSkills());

        int skillScore = 0;
        int totalScore = 0;
        if (!requiredSkills.isEmpty()) {
            skillScore = (int) Math.round(((double) matchedSkills.size() / requiredSkills.size()) * 50.0);
            // Default 15/30 for experience, 10/20 for relevance in fallback
            totalScore = skillScore + 15 + 10;
        } else {
            totalScore = 75; // high score if no skills required
            skillScore = 50;
        }

        fallback.put("matchScore", totalScore);
        
        Map<String, Integer> breakdown = new HashMap<>();
        breakdown.put("skills", skillScore);
        breakdown.put("experience", 15);
        breakdown.put("relevance", 10);
        fallback.put("breakdown", breakdown);

        fallback.put("extractedSkills", String.join(", ", matchedSkills));
        fallback.put("strengths", matchedSkills.isEmpty() ? Collections.singletonList("None identified") : matchedSkills);
        fallback.put("missingSkills", missingSkills.isEmpty() ? Collections.singletonList("None") : missingSkills);
        
        String summary = String.format("Local keyword analysis completed. Found %d of %d required skills in the resume. Matched: %s. Missing: %s.",
                matchedSkills.size(), requiredSkills.size(), String.join(", ", matchedSkills), String.join(", ", missingSkills));
        fallback.put("summary", summary);

        return fallback;
    }
}
