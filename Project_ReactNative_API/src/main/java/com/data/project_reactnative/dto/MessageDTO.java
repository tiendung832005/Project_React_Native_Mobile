package com.data.project_reactnative.dto;

import java.time.LocalDateTime;
import java.util.List;

public class MessageDTO {
    private Long id;
    private UserBasicDTO sender;
    private UserBasicDTO receiver;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;
    private List<MessageReactionDTO> reactions;

    // Constructors
    public MessageDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserBasicDTO getSender() {
        return sender;
    }

    public void setSender(UserBasicDTO sender) {
        this.sender = sender;
    }

    public UserBasicDTO getReceiver() {
        return receiver;
    }

    public void setReceiver(UserBasicDTO receiver) {
        this.receiver = receiver;
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

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<MessageReactionDTO> getReactions() {
        return reactions;
    }

    public void setReactions(List<MessageReactionDTO> reactions) {
        this.reactions = reactions;
    }
}

