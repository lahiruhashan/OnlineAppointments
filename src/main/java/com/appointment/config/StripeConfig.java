package com.appointment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class StripeConfig {
    
    @PostConstruct
    public void init() {
        // Try to get from system property first (set by DotEnvConfig or environment variable)
        String apiKey = System.getProperty("STRIPE_SECRET_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getenv("STRIPE_SECRET_KEY");
        }
        
        if (apiKey != null && !apiKey.isEmpty() && !apiKey.startsWith("sk_test_your")) {
            Stripe.apiKey = apiKey;
            log.info("Stripe API key configured successfully");
        } else {
            log.warn("Stripe API key not configured or is placeholder. Payment functionality may not work.");
        }
    }
}
