package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.*;
import com.data.project_reactnative.repository.UserRepository;
import com.data.project_reactnative.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user ID from authentication
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    /**
     * Send a message
     * POST /api/messages
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            logger.info("POST /api/messages - Sending message to user {}", request.getReceiverId());
            Long senderId = getCurrentUserId();
            MessageDTO message = messageService.sendMessage(senderId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.created("Message sent successfully", message));
        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Upload image/video for message
     * POST /api/messages/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadMediaResponse>> uploadMessageMedia(
            @RequestParam("file") MultipartFile file) {
        try {
            logger.info("POST /api/messages/upload - Uploading media file: {}", file.getOriginalFilename());
            String fileUrl = messageService.uploadMessageMedia(file);
            UploadMediaResponse response = new UploadMediaResponse(fileUrl);
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", response));
        } catch (Exception e) {
            logger.error("Error uploading media: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Get messages between current user and another user
     * GET /api/messages/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessages(@PathVariable Long userId) {
        try {
            logger.info("GET /api/messages/{} - Getting messages", userId);
            Long currentUserId = getCurrentUserId();
            List<MessageDTO> messages = messageService.getMessagesBetweenUsers(currentUserId, userId);
            return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
        } catch (Exception e) {
            logger.error("Error getting messages: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Get all conversations for current user
     * GET /api/messages/conversations
     */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getConversations() {
        try {
            logger.info("GET /api/messages/conversations - Getting conversations");
            Long currentUserId = getCurrentUserId();
            List<ConversationDTO> conversations = messageService.getConversations(currentUserId);
            return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", conversations));
        } catch (Exception e) {
            logger.error("Error getting conversations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * React to a message
     * POST /api/messages/{messageId}/react
     */
    @PostMapping("/{messageId}/react")
    public ResponseEntity<ApiResponse<MessageReactionDTO>> reactToMessage(
            @PathVariable Long messageId,
            @RequestBody ReactToMessageRequest request) {
        try {
            logger.info("POST /api/messages/{}/react - Reacting with {}", messageId, request.getReactionType());
            Long currentUserId = getCurrentUserId();
            MessageReactionDTO reaction = messageService.reactToMessage(currentUserId, messageId, request);
            
            if (reaction == null) {
                // Reaction was removed
                return ResponseEntity.ok(ApiResponse.success("Reaction removed", null));
            } else {
                return ResponseEntity.ok(ApiResponse.success("Reaction added", reaction));
            }
        } catch (Exception e) {
            logger.error("Error reacting to message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Mark messages as read
     * PUT /api/messages/{userId}/read
     */
    @PutMapping("/{userId}/read")
    public ResponseEntity<ApiResponse<String>> markMessagesAsRead(@PathVariable Long userId) {
        try {
            logger.info("PUT /api/messages/{}/read - Marking messages as read", userId);
            Long currentUserId = getCurrentUserId();
            messageService.markMessagesAsRead(currentUserId, userId);
            return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
        } catch (Exception e) {
            logger.error("Error marking messages as read: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }
}

