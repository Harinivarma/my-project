package com.lms.dto;

import java.util.Map;

public class QuizAttemptRequest {
    private Map<Long, String> answers; // Map of questionId -> answer ('A', 'B', 'C', 'D')

    public QuizAttemptRequest() {}

    public QuizAttemptRequest(Map<Long, String> answers) {
        this.answers = answers;
    }

    public Map<Long, String> getAnswers() { return answers; }
    public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
}
