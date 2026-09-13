package com.lms.controller;

import com.lms.entity.Course;
import com.lms.entity.Lesson;
import com.lms.service.CourseService;
import com.lms.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;

    public CourseController(CourseService courseService, EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getCourses(@RequestParam(value = "search", required = false) String search) {
        if (search != null) {
            return ResponseEntity.ok(courseService.searchCourses(search));
        }
        return ResponseEntity.ok(courseService.getApprovedCourses());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Course>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        try {
            Course course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Course created = courseService.createCourse(course, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Course updated = courseService.updateCourse(id, courseDetails, email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        try {
            courseService.deleteCourse(id, email, role);
            return ResponseEntity.ok("Course deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/instructor/my-courses")
    public ResponseEntity<?> getInstructorCourses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<Course> courses = courseService.getInstructorCourses(email);
            return ResponseEntity.ok(courses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Lesson Controller Paths ---

    @GetMapping("/{id}/lessons")
    public ResponseEntity<?> getLessons(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        try {
            Course course = courseService.getCourseById(id);

            // Access control for paid lessons:
            // Must be Admin OR the owning Instructor OR a student who is currently enrolled
            if (course.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
                if (!"ADMIN".equals(role) && !course.getInstructor().getEmail().equals(email)) {
                    boolean isEnrolled = enrollmentService.isStudentEnrolled(email, id);
                    if (!isEnrolled) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Access Denied: You must purchase this course to access lessons.");
                    }
                }
            }

            List<Lesson> lessons = courseService.getLessonsForCourse(id);
            return ResponseEntity.ok(lessons);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/lessons")
    public ResponseEntity<?> addLesson(@PathVariable Long id, @RequestBody Lesson lesson) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Lesson created = courseService.addLesson(id, lesson, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<?> updateLesson(@PathVariable Long lessonId, @RequestBody Lesson lesson) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Lesson updated = courseService.updateLesson(lessonId, lesson, email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            courseService.deleteLesson(lessonId, email);
            return ResponseEntity.ok("Lesson deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
