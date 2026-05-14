package com.example.FirstMongoproject.controller;

import com.example.FirstMongoproject.model.ContactMessage;
import com.example.FirstMongoproject.service.ContactMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<?> submitContact(@RequestBody ContactMessage message) {
        ContactMessage saved = contactMessageService.saveMessage(message);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Message sent successfully!");
        response.put("data", saved);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable String id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(contactMessageService.updateStatus(id, status));
    }
}
