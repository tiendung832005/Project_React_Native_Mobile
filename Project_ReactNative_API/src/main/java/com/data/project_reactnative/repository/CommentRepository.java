package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Comment;
import com.data.project_reactnative.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Find all comments for a specific post
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);

    // Count comments for a specific post
    long countByPost(Post post);
}


