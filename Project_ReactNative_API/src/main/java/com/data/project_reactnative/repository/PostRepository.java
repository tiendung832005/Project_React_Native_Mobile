package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Post;
import com.data.project_reactnative.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Find all posts by user
    List<Post> findByUserOrderByCreatedAtDesc(User user);

    // Find posts by user IDs (for friends' posts)
    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds ORDER BY p.createdAt DESC")
    List<Post> findByUserIdInOrderByCreatedAtDesc(@Param("userIds") List<Long> userIds);

    // Find all public posts ordered by creation date
    @Query("SELECT p FROM Post p WHERE p.privacy = 'PUBLIC' ORDER BY p.createdAt DESC")
    List<Post> findPublicPostsOrderByCreatedAtDesc();
}


