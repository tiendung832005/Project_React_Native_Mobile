package com.data.project_reactnative.dto;

public class CreatePostRequest {
    private String imageUrl;
    private String caption;
    private String privacy; // PUBLIC, FRIENDS, PRIVATE

    // Constructors
    public CreatePostRequest() {
    }

    public CreatePostRequest(String imageUrl, String caption, String privacy) {
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.privacy = privacy;
    }

    // Getters and Setters
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
}

