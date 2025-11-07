package com.data.project_reactnative.service;

import com.data.project_reactnative.dto.*;
import com.data.project_reactnative.exception.PostNotFoundException;
import com.data.project_reactnative.exception.UserNotFoundException;
import com.data.project_reactnative.model.*;
import com.data.project_reactnative.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Create a new post
     */
    @Transactional
    public PostResponse createPost(String email, CreatePostRequest request) {
        logger.info("Creating post for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = new Post();
        post.setUser(user);
        post.setImageUrl(request.getImageUrl());
        post.setCaption(request.getCaption());

        // Set privacy, default to PUBLIC if not specified
        if (request.getPrivacy() != null) {
            try {
                post.setPrivacy(Post.Privacy.valueOf(request.getPrivacy().toUpperCase()));
            } catch (IllegalArgumentException e) {
                post.setPrivacy(Post.Privacy.PUBLIC);
            }
        } else {
            post.setPrivacy(Post.Privacy.PUBLIC);
        }

        Post savedPost = postRepository.save(post);
        logger.info("Post created with ID: {}", savedPost.getId());

        return mapToPostResponse(savedPost, user);
    }

    /**
     * Get posts from friends (newsfeed)
     */
    public List<PostResponse> getFeedPosts(String email) {
        logger.info("Getting feed posts for user: {}", email);

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        logger.info("Found user: {} (ID: {})", currentUser.getUsername(), currentUser.getId());

        // Get list of friend IDs
        List<Long> friendIds = getFriendIds(currentUser.getId());
        logger.info("Friend IDs: {}", friendIds);

        if (friendIds.isEmpty()) {
            logger.info("User {} has no friends - returning empty feed", currentUser.getId());
            return List.of();
        }

        // Get posts from friends only
        List<Post> posts = postRepository.findByUserIdInOrderByCreatedAtDesc(friendIds);
        logger.info("Found {} total posts from friends", posts.size());

        // Filter posts based on privacy
        List<Post> visiblePosts = posts.stream()
                .filter(post -> canViewPost(post, currentUser))
                .collect(Collectors.toList());
        logger.info("After privacy filter: {} visible posts", visiblePosts.size());

        List<PostResponse> responses = visiblePosts.stream()
                .map(post -> mapToPostResponse(post, currentUser))
                .collect(Collectors.toList());

        logger.info("Returning {} feed post responses", responses.size());
        return responses;
    }

    /**
     * Get posts for a specific user profile
     */
    public List<PostResponse> getUserPosts(Long targetUserId, String viewerEmail) {
        logger.info("Getting posts for user {} requested by {}", targetUserId, viewerEmail);

        User viewer = userRepository.findByEmail(viewerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + viewerEmail));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + targetUserId));

        List<Post> posts = postRepository.findByUserOrderByCreatedAtDesc(targetUser);
        logger.info("Found {} posts for user {}", posts.size(), targetUserId);

        List<Post> visiblePosts = posts.stream()
                .filter(post -> canViewPost(post, viewer))
                .collect(Collectors.toList());

        logger.info("{} posts visible to viewer {}", visiblePosts.size(), viewer.getId());

        return visiblePosts.stream()
                .map(post -> mapToPostResponse(post, viewer))
                .collect(Collectors.toList());
    }

    /**
     * Get posts for the current authenticated user
     */
    public List<PostResponse> getOwnPosts(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        return getUserPosts(currentUser.getId(), email);
    }

    /**
     * Get post details by ID with privacy checks
     */
    public PostResponse getPostById(Long postId, String viewerEmail) {
        logger.info("Getting post {} requested by {}", postId, viewerEmail);

        User viewer = userRepository.findByEmail(viewerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + viewerEmail));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        if (!canViewPost(post, viewer)) {
            logger.warn("User {} does not have access to post {}", viewer.getId(), postId);
            throw new RuntimeException("You don't have permission to view this post");
        }

        return mapToPostResponse(post, viewer);
    }

    public String uploadPostImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image")) {
            throw new RuntimeException("Only image files are allowed");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String cleanedName = StringUtils.hasText(originalFilename) ? StringUtils.cleanPath(originalFilename) : "image";
            String extension = "";
            int extIndex = cleanedName.lastIndexOf('.');
            if (extIndex != -1) {
                extension = cleanedName.substring(extIndex);
            } else if (contentType.contains("png")) {
                extension = ".png";
            } else {
                extension = ".jpg";
            }

            String fileName = UUID.randomUUID() + extension;
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName)
                    .toUriString();
        } catch (IOException e) {
            logger.error("Error storing file", e);
            throw new RuntimeException("Could not store file. Please try again.");
        }
    }

    /**
     * Update post privacy
     */
    @Transactional
    public PostResponse updatePostPrivacy(String email, Long postId, UpdatePostPrivacyRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        // Check if user owns the post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to edit this post");
        }

        // Update privacy
        try {
            post.setPrivacy(Post.Privacy.valueOf(request.getPrivacy().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid privacy value. Use: PUBLIC, FRIENDS, or PRIVATE");
        }

        Post updatedPost = postRepository.save(post);
        return mapToPostResponse(updatedPost, user);
    }

    /**
     * Like a post (reaction)
     */
    @Transactional
    public ApiResponse<Object> likePost(String email, Long postId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        // Check if already liked
        if (likeRepository.existsByPostAndUser(post, user)) {
            return ApiResponse.error(400, "Bạn đã thích bài viết này rồi");
        }

        // Create new like
        Like like = new Like();
        like.setPost(post);
        like.setUser(user);
        likeRepository.save(like);

        return ApiResponse.success("Đã thích bài viết", null);
    }

    /**
     * Unlike a post
     */
    @Transactional
    public ApiResponse<Object> unlikePost(String email, Long postId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        // Find and delete the like
        Like like = likeRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new RuntimeException("Bạn chưa thích bài viết này"));

        likeRepository.delete(like);

        return ApiResponse.success("Đã bỏ thích bài viết", null);
    }

    /**
     * Add comment to a post
     */
    @Transactional
    public CommentResponse addComment(String email, Long postId, CreateCommentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(request.getContent());

        Comment savedComment = commentRepository.save(comment);

        return new CommentResponse(
                savedComment.getId(),
                post.getId(),
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                savedComment.getContent(),
                savedComment.getCreatedAt()
        );
    }

    /**
     * Get all comments for a post
     */
    public List<CommentResponse> getPostComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post);

        return comments.stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        post.getId(),
                        comment.getUser().getId(),
                        comment.getUser().getUsername(),
                        comment.getUser().getAvatarUrl(),
                        comment.getContent(),
                        comment.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // Helper methods

    private List<Long> getFriendIds(Long userId) {
        // Get accepted friend requests where user is sender
        List<FriendRequest> sentRequests = friendRequestRepository
                .findBySenderIdAndStatus(userId, FriendRequest.Status.ACCEPTED);

        // Get accepted friend requests where user is receiver
        List<FriendRequest> receivedRequests = friendRequestRepository
                .findByReceiverIdAndStatus(userId, FriendRequest.Status.ACCEPTED);

        List<Long> friendIds = new ArrayList<>();

        for (FriendRequest request : sentRequests) {
            friendIds.add(request.getReceiver().getId());
        }

        for (FriendRequest request : receivedRequests) {
            friendIds.add(request.getSender().getId());
        }

        return friendIds;
    }

    private boolean canViewPost(Post post, User viewer) {
        // Owner can always see their own posts
        if (post.getUser().getId().equals(viewer.getId())) {
            return true;
        }

        // Check privacy
        switch (post.getPrivacy()) {
            case PUBLIC:
                return true;
            case FRIENDS:
                List<Long> friendIds = getFriendIds(viewer.getId());
                return friendIds.contains(post.getUser().getId());
            case PRIVATE:
                return false;
            default:
                return false;
        }
    }

    private PostResponse mapToPostResponse(Post post, User currentUser) {
        int likesCount = (int) likeRepository.countByPost(post);
        int commentsCount = (int) commentRepository.countByPost(post);
        boolean likedByCurrentUser = likeRepository.existsByPostAndUser(post, currentUser);

        return new PostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getUsername(),
                post.getUser().getAvatarUrl(),
                post.getImageUrl(),
                post.getCaption(),
                post.getPrivacy().toString(),
                likesCount,
                commentsCount,
                likedByCurrentUser,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}

