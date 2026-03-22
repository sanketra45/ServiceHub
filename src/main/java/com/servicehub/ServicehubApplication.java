package com.servicehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ServicehubApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServicehubApplication.class, args);
	}

}
