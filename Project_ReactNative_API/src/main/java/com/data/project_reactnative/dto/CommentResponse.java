package com.data.project_reactnative.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String username;
    private String userAvatarUrl;
    private String content;
    private LocalDateTime createdAt;

    // Constructors
    public CommentResponse() {
    }

    public CommentResponse(Long id, Long postId, Long userId, String username,
                          String userAvatarUrl, String content, LocalDateTime createdAt) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.username = username;
        this.userAvatarUrl = userAvatarUrl;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserAvatarUrl() {
        return userAvatarUrl;
    }

    public void setUserAvatarUrl(String userAvatarUrl) {
        this.userAvatarUrl = userAvatarUrl;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

