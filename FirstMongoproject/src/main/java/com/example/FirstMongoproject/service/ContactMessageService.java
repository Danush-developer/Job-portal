package com.example.FirstMongoproject.service;

import com.example.FirstMongoproject.model.ContactMessage;
import com.example.FirstMongoproject.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    public ContactMessage saveMessage(ContactMessage message) {
        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAll();
    }

    public void deleteMessage(String id) {
        contactMessageRepository.deleteById(id);
    }

    public ContactMessage updateStatus(String id, String status) {
        ContactMessage message = contactMessageRepository.findById(id).orElseThrow(() -> new RuntimeException("Message not found"));
        message.setStatus(status);
        return contactMessageRepository.save(message);
    }
}
