package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Lesson;
import com.lms.entity.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.LessonRepository;
import com.lms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository,
                         LessonRepository lessonRepository,
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
    }

    public List<Course> getApprovedCourses() {
        return courseRepository.findByApprovedTrue();
    }

    public List<Course> getPendingCourses() {
        return courseRepository.findByApprovedFalse();
    }

    public List<Course> getInstructorCourses(String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
        return courseRepository.findByInstructorId(instructor.getId());
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    public List<Course> searchCourses(String query) {
        if (query == null || query.trim().isEmpty()) {
            return courseRepository.findByApprovedTrue();
        }
        return courseRepository.searchCourses(query.trim());
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category.trim());
    }

    @Transactional
    public Course createCourse(Course course, String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));

        if (!"INSTRUCTOR".equals(instructor.getRole())) {
            throw new IllegalArgumentException("Only instructors can create courses");
        }

        course.setInstructor(instructor);
        course.setApproved(false); // Requires admin approval
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long courseId, Course courseDetails, String instructorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Ownership check
        if (!course.getInstructor().getEmail().equals(instructorEmail)) {
            throw new IllegalArgumentException("You can only modify your own courses");
        }

        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setCategory(courseDetails.getCategory());
        course.setSkillsTags(courseDetails.getSkillsTags());
        course.setPrice(courseDetails.getPrice());
        if (courseDetails.getThumbnailUrl() != null) {
            course.setThumbnailUrl(courseDetails.getThumbnailUrl());
        }

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId, String userEmail, String userRole) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Allow deletion if Admin, or if Instructor is the owner
        if ("ADMIN".equals(userRole) || course.getInstructor().getEmail().equals(userEmail)) {
            courseRepository.delete(course);
        } else {
            throw new IllegalArgumentException("Unauthorized to delete this course");
        }
    }

    @Transactional
    public Course approveCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        course.setApproved(true);
        return courseRepository.save(course);
    }

    // --- Lesson Operations ---

    public List<Lesson> getLessonsForCourse(Long courseId) {
        // Enforce approved check if user is browsing anonymously, but let controllers call checking enrollment
        return lessonRepository.findByCourseIdOrderBySequenceOrderAsc(courseId);
    }

    @Transactional
    public Lesson addLesson(Long courseId, Lesson lesson, String instructorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!course.getInstructor().getEmail().equals(instructorEmail)) {
            throw new IllegalArgumentException("Unauthorized: You do not own this course");
        }

        lesson.setCourse(course);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long lessonId, Lesson lessonDetails, String instructorEmail) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (!lesson.getCourse().getInstructor().getEmail().equals(instructorEmail)) {
            throw new IllegalArgumentException("Unauthorized: You do not own this course");
        }

        lesson.setTitle(lessonDetails.getTitle());
        lesson.setVideoUrl(lessonDetails.getVideoUrl());
        lesson.setNotes(lessonDetails.getNotes());
        lesson.setSequenceOrder(lessonDetails.getSequenceOrder());

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId, String instructorEmail) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (!lesson.getCourse().getInstructor().getEmail().equals(instructorEmail)) {
            throw new IllegalArgumentException("Unauthorized: You do not own this course");
        }

        lessonRepository.delete(lesson);
    }
}
