package com.cryptotrading.academy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AcademyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AcademyServiceApplication.class, args);
    }
}
