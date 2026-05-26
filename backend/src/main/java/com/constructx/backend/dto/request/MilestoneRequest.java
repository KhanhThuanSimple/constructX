package com.constructx.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneRequest {

    @NotBlank(message = "Tên milestone không được để trống")
    @Size(max = 200, message = "Tên milestone tối đa 200 ký tự")
    private String title;

    @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
    private String description;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private Long amount;

    @NotNull(message = "Phần trăm tiến độ không được để trống")
    @Min(value = 1, message = "Tiến độ tối thiểu là 1%")
    @Max(value = 100, message = "Tiến độ tối đa là 100%")
    private Integer progressPercent;

    @NotNull(message = "Deadline không được để trống")
    @Future(message = "Deadline phải là ngày trong tương lai")
    private LocalDate deadline;
}