package com.constructx.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "milestone_updates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    private WorkMilestone milestone;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String imageUrl;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}