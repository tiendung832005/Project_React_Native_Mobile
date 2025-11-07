package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.*;
import com.data.project_reactnative.model.User;
import com.data.project_reactnative.repository.UserRepository;
import com.data.project_reactnative.service.FriendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FriendController {

    private static final Logger logger = LoggerFactory.getLogger(FriendController.class);

    @Autowired
    private FriendService friendService;

    @Autowired
    private UserRepository userRepository;

    // Lấy userId từ authentication
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // API tìm kiếm người dùng theo số điện thoại
    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<UserBasicDTO>> searchUserByPhone(
            @RequestParam String phone) {
        try {
            logger.info("Search user by phone: {}", phone);
            UserBasicDTO user = friendService.searchUserByPhone(phone);
            return ResponseEntity.ok(ApiResponse.success("Tìm thấy người dùng", user));
        } catch (RuntimeException e) {
            logger.error("Error searching user by phone: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        }
    }

    // API gửi lời mời kết bạn
    @PostMapping("/friends/request")
    public ResponseEntity<ApiResponse<FriendRequestDTO>> sendFriendRequest(
            @RequestBody SendFriendRequestDTO request) {
        try {
            Long senderId = getCurrentUserId();
            logger.info("Sending friend request from {} to {}", senderId, request.getReceiverId());
            FriendRequestDTO friendRequest = friendService.sendFriendRequest(senderId, request.getReceiverId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.created("Đã gửi lời mời kết bạn", friendRequest));
        } catch (RuntimeException e) {
            logger.error("Error sending friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API chấp nhận lời mời kết bạn
    @PostMapping("/friends/accept/{requestId}")
    public ResponseEntity<ApiResponse<String>> acceptFriendRequest(
            @PathVariable Long requestId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Accepting friend request {} by user {}", requestId, userId);
            String message = friendService.acceptFriendRequest(requestId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            logger.error("Error accepting friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API từ chối lời mời kết bạn
    @PostMapping("/friends/reject/{requestId}")
    public ResponseEntity<ApiResponse<String>> rejectFriendRequest(
            @PathVariable Long requestId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Rejecting friend request {} by user {}", requestId, userId);
            String message = friendService.rejectFriendRequest(requestId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            logger.error("Error rejecting friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API hủy lời mời kết bạn đã gửi (cancel request)
    @DeleteMapping("/friends/request/{receiverId}")
    public ResponseEntity<ApiResponse<String>> cancelFriendRequest(
            @PathVariable Long receiverId) {
        try {
            Long senderId = getCurrentUserId();
            logger.info("Canceling friend request from {} to {}", senderId, receiverId);
            String message = friendService.cancelFriendRequest(senderId, receiverId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            logger.error("Error canceling friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API hủy kết bạn
    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<ApiResponse<String>> unfriend(
            @PathVariable Long friendId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Unfriending {} by user {}", friendId, userId);
            String message = friendService.unfriend(userId, friendId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            logger.error("Error unfriending: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API lấy danh sách lời mời kết bạn đang chờ (cho frontend)
    @GetMapping("/friends/follow-requests/pending")
    public ResponseEntity<Map<String, Object>> getPendingFollowRequests() {
        try {
            logger.info("GET /api/friends/follow-requests/pending");

            Long userId = getCurrentUserId();
            logger.info("Getting pending requests for user ID: {}", userId);

            List<FriendRequestDTO> requests = friendService.getFriendRequests(userId);
            logger.info("Found {} pending requests", requests.size());

            Map<String, Object> response = new HashMap<>();
            response.put("requests", requests);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting pending requests: ", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("requests", List.of());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // API lấy danh sách lời mời kết bạn (existing - for backward compatibility)
    @GetMapping("/friends/requests")
    public ResponseEntity<ApiResponse<List<FriendRequestDTO>>> getFriendRequests() {
        try {
            Long userId = getCurrentUserId();
            List<FriendRequestDTO> requests = friendService.getFriendRequests(userId);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lời mời thành công", requests));
        } catch (RuntimeException e) {
            logger.error("Error getting friend requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API lấy danh sách bạn bè (following/friends)
    @GetMapping("/friends")
    public ResponseEntity<ApiResponse<List<FriendDTO>>> getFriends() {
        try {
            Long userId = getCurrentUserId();
            logger.info("Getting friends for user ID: {}", userId);
            List<FriendDTO> friends = friendService.getFriends(userId);
            logger.info("Found {} friends", friends.size());
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bạn bè thành công", friends));
        } catch (RuntimeException e) {
            logger.error("Error getting friends: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API chặn người dùng
    @PostMapping("/friends/block/{userId}")
    public ResponseEntity<ApiResponse<String>> blockUser(
            @PathVariable Long userId) {
        try {
            Long blockerId = getCurrentUserId();
            String message = friendService.blockUser(blockerId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            logger.error("Error blocking user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API bỏ chặn người dùng
    @PostMapping("/friends/unblock/{userId}")
    public ResponseEntity<ApiResponse<String>> unblockUser(
            @PathVariable Long userId) {
        try {
            Long blockerId = getCurrentUserId();
            String message = friendService.unblockUser(blockerId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            logger.error("Error unblocking user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }
}
