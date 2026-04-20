package com.smartcampus.smart_campus_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

<<<<<<< HEAD
@SpringBootApplication(scanBasePackages = "com.smartcampus")
=======
// Explicitly scan the full com.smartcampus package tree so that
// components in sibling packages (auth, user, booking, etc.) are detected.
@SpringBootApplication(scanBasePackages = "com.smartcampus")
@EntityScan(basePackages = "com.smartcampus")
@EnableJpaRepositories(basePackages = "com.smartcampus")
>>>>>>> 2aab52e4f19fa0d781e6f8c591282b5aac5f0f6f
public class SmartCampusApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusApiApplication.class, args);
	}

}

