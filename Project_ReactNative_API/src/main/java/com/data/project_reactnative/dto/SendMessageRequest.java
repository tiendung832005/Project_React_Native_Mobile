package com.data.project_reactnative.dto;

public class SendMessageRequest {
    private Long receiverId;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private String type; // TEXT, IMAGE, VIDEO

    // Constructors
    public SendMessageRequest() {
    }

    public SendMessageRequest(Long receiverId, String content) {
        this.receiverId = receiverId;
        this.content = content;
        this.type = "TEXT";
    }

    // Getters and Setters
    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

