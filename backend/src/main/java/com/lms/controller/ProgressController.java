package com.lms.controller;

import com.lms.dto.ProgressRequest;
import com.lms.entity.LessonProgress;
import com.lms.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    public ResponseEntity<?> updateProgress(@RequestBody ProgressRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            LessonProgress progress = progressService.updateProgress(request.getLessonId(), email, request.isCompleted());
            return ResponseEntity.ok(progress);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseProgress(@PathVariable Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Map<String, Object> progressData = progressService.getCourseProgress(courseId, email);
            return ResponseEntity.ok(progressData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
