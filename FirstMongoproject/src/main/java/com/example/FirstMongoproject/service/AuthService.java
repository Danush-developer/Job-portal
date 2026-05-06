package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.User;
import java.util.Map;

public interface AuthService {
    User register(User user);
    Map<String, Object> login(String email, String password);
    User getUserById(String id);
    boolean validateToken(String token);
    String extractUserIdFromToken(String token);
    
    // Password Reset
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}