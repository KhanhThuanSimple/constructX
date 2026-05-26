package com.constructx.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_milestones")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_plan_id", nullable = false)
    private WorkPlan workPlan;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long amount;

    private Integer stepOrder;

    private Integer progressPercent;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.IN_PROGRESS;

    @OneToMany(
            mappedBy = "milestone",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<MilestoneUpdate> updates = new ArrayList<>();

    public enum Status {

        PENDING,

        IN_PROGRESS,

        WAITING_CONFIRMATION,

        COMPLETED,

        REJECTED
    }
}