package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.*;
import com.data.project_reactnative.service.FriendService;
import com.data.project_reactnative.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @Autowired
    private JwtUtil jwtUtil;

    // Lấy userId từ token
    private Long getUserIdFromToken(String token) {
        String jwt = token.substring(7); // Bỏ "Bearer "
        String email = jwtUtil.extractUsername(jwt);
        return jwtUtil.extractUserId(jwt);
    }

    // API tìm kiếm người dùng theo số điện thoại
    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<UserBasicDTO>> searchUserByPhone(
            @RequestParam String phone,
            @RequestHeader("Authorization") String token) {
        try {
            UserBasicDTO user = friendService.searchUserByPhone(phone);
            return ResponseEntity.ok(ApiResponse.success("Tìm thấy người dùng", user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        }
    }

    // API gửi lời mời kết bạn
    @PostMapping("/friends/request")
    public ResponseEntity<ApiResponse<FriendRequestDTO>> sendFriendRequest(
            @RequestBody SendFriendRequestDTO request,
            @RequestHeader("Authorization") String token) {
        try {
            Long senderId = getUserIdFromToken(token);
            FriendRequestDTO friendRequest = friendService.sendFriendRequest(senderId, request.getReceiverId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.created("Đã gửi lời mời kết bạn", friendRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API chấp nhận lời mời kết bạn
    @PostMapping("/friends/accept/{requestId}")
    public ResponseEntity<ApiResponse<String>> acceptFriendRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = getUserIdFromToken(token);
            String message = friendService.acceptFriendRequest(requestId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API từ chối lời mời kết bạn
    @PostMapping("/friends/reject/{requestId}")
    public ResponseEntity<ApiResponse<String>> rejectFriendRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = getUserIdFromToken(token);
            String message = friendService.rejectFriendRequest(requestId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API hủy kết bạn
    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<ApiResponse<String>> unfriend(
            @PathVariable Long friendId,
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = getUserIdFromToken(token);
            String message = friendService.unfriend(userId, friendId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API lấy danh sách lời mời kết bạn
    @GetMapping("/friends/requests")
    public ResponseEntity<ApiResponse<List<FriendRequestDTO>>> getFriendRequests(
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = getUserIdFromToken(token);
            List<FriendRequestDTO> requests = friendService.getFriendRequests(userId);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lời mời thành công", requests));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API lấy danh sách bạn bè
    @GetMapping("/friends")
    public ResponseEntity<ApiResponse<List<FriendDTO>>> getFriends(
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = getUserIdFromToken(token);
            List<FriendDTO> friends = friendService.getFriends(userId);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bạn bè thành công", friends));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API chặn người dùng
    @PostMapping("/friends/block/{userId}")
    public ResponseEntity<ApiResponse<String>> blockUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String token) {
        try {
            Long blockerId = getUserIdFromToken(token);
            String message = friendService.blockUser(blockerId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    // API bỏ chặn người dùng
    @PostMapping("/friends/unblock/{userId}")
    public ResponseEntity<ApiResponse<String>> unblockUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String token) {
        try {
            Long blockerId = getUserIdFromToken(token);
            String message = friendService.unblockUser(blockerId, userId);
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }
}

