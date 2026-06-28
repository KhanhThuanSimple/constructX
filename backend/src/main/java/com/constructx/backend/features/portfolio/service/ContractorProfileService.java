package com.constructx.backend.features.portfolio.service;

import com.constructx.backend.features.portfolio.dto.ContractorProfileRequest;
import com.constructx.backend.features.portfolio.dto.ContractorProfileResponse;
import com.constructx.backend.features.portfolio.entity.ContractorProfile;
import com.constructx.backend.features.portfolio.repository.ContractorProfileRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContractorProfileService {

    private final ContractorProfileRepository contractorProfileRepository;
    private final UserRepository userRepository;

    public ContractorProfileResponse getMyProfile() {
        User me = getCurrentUser();
        if (me.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Chỉ nhà thầu mới có hồ sơ năng lực");
        }
        ContractorProfile profile = contractorProfileRepository.findById(me.getId())
                .orElseGet(() -> createDefaultProfile(me));
        return toResponse(profile);
    }

    public ContractorProfileResponse getProfileByContractorId(Long contractorId) {
        User user = userRepository.findById(contractorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà thầu"));
        if (user.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Người dùng này không phải là nhà thầu");
        }
        ContractorProfile profile = contractorProfileRepository.findById(contractorId)
                .orElseGet(() -> createDefaultProfile(user));
        return toResponse(profile);
    }

    @Transactional
    public ContractorProfileResponse updateMyProfile(ContractorProfileRequest request) {
        User me = getCurrentUser();
        if (me.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Chỉ nhà thầu mới có quyền cập nhật hồ sơ");
        }

        ContractorProfile profile = contractorProfileRepository.findById(me.getId())
                .orElseGet(() -> {
                    ContractorProfile newP = new ContractorProfile();
                    newP.setId(me.getId());
                    newP.setUser(me);
                    return newP;
                });

        profile.setCompanyName(request.getCompanyName());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setAvatarUrl(request.getAvatarUrl());
        profile.setYearEstablished(request.getYearEstablished());
        profile.setAddress(request.getAddress());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setEmail(request.getEmail());
        profile.setShortIntro(request.getShortIntro());

        profile.setDesignInterior(request.isDesignInterior());
        profile.setConstructInterior(request.isConstructInterior());
        profile.setProduceWood(request.isProduceWood());
        profile.setRenovateHouse(request.isRenovateHouse());

        profile.setExperienceYears(request.getExperienceYears());
        profile.setCompletedProjectsCount(request.getCompletedProjectsCount());
        profile.setRating(request.getRating() != null ? request.getRating() : 5.0);
        profile.setCustomerCount(request.getCustomerCount() != null ? request.getCustomerCount() : "0+");

        profile.setWarranty24Months(request.isWarranty24Months());
        profile.setFreeQuote(request.isFreeQuote());
        profile.setOnTimeProgress(request.isOnTimeProgress());

        // Sync basic info back to User if needed
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            me.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            me.setFullName(request.getCompanyName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            me.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            me.setAddress(request.getAddress());
        }
        userRepository.save(me);

        return toResponse(contractorProfileRepository.save(profile));
    }

    private ContractorProfile createDefaultProfile(User user) {
        ContractorProfile profile = ContractorProfile.builder()
                .id(user.getId())
                .user(user)
                .companyName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .logoUrl("")
                .address(user.getAddress())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .shortIntro("")
                .designInterior(true)
                .constructInterior(true)
                .experienceYears(1)
                .completedProjectsCount(0)
                .rating(5.0)
                .customerCount("0+")
                .build();
        return contractorProfileRepository.save(profile);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ContractorProfileResponse toResponse(ContractorProfile profile) {
        return ContractorProfileResponse.builder()
                .id(profile.getId())
                .companyName(profile.getCompanyName())
                .logoUrl(profile.getLogoUrl())
                .avatarUrl(profile.getAvatarUrl())
                .yearEstablished(profile.getYearEstablished())
                .address(profile.getAddress())
                .phoneNumber(profile.getPhoneNumber())
                .email(profile.getEmail())
                .shortIntro(profile.getShortIntro())
                .designInterior(profile.isDesignInterior())
                .constructInterior(profile.isConstructInterior())
                .produceWood(profile.isProduceWood())
                .renovateHouse(profile.isRenovateHouse())
                .experienceYears(profile.getExperienceYears())
                .completedProjectsCount(profile.getCompletedProjectsCount())
                .rating(profile.getRating())
                .customerCount(profile.getCustomerCount())
                .warranty24Months(profile.isWarranty24Months())
                .freeQuote(profile.isFreeQuote())
                .onTimeProgress(profile.isOnTimeProgress())
                .approvalStatus(
                        (profile.getUser() != null && profile.getUser().getApprovalStatus() != null)
                                ? profile.getUser().getApprovalStatus().name()
                                : "APPROVED"
                )
                .build();
    }
}
