package com.lms.dto;

public class ProgressRequest {
    private Long lessonId;
    private boolean completed;

    public ProgressRequest() {}

    public ProgressRequest(Long lessonId, boolean completed) {
        this.lessonId = lessonId;
        this.completed = completed;
    }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
