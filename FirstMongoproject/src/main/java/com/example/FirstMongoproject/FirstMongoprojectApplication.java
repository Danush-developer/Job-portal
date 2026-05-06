package com.example.FirstMongoproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FirstMongoprojectApplication {

	public static void main(String[] args) {
		SpringApplication.run(FirstMongoprojectApplication.class, args);
	}

}
