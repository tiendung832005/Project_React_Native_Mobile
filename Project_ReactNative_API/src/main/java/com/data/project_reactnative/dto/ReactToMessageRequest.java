package com.data.project_reactnative.dto;

public class ReactToMessageRequest {
    private String reactionType; // LIKE, LOVE, HAHA, WOW, SAD, ANGRY

    // Constructors
    public ReactToMessageRequest() {
    }

    public ReactToMessageRequest(String reactionType) {
        this.reactionType = reactionType;
    }

    // Getters and Setters
    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }
}

