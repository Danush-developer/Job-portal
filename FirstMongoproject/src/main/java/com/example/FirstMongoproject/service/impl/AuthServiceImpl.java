package com.example.FirstMongoproject.service.impl;

import com.example.FirstMongoproject.model.User;
import com.example.FirstMongoproject.repository.UserRepository;
import com.example.FirstMongoproject.service.AuthService;
import com.example.FirstMongoproject.service.EmailService;
import com.example.FirstMongoproject.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Override
    public User register(User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            throw new RuntimeException("Email and Password are required");
        }
        user.setEmail(user.getEmail().toLowerCase().trim());
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    @Override
    public Map<String, Object> login(String rawEmail, String rawPassword) {
        log.info("Login attempt for email: {}", rawEmail);
        String email = (rawEmail != null) ? rawEmail.toLowerCase().trim() : "";
        String password = (rawPassword != null) ? rawPassword.trim() : "";

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        String name = user.getName();
        if (name == null || name.isEmpty() || name.equals("User")) {
            name = user.getEmail().split("@")[0];
            name = name.substring(0, 1).toUpperCase() + name.substring(1);
        }
        
        response.put("name", name);
        response.put("email", user.getEmail());

        return response;
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        String token = String.format("%06d", new Random().nextInt(999999));
        
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user, token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    @Override
    public String extractUserIdFromToken(String token) {
        return jwtUtil.extractUserId(token);
    }
}