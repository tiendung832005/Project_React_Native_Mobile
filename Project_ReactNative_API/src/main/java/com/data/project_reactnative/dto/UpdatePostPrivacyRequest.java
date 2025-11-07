package com.data.project_reactnative.dto;

public class UpdatePostPrivacyRequest {
    private String privacy; // PUBLIC, FRIENDS, PRIVATE

    // Constructors
    public UpdatePostPrivacyRequest() {
    }

    public UpdatePostPrivacyRequest(String privacy) {
        this.privacy = privacy;
    }

    // Getters and Setters
    public String getPrivacy() {
        return privacy;
    }

    public void setPrivacy(String privacy) {
        this.privacy = privacy;
    }
}

