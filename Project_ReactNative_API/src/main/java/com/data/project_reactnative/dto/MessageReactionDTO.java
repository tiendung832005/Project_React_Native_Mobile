package com.data.project_reactnative.dto;

import java.time.LocalDateTime;

public class MessageReactionDTO {
    private Long id;
    private UserBasicDTO user;
    private String reactionType; // LIKE, LOVE, HAHA, WOW, SAD, ANGRY
    private LocalDateTime createdAt;

    // Constructors
    public MessageReactionDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserBasicDTO getUser() {
        return user;
    }

    public void setUser(UserBasicDTO user) {
        this.user = user;
    }

    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

