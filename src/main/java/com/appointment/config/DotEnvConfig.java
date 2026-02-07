package com.appointment.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to load environment variables from .env file
 */
@Configuration
@Slf4j
public class DotEnvConfig {

    @PostConstruct
    public void loadDotEnv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            // Load Stripe keys - these should be real keys, not placeholders
            String secretKey = dotenv.get("STRIPE_SECRET_KEY");
            if (secretKey != null && !secretKey.isEmpty()) {
                System.setProperty("stripe.secret-key", secretKey);
                System.setProperty("STRIPE_SECRET_KEY", secretKey);
                log.info("Stripe secret key loaded from .env file");
            } else {
                log.warn("Stripe secret key not found in .env file");
            }

            String publishableKey = dotenv.get("STRIPE_PUBLISHABLE_KEY");
            if (publishableKey != null && !publishableKey.isEmpty()) {
                System.setProperty("stripe.publishable-key", publishableKey);
                log.info("Stripe publishable key loaded from .env file");
            } else {
                log.warn("Stripe publishable key not found in .env file");
            }

            String webhookSecret = dotenv.get("STRIPE_WEBHOOK_SECRET");
            if (webhookSecret != null && !webhookSecret.isEmpty()) {
                System.setProperty("stripe.webhook-secret", webhookSecret);
                log.info("Stripe webhook secret loaded from .env file");
            } else {
                log.warn("Stripe webhook secret not found in .env file");
            }

            // Load JWT configuration
            String jwtSecret = dotenv.get("JWT_SECRET");
            if (jwtSecret != null && !jwtSecret.isEmpty()) {
                System.setProperty("jwt.secret", jwtSecret);
                log.info("JWT secret loaded from .env file");
            }

            String jwtExpiration = dotenv.get("JWT_EXPIRATION");
            if (jwtExpiration != null && !jwtExpiration.isEmpty()) {
                System.setProperty("jwt.expiration", jwtExpiration);
                log.info("JWT expiration loaded from .env file");
            }

            log.info(".env configuration loaded successfully");
        } catch (Exception e) {
            log.warn("Failed to load .env file: {}. Using default configuration or environment variables.", e.getMessage());
        }
    }
}
