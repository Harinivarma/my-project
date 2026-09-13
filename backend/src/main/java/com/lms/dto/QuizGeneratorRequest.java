package com.lms.dto;

public class QuizGeneratorRequest {
    private Long courseId;
    private String quizTitle;
    private String content; // Course notes/content to read from

    public QuizGeneratorRequest() {}

    public QuizGeneratorRequest(Long courseId, String quizTitle, String content) {
        this.courseId = courseId;
        this.quizTitle = quizTitle;
        this.content = content;
    }

    // Getters and Setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
