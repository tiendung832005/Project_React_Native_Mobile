package com.data.project_reactnative.dto;

public class NotificationCountDTO {
    private long friendRequestCount;
    private long unreadMessageCount;

    public NotificationCountDTO() {
    }

    public NotificationCountDTO(long friendRequestCount, long unreadMessageCount) {
        this.friendRequestCount = friendRequestCount;
        this.unreadMessageCount = unreadMessageCount;
    }

    public long getFriendRequestCount() {
        return friendRequestCount;
    }

    public void setFriendRequestCount(long friendRequestCount) {
        this.friendRequestCount = friendRequestCount;
    }

    public long getUnreadMessageCount() {
        return unreadMessageCount;
    }

    public void setUnreadMessageCount(long unreadMessageCount) {
        this.unreadMessageCount = unreadMessageCount;
    }
}

