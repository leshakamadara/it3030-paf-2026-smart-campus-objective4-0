package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

// Explicitly scan the full com.smartcampus package tree so that
// components in sibling packages (auth, user, booking, etc.) are detected.
@SpringBootApplication(scanBasePackages = "com.smartcampus")
@EntityScan(basePackages = "com.smartcampus")
@EnableJpaRepositories(basePackages = "com.smartcampus")
public class SmartCampusApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusApiApplication.class, args);
	}

}

