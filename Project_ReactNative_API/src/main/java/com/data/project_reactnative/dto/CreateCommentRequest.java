package com.data.project_reactnative.dto;

public class CreateCommentRequest {
    private String content;

    // Constructors
    public CreateCommentRequest() {
    }

    public CreateCommentRequest(String content) {
        this.content = content;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}

