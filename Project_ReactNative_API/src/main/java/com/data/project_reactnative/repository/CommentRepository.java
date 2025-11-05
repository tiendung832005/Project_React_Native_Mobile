package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
