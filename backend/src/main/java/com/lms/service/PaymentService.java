package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.Order;
import com.lms.entity.Payment;
import com.lms.entity.User;
import com.lms.repository.*;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    public PaymentService(OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          CourseRepository courseRepository,
                          UserRepository userRepository,
                          EnrollmentRepository enrollmentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public Order createOrder(Long courseId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Check if student is already enrolled
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new IllegalArgumentException("Already enrolled in this course");
        }

        // Calculate amount: Price in Rupees -> Paise (multiply by 100)
        BigDecimal amountInRupees = course.getPrice();
        int amountInPaise = amountInRupees.multiply(new BigDecimal(100)).intValue();

        try {
            // Initialize Razorpay Client
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // Persist Order in database
            Order order = new Order();
            order.setRazorpayOrderId(razorpayOrderId);
            order.setStudent(student);
            order.setCourse(course);
            order.setAmount(amountInRupees);
            order.setStatus("CREATED");

            return orderRepository.save(order);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Razorpay order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Order record not found"));

        // Generate expected signature using HMAC-SHA256
        String signatureData = razorpayOrderId + "|" + razorpayPaymentId;
        boolean isSignatureValid = verifyHmacSha256(signatureData, razorpayKeySecret, razorpaySignature);

        if (isSignatureValid) {
            // Update Order Status
            order.setStatus("PAID");
            orderRepository.save(order);

            // Record Payment
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);

            // Enroll Student
            User student = order.getStudent();
            Course course = order.getCourse();

            if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
                Enrollment enrollment = new Enrollment();
                enrollment.setStudent(student);
                enrollment.setCourse(course);
                enrollmentRepository.save(enrollment);

                // Add course skills/tags to student profile skills
                updateStudentSkills(student, course.getSkillsTags());
            }

            return true;
        } else {
            order.setStatus("FAILED");
            orderRepository.save(order);
            return false;
        }
    }

    private void updateStudentSkills(User student, String newSkills) {
        if (newSkills == null || newSkills.trim().isEmpty()) {
            return;
        }
        String currentSkills = student.getSkills();
        if (currentSkills == null || currentSkills.trim().isEmpty()) {
            student.setSkills(newSkills);
        } else {
            // Deduplicate and append
            String[] tokens = newSkills.split(",");
            StringBuilder updated = new StringBuilder(currentSkills);
            for (String t : tokens) {
                String clean = t.trim();
                if (!currentSkills.toLowerCase().contains(clean.toLowerCase())) {
                    updated.append(", ").append(clean);
                }
            }
            student.setSkills(updated.toString());
        }
        userRepository.save(student);
    }

    private boolean verifyHmacSha256(String data, String secret, String expectedSignature) {
        try {
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] rawHmac = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : rawHmac) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(expectedSignature);
        } catch (Exception e) {
            return false;
        }
    }
}
