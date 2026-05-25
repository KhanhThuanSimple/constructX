package com.constructx.backend.service;

import com.constructx.backend.entity.Notification;
import com.constructx.backend.entity.User;
import com.constructx.backend.repository.NotificationRepository;
import com.constructx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAllRead() {
        User user = getCurrentUser();
        notificationRepository.markAllReadByUserId(user.getId());
    }

    @Transactional
    public void createNotification(User user, Notification.NotifType type, String content) {
        if (user == null || content == null || content.isBlank()) {
            return;
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(type == null ? Notification.NotifType.SYSTEM : type)
                .content(content.trim())
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public void createNotificationForAdmins(Notification.NotifType type, String content) {
        if (content == null || content.isBlank()) {
            return;
        }

        List<User> admins = userRepository.findByRole(User.Role.ADMIN);

        for (User admin : admins) {
            if (admin.isActive()) {
                createNotification(admin, type, content);
            }
        }
    }
}