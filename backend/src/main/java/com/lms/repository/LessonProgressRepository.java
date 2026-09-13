package com.lms.repository;

import com.lms.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);
    Optional<LessonProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);
    long countByStudentIdAndCourseIdAndCompletedTrue(Long studentId, Long courseId);
}
