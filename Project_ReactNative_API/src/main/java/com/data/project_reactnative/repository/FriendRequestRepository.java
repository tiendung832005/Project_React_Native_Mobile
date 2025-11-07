package com.data.project_reactnative.repository;

import com.data.project_reactnative.model.FriendRequest;
import com.data.project_reactnative.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender.id = :senderId AND fr.receiver.id = :receiverId AND fr.status = 'PENDING'")
    Optional<FriendRequest> findPendingRequestBySenderAndReceiver(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiver.id = :userId AND fr.status = 'PENDING'")
    List<FriendRequest> findPendingRequestsByReceiverId(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(fr) > 0 THEN true ELSE false END FROM FriendRequest fr WHERE ((fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR (fr.sender.id = :userId2 AND fr.receiver.id = :userId1)) AND fr.status = 'PENDING'")
    boolean existsPendingRequestBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender.id = :userId AND fr.status = :status")
    List<FriendRequest> findBySenderIdAndStatus(@Param("userId") Long userId, @Param("status") FriendRequest.Status status);

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiver.id = :userId AND fr.status = :status")
    List<FriendRequest> findByReceiverIdAndStatus(@Param("userId") Long userId, @Param("status") FriendRequest.Status status);

    void deleteBySenderAndReceiver(User sender, User receiver);
}
