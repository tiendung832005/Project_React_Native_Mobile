package com.data.project_reactnative.dto;

import java.time.LocalDateTime;

public class PostResponse {
    private Long id;
    private Long userId;
    private String username;
    private String userAvatarUrl;
    private String imageUrl;
    private String caption;
    private String privacy;
    private int likesCount;
    private int commentsCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PostResponse() {
    }

    public PostResponse(Long id, Long userId, String username, String userAvatarUrl,
                       String imageUrl, String caption, String privacy,
                       int likesCount, int commentsCount, boolean likedByCurrentUser,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.userAvatarUrl = userAvatarUrl;
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.privacy = privacy;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.likedByCurrentUser = likedByCurrentUser;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getPrivacy() {
        return privacy;
    }

    public void setPrivacy(String privacy) {
        this.privacy = privacy;
    }

    public int getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(int likesCount) {
        this.likesCount = likesCount;
    }

    public int getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(int commentsCount) {
        this.commentsCount = commentsCount;
    }

    public boolean isLikedByCurrentUser() {
        return likedByCurrentUser;
    }

    public void setLikedByCurrentUser(boolean likedByCurrentUser) {
        this.likedByCurrentUser = likedByCurrentUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

