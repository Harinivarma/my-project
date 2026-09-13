package com.lms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "lesson_id"})
})
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    private boolean completed = false;

    @Column(name = "last_watched_at")
    private LocalDateTime lastWatchedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastWatchedAt = LocalDateTime.now();
    }

    public LessonProgress() {}

    public LessonProgress(Long id, User student, Course course, Lesson lesson, boolean completed) {
        this.id = id;
        this.student = student;
        this.course = course;
        this.lesson = lesson;
        this.completed = completed;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getLastWatchedAt() { return lastWatchedAt; }
    public void setLastWatchedAt(LocalDateTime lastWatchedAt) { this.lastWatchedAt = lastWatchedAt; }
}
