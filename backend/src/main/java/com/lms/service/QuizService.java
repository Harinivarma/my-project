package com.lms.service;

import com.lms.entity.Quiz;
import com.lms.entity.QuizAttempt;
import com.lms.entity.QuizQuestion;
import com.lms.entity.User;
import com.lms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public QuizService(QuizRepository quizRepository,
                       QuizQuestionRepository quizQuestionRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       EnrollmentRepository enrollmentRepository,
                       UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    public List<Quiz> getQuizzesForCourse(Long courseId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Enrollment check
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new IllegalArgumentException("You must be enrolled to access quizzes");
        }

        return quizRepository.findByCourseId(courseId);
    }

    public List<QuizQuestion> getQuizQuestions(Long quizId, String studentEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Enrollment check
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), quiz.getCourse().getId())) {
            throw new IllegalArgumentException("You must be enrolled to access quiz questions");
        }

        return quizQuestionRepository.findByQuizId(quizId);
    }

    @Transactional
    public QuizAttempt submitAttempt(Long quizId, Map<Long, String> studentAnswers, String studentEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Enrollment check
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), quiz.getCourse().getId())) {
            throw new IllegalArgumentException("You must be enrolled to attempt this quiz");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);
        int score = 0;

        for (QuizQuestion q : questions) {
            String studentAnswer = studentAnswers.get(q.getId());
            if (studentAnswer != null && studentAnswer.trim().equalsIgnoreCase(q.getCorrectAnswer().trim())) {
                score++;
            }
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());

        return quizAttemptRepository.save(attempt);
    }

    public List<QuizAttempt> getPastAttempts(Long quizId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        return quizAttemptRepository.findByStudentIdAndQuizIdOrderByAttemptedAtDesc(student.getId(), quizId);
    }
}
