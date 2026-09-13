package com.lms.dto;

public class OrderRequest {
    private Long courseId;

    public OrderRequest() {}

    public OrderRequest(Long courseId) {
        this.courseId = courseId;
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}
