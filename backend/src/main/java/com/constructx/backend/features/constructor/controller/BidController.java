package com.constructx.backend.features.constructor.controller;

import com.constructx.backend.features.constructor.dto.request.CreateBidRequest;
import com.constructx.backend.features.constructor.dto.BidResponse;
import com.constructx.backend.features.constructor.service.BidService;
import com.constructx.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    // contractor báo giá
    @PostMapping
    public ApiResponse<BidResponse> createBid(@Valid @RequestBody CreateBidRequest request) {
        return ApiResponse.ok(
                "Bid created successfully",
                bidService.createBid(request)
        );
    }


    // contractor xem bid của mình
    @GetMapping("/my")
    public ApiResponse<List<BidResponse>> getMyBids() {
        return ApiResponse.ok(
                bidService.getMyBids()
        );
    }
}