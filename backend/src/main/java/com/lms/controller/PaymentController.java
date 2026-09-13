package com.lms.controller;

import com.lms.dto.OrderRequest;
import com.lms.dto.PaymentVerificationRequest;
import com.lms.entity.Order;
import com.lms.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Order order = paymentService.createOrder(request.getCourseId(), email);
            
            // Return order details for React Razorpay integration
            Map<String, Object> response = new HashMap<>();
            response.put("id", order.getId());
            response.put("razorpayOrderId", order.getRazorpayOrderId());
            response.put("amount", order.getAmount());
            response.put("status", order.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            boolean isVerified = paymentService.verifyPayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("verified", isVerified);

            if (isVerified) {
                response.put("message", "Payment verified and enrollment completed successfully.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Payment verification failed. Invalid signature.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
