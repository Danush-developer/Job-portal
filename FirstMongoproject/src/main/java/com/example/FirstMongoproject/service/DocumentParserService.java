package com.example.FirstMongoproject.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
public class DocumentParserService {

    private final Tika tika = new Tika();

    public String parseToString(byte[] data) {
        try (InputStream stream = new ByteArrayInputStream(data)) {
            return tika.parseToString(stream);
        } catch (Exception e) {
            System.err.println("Failed to parse document: " + e.getMessage());
            return "";
        }
    }
}
