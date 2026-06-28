package com.constructx.backend.features.portfolio.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "contractor_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractorProfile implements Persistable<Long> {

    @Id
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "year_established")
    private Integer yearEstablished;

    private String address;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    private String email;

    @Column(name = "short_intro", length = 1000)
    private String shortIntro;

    @Column(name = "design_interior")
    @Builder.Default
    private boolean designInterior = false;

    @Column(name = "construct_interior")
    @Builder.Default
    private boolean constructInterior = false;

    @Column(name = "produce_wood")
    @Builder.Default
    private boolean produceWood = false;

    @Column(name = "renovate_house")
    @Builder.Default
    private boolean renovateHouse = false;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @Column(name = "completed_projects_count")
    @Builder.Default
    private Integer completedProjectsCount = 0;

    @Builder.Default
    private Double rating = 5.0;

    @Column(name = "customer_count", length = 50)
    @Builder.Default
    private String customerCount = "0+";

    @Column(name = "warranty_24_months")
    @Builder.Default
    private boolean warranty24Months = false;

    @Column(name = "free_quote")
    @Builder.Default
    private boolean freeQuote = false;

    @Column(name = "on_time_progress")
    @Builder.Default
    private boolean onTimeProgress = false;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}
