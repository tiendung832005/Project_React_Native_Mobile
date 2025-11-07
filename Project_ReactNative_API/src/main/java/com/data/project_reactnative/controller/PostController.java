package com.data.project_reactnative.controller;

import com.data.project_reactnative.dto.*;
import com.data.project_reactnative.service.PostService;
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
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    /**
     * Get all posts with pagination (for newsfeed)
     * GET /api/posts?page=1&limit=10
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            logger.info("GET /api/posts - page: {}, limit: {}", page, limit);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logger.info("User email from token: {}", email);

            List<PostResponse> posts = postService.getFeedPosts(email);
            logger.info("Retrieved {} posts", posts.size());

            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error in getAllPosts: ", e);
            throw e;
        }
    }

    /**
     * Create a new post
     * POST /api/posts
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestBody CreatePostRequest request) {
        try {
            logger.info("POST /api/posts - Creating new post");

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logger.info("User email: {}", email);

            PostResponse response = postService.createPost(email, request);
            logger.info("Post created successfully with ID: {}", response.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating post: ", e);
            throw e;
        }
    }

    /**
     * Get newsfeed (posts from friends)
     * GET /api/posts/feed
     */
    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFriendsPosts() {
        try {
            logger.info("GET /api/posts/feed");

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logger.info("User email: {}", email);

            List<PostResponse> posts = postService.getFeedPosts(email);
            logger.info("Retrieved {} posts for feed", posts.size());

            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error getting feed: ", e);
            throw e;
        }
    }

    /**
     * Get current user's posts (profile)
     * GET /api/posts/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<PostResponse>> getMyPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        List<PostResponse> posts = postService.getOwnPosts(email);

        return ResponseEntity.ok(posts);
    }

    /**
     * Get posts of a specific user
     * GET /api/posts/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        List<PostResponse> posts = postService.getUserPosts(userId, email);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get post detail by ID
     * GET /api/posts/{postId}
     */
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        PostResponse post = postService.getPostById(postId, email);
        return ResponseEntity.ok(post);
    }

    /**
     * Upload image for a post
     * POST /api/posts/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadMediaResponse>> uploadPostImage(
            @RequestParam("file") MultipartFile file) {
        String imageUrl = postService.uploadPostImage(file);
        UploadMediaResponse response = new UploadMediaResponse(imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Upload successful", response));
    }

    /**
     * Update post privacy
     * PUT /api/posts/{postId}/privacy
     */
    @PutMapping("/{postId}/privacy")
    public ResponseEntity<PostResponse> updatePostPrivacy(
            @PathVariable Long postId,
            @RequestBody UpdatePostPrivacyRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        PostResponse response = postService.updatePostPrivacy(email, postId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Like a post
     * POST /api/posts/{postId}/like
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<Object>> likePost(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        ApiResponse<Object> response = postService.likePost(email, postId);
        return ResponseEntity.ok(response);
    }

    /**
     * Unlike a post
     * DELETE /api/posts/{postId}/like
     */
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<Object>> unlikePost(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        ApiResponse<Object> response = postService.unlikePost(email, postId);
        return ResponseEntity.ok(response);
    }

    /**
     * Add comment to a post
     * POST /api/posts/{postId}/comments
     */
    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        CommentResponse response = postService.addComment(email, postId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all comments for a post
     * GET /api/posts/{postId}/comments
     */
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getPostComments(@PathVariable Long postId) {
        List<CommentResponse> comments = postService.getPostComments(postId);
        return ResponseEntity.ok(comments);
    }
}

