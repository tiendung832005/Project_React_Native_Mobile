package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.ApiResponse;
import com.data.project_reactnative.dto.NotificationCountDTO;
import com.data.project_reactnative.model.User;
import com.data.project_reactnative.repository.UserRepository;
import com.data.project_reactnative.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user ID from authentication
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Get notification counts (friend requests and unread messages)
     * GET /api/notifications/counts
     */
    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<NotificationCountDTO>> getNotificationCounts() {
        try {
            logger.info("GET /api/notifications/counts - Getting notification counts");
            Long userId = getCurrentUserId();
            NotificationCountDTO counts = notificationService.getNotificationCounts(userId);
            return ResponseEntity.ok(ApiResponse.success("Notification counts retrieved successfully", counts));
        } catch (Exception e) {
            logger.error("Error getting notification counts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }
}

