package com.lms.controller;

import com.lms.entity.Course;
import com.lms.entity.Order;
import com.lms.entity.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.OrderRepository;
import com.lms.repository.UserRepository;
import com.lms.service.CourseService;
import com.lms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final CourseService courseService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;

    public AdminController(UserService userService,
                           CourseService courseService,
                           UserRepository userRepository,
                           CourseRepository courseRepository,
                           OrderRepository orderRepository) {
        this.userService = userService;
        this.courseService = courseService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete user: " + e.getMessage());
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        // Returns both approved and pending courses
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @PostMapping("/courses/{id}/approve")
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        try {
            Course approved = courseService.approveCourse(id);
            return ResponseEntity.ok(approved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseRepository.deleteById(id);
            return ResponseEntity.ok("Course deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete course");
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        long totalStudents = userRepository.countByRole("STUDENT");
        long totalInstructors = userRepository.countByRole("INSTRUCTOR");
        long totalCourses = courseRepository.count();
        long approvedCourses = courseRepository.findByApprovedTrue().size();
        long pendingCourses = courseRepository.findByApprovedFalse().size();

        // Calculate total revenue from PAID orders
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.getStatus()))
                .map(Order::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalInstructors", totalInstructors);
        stats.put("totalCourses", totalCourses);
        stats.put("approvedCourses", approvedCourses);
        stats.put("pendingCourses", pendingCourses);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }
}
