package com.lms.controller;

import com.lms.dto.OrderRequest;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<Course> courses = enrollmentService.getStudentCourses(email);
            return ResponseEntity.ok(courses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/enroll-free")
    public ResponseEntity<?> enrollFree(@RequestBody OrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Enrollment enrollment = enrollmentService.enrollFreeCourse(request.getCourseId(), email);
            return ResponseEntity.ok(enrollment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<Boolean> checkEnrollment(@PathVariable Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isEnrolled = enrollmentService.isStudentEnrolled(email, courseId);
        return ResponseEntity.ok(isEnrolled);
    }
}
