package com.data.project_reactnative.dto;

public class SendFriendRequestDTO {
    private Long receiverId;

    public SendFriendRequestDTO() {
    }

    public SendFriendRequestDTO(Long receiverId) {
        this.receiverId = receiverId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
}

