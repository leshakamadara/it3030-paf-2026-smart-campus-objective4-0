package com.smartcampus.smart_campus_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Explicitly scan the full com.smartcampus package tree so that
// components in sibling packages (auth, user, booking, etc.) are detected.
@SpringBootApplication(scanBasePackages = "com.smartcampus")
public class SmartCampusApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusApiApplication.class, args);
	}

}

