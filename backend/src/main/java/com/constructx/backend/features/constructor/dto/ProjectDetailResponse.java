package com.constructx.backend.features.constructor.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDetailResponse {

    private ProjectResponse project;

    private List<BidResponse> bids;
}