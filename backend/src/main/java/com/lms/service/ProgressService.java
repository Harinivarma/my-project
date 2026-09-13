package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Lesson;
import com.lms.entity.LessonProgress;
import com.lms.entity.User;
import com.lms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public ProgressService(LessonProgressRepository lessonProgressRepository,
                           LessonRepository lessonRepository,
                           EnrollmentRepository enrollmentRepository,
                           UserRepository userRepository) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LessonProgress updateProgress(Long lessonId, String studentEmail, boolean completed) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        Course course = lesson.getCourse();

        // Enforce payment/enrollment check
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new IllegalArgumentException("You must be enrolled in the course to track progress");
        }

        LessonProgress progress = lessonProgressRepository.findByStudentIdAndLessonId(student.getId(), lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    newProgress.setStudent(student);
                    newProgress.setCourse(course);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });

        progress.setCompleted(completed);
        progress.setLastWatchedAt(LocalDateTime.now());

        return lessonProgressRepository.save(progress);
    }

    public Map<String, Object> getCourseProgress(Long courseId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        long totalLessons = lessonRepository.countByCourseId(courseId);
        long completedLessons = lessonProgressRepository.countByStudentIdAndCourseIdAndCompletedTrue(student.getId(), courseId);

        int percentage = 0;
        if (totalLessons > 0) {
            percentage = (int) ((completedLessons * 100) / totalLessons);
        }

        List<LessonProgress> progresses = lessonProgressRepository.findByStudentIdAndCourseId(student.getId(), courseId);
        Map<Long, Boolean> completionMap = new HashMap<>();
        for (LessonProgress lp : progresses) {
            completionMap.put(lp.getLesson().getId(), lp.isCompleted());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalLessons", totalLessons);
        response.put("completedLessons", completedLessons);
        response.put("percentage", percentage);
        response.put("completionMap", completionMap);

        return response;
    }
}
