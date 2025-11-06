package com.data.project_reactnative.dto;

import java.time.LocalDateTime;

public class FriendRequestDTO {
    private Long id;
    private UserBasicDTO sender;
    private UserBasicDTO receiver;
    private String status;
    private LocalDateTime createdAt;

    public FriendRequestDTO() {
    }

    public FriendRequestDTO(Long id, UserBasicDTO sender, UserBasicDTO receiver, String status, LocalDateTime createdAt) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

