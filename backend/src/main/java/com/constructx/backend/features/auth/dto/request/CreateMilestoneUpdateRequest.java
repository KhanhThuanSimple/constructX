package com.constructx.backend.features.constructor.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMilestoneUpdateRequest {

    private String title;

    private String content;

    private String imageUrl;
}