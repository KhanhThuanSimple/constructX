package com.constructx.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkPlanRequest {

    @Size(max = 2000, message = "Ghi chú tối đa 2000 ký tự")
    private String note;

    @Valid
    @NotEmpty(message = "Kế hoạch phải có milestone")
    private List<MilestoneRequest> milestones;
}