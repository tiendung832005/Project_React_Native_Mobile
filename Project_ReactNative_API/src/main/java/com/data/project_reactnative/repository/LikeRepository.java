package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Like;
import com.data.project_reactnative.model.Post;
import com.data.project_reactnative.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    // Check if user has liked a post
    boolean existsByPostAndUser(Post post, User user);

    // Find a specific like by post and user
    Optional<Like> findByPostAndUser(Post post, User user);

    // Count likes for a specific post
    long countByPost(Post post);
}


