package com.foodfusion.controller;

import com.foodfusion.dto.CouponDtos.CouponValidateRequest;
import com.foodfusion.dto.CouponDtos.CouponValidateResponse;
import com.foodfusion.entity.Coupon;
import com.foodfusion.repository.CouponRepository;
import com.foodfusion.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/coupons")
@Tag(name = "Coupons", description = "Coupon validation and listing")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CouponRepository couponRepository;

    @PostMapping("/validate")
    @Operation(summary = "Validate coupon code and compute discount")
    public ResponseEntity<CouponValidateResponse> validateCoupon(@Valid @RequestBody CouponValidateRequest request) {
        return ResponseEntity.ok(couponService.validateCoupon(request));
    }

    @GetMapping("/active")
    @Operation(summary = "Get list of active public promotional coupons")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponRepository.findByIsActiveTrue());
    }
}
