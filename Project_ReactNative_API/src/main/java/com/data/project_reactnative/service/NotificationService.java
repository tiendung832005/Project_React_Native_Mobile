package com.data.project_reactnative.service;

import com.data.project_reactnative.dto.NotificationCountDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private FriendService friendService;

    @Autowired
    private MessageService messageService;

    /**
     * Get notification counts for a user
     */
    public NotificationCountDTO getNotificationCounts(Long userId) {
        long friendRequestCount = friendService.countPendingFriendRequests(userId);
        long unreadMessageCount = messageService.countUnreadMessages(userId);
        return new NotificationCountDTO(friendRequestCount, unreadMessageCount);
    }
}

