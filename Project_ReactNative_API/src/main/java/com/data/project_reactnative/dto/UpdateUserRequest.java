package com.data.project_reactnative.dto;

public class UpdateUserRequest {
    private String avatarUrl;
    private String bio;

    // Constructors
    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String avatarUrl, String bio) {
        this.avatarUrl = avatarUrl;
        this.bio = bio;
    }

    // Getters and Setters
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}

