package com.data.project_reactnative.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    private Long userId;
    private String username;
    private String avatarUrl;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private boolean hasUnread;

    // Constructors
    public ConversationDTO() {
    }

    public ConversationDTO(Long userId, String username, String avatarUrl, 
                          String lastMessage, LocalDateTime lastMessageTime, boolean hasUnread) {
        this.userId = userId;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.hasUnread = hasUnread;
    }

    // Getters and Setters
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public boolean isHasUnread() {
        return hasUnread;
    }

    public void setHasUnread(boolean hasUnread) {
        this.hasUnread = hasUnread;
    }
}

