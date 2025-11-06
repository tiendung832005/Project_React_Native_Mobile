package com.data.project_reactnative.service;

import com.data.project_reactnative.dto.FriendDTO;
import com.data.project_reactnative.dto.FriendRequestDTO;
import com.data.project_reactnative.dto.UserBasicDTO;
import com.data.project_reactnative.model.*;
import com.data.project_reactnative.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private BlockedUserRepository blockedUserRepository;

    // Tìm kiếm người dùng theo số điện thoại
    public UserBasicDTO searchUserByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với số điện thoại này"));

        return convertToUserBasicDTO(user);
    }

    // Gửi lời mời kết bạn
    @Transactional
    public FriendRequestDTO sendFriendRequest(Long senderId, Long receiverId) {
        // Kiểm tra người gửi và người nhận có tồn tại không
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Người gửi không tồn tại"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Người nhận không tồn tại"));

        // Kiểm tra không thể gửi lời mời cho chính mình
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Không thể gửi lời mời kết bạn cho chính mình");
        }

        // Kiểm tra đã bị chặn chưa
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(receiverId, senderId) ||
            blockedUserRepository.existsByBlockerIdAndBlockedId(senderId, receiverId)) {
            throw new RuntimeException("Không thể gửi lời mời kết bạn");
        }

        // Kiểm tra đã là bạn bè chưa
        if (friendshipRepository.existsByUserIdAndFriendId(senderId, receiverId)) {
            throw new RuntimeException("Đã là bạn bè");
        }

        // Kiểm tra đã có lời mời chờ xử lý chưa
        if (friendRequestRepository.existsPendingRequestBetweenUsers(senderId, receiverId)) {
            throw new RuntimeException("Đã có lời mời kết bạn đang chờ xử lý");
        }

        // Tạo lời mời kết bạn mới
        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setSender(sender);
        friendRequest.setReceiver(receiver);
        friendRequest.setStatus(FriendRequest.Status.PENDING);

        FriendRequest savedRequest = friendRequestRepository.save(friendRequest);

        return convertToFriendRequestDTO(savedRequest);
    }

    // Chấp nhận lời mời kết bạn
    @Transactional
    public String acceptFriendRequest(Long requestId, Long userId) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Lời mời kết bạn không tồn tại"));

        // Kiểm tra người dùng có phải là người nhận không
        if (!friendRequest.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chấp nhận lời mời này");
        }

        // Kiểm tra trạng thái lời mời
        if (friendRequest.getStatus() != FriendRequest.Status.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý");
        }

        // Tạo mối quan hệ bạn bè (2 chiều)
        Friendship friendship1 = new Friendship();
        friendship1.setUser(friendRequest.getSender());
        friendship1.setFriend(friendRequest.getReceiver());

        Friendship friendship2 = new Friendship();
        friendship2.setUser(friendRequest.getReceiver());
        friendship2.setFriend(friendRequest.getSender());

        friendshipRepository.save(friendship1);
        friendshipRepository.save(friendship2);

        // Cập nhật trạng thái lời mời
        friendRequest.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(friendRequest);

        return "Đã chấp nhận lời mời kết bạn";
    }

    // Từ chối lời mời kết bạn
    @Transactional
    public String rejectFriendRequest(Long requestId, Long userId) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Lời mời kết bạn không tồn tại"));

        // Kiểm tra người dùng có phải là người nhận không
        if (!friendRequest.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền từ chối lời mời này");
        }

        // Kiểm tra trạng thái lời mời
        if (friendRequest.getStatus() != FriendRequest.Status.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý");
        }

        // Cập nhật trạng thái và xóa
        friendRequest.setStatus(FriendRequest.Status.REJECTED);
        friendRequestRepository.save(friendRequest);
        friendRequestRepository.delete(friendRequest);

        return "Đã từ chối lời mời kết bạn";
    }

    // Hủy kết bạn
    @Transactional
    public String unfriend(Long userId, Long friendId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("Bạn bè không tồn tại"));

        // Kiểm tra có phải bạn bè không
        if (!friendshipRepository.existsByUserIdAndFriendId(userId, friendId)) {
            throw new RuntimeException("Không phải bạn bè");
        }

        // Xóa mối quan hệ bạn bè (2 chiều)
        friendshipRepository.deleteByUserAndFriend(user, friend);
        friendshipRepository.deleteByUserAndFriend(friend, user);

        return "Đã hủy kết bạn";
    }

    // Lấy danh sách lời mời kết bạn
    public List<FriendRequestDTO> getFriendRequests(Long userId) {
        List<FriendRequest> requests = friendRequestRepository.findPendingRequestsByReceiverId(userId);

        return requests.stream()
                .map(this::convertToFriendRequestDTO)
                .collect(Collectors.toList());
    }

    // Lấy danh sách bạn bè
    public List<FriendDTO> getFriends(Long userId) {
        List<Friendship> friendships = friendshipRepository.findAllByUserId(userId);

        return friendships.stream()
                .map(friendship -> {
                    User friend = friendship.getFriend();
                    return new FriendDTO(
                            friend.getId(),
                            friend.getUsername(),
                            friend.getEmail(),
                            friend.getPhone(),
                            friend.getAvatarUrl(),
                            friend.getBio(),
                            friendship.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    // Chặn người dùng
    @Transactional
    public String blockUser(Long blockerId, Long blockedId) {
        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new RuntimeException("Người bị chặn không tồn tại"));

        // Kiểm tra không thể chặn chính mình
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Không thể chặn chính mình");
        }

        // Kiểm tra đã chặn chưa
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new RuntimeException("Đã chặn người dùng này");
        }

        // Nếu là bạn bè thì hủy kết bạn trước
        if (friendshipRepository.existsByUserIdAndFriendId(blockerId, blockedId)) {
            friendshipRepository.deleteByUserAndFriend(blocker, blocked);
            friendshipRepository.deleteByUserAndFriend(blocked, blocker);
        }

        // Xóa các lời mời kết bạn đang chờ
        friendRequestRepository.findPendingRequestBySenderAndReceiver(blockerId, blockedId)
                .ifPresent(friendRequestRepository::delete);
        friendRequestRepository.findPendingRequestBySenderAndReceiver(blockedId, blockerId)
                .ifPresent(friendRequestRepository::delete);

        // Tạo bản ghi chặn
        BlockedUser blockedUser = new BlockedUser();
        blockedUser.setBlocker(blocker);
        blockedUser.setBlocked(blocked);
        blockedUserRepository.save(blockedUser);

        return "Đã chặn người dùng";
    }

    // Bỏ chặn người dùng
    @Transactional
    public String unblockUser(Long blockerId, Long blockedId) {
        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new RuntimeException("Người bị chặn không tồn tại"));

        // Kiểm tra đã chặn chưa
        if (!blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new RuntimeException("Chưa chặn người dùng này");
        }

        // Xóa bản ghi chặn
        blockedUserRepository.deleteByBlockerAndBlocked(blocker, blocked);

        return "Đã bỏ chặn người dùng";
    }

    // Helper methods
    private UserBasicDTO convertToUserBasicDTO(User user) {
        return new UserBasicDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getBio()
        );
    }

    private FriendRequestDTO convertToFriendRequestDTO(FriendRequest request) {
        return new FriendRequestDTO(
                request.getId(),
                convertToUserBasicDTO(request.getSender()),
                convertToUserBasicDTO(request.getReceiver()),
                request.getStatus().toString(),
                request.getCreatedAt()
        );
    }
}

