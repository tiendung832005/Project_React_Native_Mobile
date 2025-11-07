package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.FriendRequestDTO;
import com.data.project_reactnative.service.FriendService;
import com.data.project_reactnative.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class PublicFriendController {

    private static final Logger logger = LoggerFactory.getLogger(PublicFriendController.class);

    @Autowired
    private FriendService friendService;

    @Autowired
    private JwtUtil jwtUtil;

    // Public endpoint (no /api prefix) to support frontend expecting /friends/follow-requests/pending
    @GetMapping("/friends/follow-requests/pending")
    public ResponseEntity<Map<String, Object>> getPendingFollowRequestsPublic(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            logger.info("GET /friends/follow-requests/pending (public)");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Missing or invalid Authorization header");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Missing or invalid Authorization header");
                errorResponse.put("requests", List.of());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String jwt = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            String email = jwtUtil.extractUsername(jwt);
            logger.info("Getting pending requests for user: {} (ID: {})", email, userId);

            List<FriendRequestDTO> requests = friendService.getFriendRequests(userId);
            logger.info("Found {} pending requests", requests.size());

            Map<String, Object> response = new HashMap<>();
            response.put("requests", requests);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in public pending requests endpoint: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("requests", List.of());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

