package com.appointment.controller;

import com.appointment.dto.ApiResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;
    
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getStripeConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("publishableKey", stripePublishableKey);
        return ResponseEntity.ok(ApiResponse.success(config));
    }
    
    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            Long amount = Long.valueOf(request.get("amount").toString());
            
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount * 100) // Stripe expects amount in cents
                    .setCurrency("usd")
                    .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (StripeException e) {
            logger.error("Stripe error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create payment intent: " + e.getMessage()));
        }
    }
    
    @PostMapping("/confirm-payment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmPayment(@RequestBody Map<String, Object> request) {
        try {
            String paymentIntentId = (String) request.get("paymentIntentId");
            
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId, new java.util.HashMap<>(), null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", paymentIntent.getId());
            response.put("status", paymentIntent.getStatus());
            response.put("message", mapPaymentStatusToMessage(paymentIntent.getStatus()));
            response.put("amount", paymentIntent.getAmount() / 100.0);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (StripeException e) {
            logger.error("Stripe error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment confirmation failed: " + e.getMessage()));
        }
    }
    
    private String mapPaymentStatusToMessage(String status) {
        return switch (status) {
            case "succeeded" -> "Payment processed successfully";
            case "processing" -> "Payment is processing";
            case "requires_payment_method" -> "Payment failed, please try another payment method";
            case "requires_confirmation" -> "Payment requires confirmation";
            case "requires_action" -> "Payment requires additional action";
            default -> "Payment status: " + status;
        };
    }
}
