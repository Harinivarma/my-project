package com.lms.controller;

import com.lms.dto.QuizAttemptRequest;
import com.lms.dto.QuizGeneratorRequest;
import com.lms.entity.Quiz;
import com.lms.entity.QuizAttempt;
import com.lms.entity.QuizQuestion;
import com.lms.service.QuizGeneratorService;
import com.lms.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final QuizGeneratorService quizGeneratorService;

    public QuizController(QuizService quizService, QuizGeneratorService quizGeneratorService) {
        this.quizService = quizService;
        this.quizGeneratorService = quizGeneratorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody QuizGeneratorRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Quiz quiz = quizGeneratorService.generateQuizFromContent(
                    request.getCourseId(),
                    request.getQuizTitle(),
                    request.getContent(),
                    email
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getQuizzes(@PathVariable Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<Quiz> quizzes = quizService.getQuizzesForCourse(courseId, email);
            return ResponseEntity.ok(quizzes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable Long quizId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<QuizQuestion> questions = quizService.getQuizQuestions(quizId, email);
            return ResponseEntity.ok(questions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/{quizId}/attempt")
    public ResponseEntity<?> attemptQuiz(@PathVariable Long quizId, @RequestBody QuizAttemptRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            QuizAttempt attempt = quizService.submitAttempt(quizId, request.getAnswers(), email);
            return ResponseEntity.ok(attempt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/{quizId}/attempts")
    public ResponseEntity<?> getAttempts(@PathVariable Long quizId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<QuizAttempt> attempts = quizService.getPastAttempts(quizId, email);
            return ResponseEntity.ok(attempts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
