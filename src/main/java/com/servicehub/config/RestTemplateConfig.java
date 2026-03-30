package com.servicehub.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    // Register RestTemplate as a Spring bean
    // so it can be injected into CashfreePaymentService
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
