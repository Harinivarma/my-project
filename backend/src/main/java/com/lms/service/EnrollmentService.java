package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public boolean isStudentEnrolled(String email, Long courseId) {
        OptionalUser(email);
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null) return false;
        return enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId);
    }

    public List<Course> getStudentCourses(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Enrollment enrollFreeCourse(Long courseId, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Only allow free courses (price == 0) to be enrolled directly
        if (course.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Cannot enroll in paid course directly without payment");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new IllegalArgumentException("Already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        return enrollmentRepository.save(enrollment);
    }

    private void OptionalUser(String email) {}
}
