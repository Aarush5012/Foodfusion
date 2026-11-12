package com.foodfusion.service;

import com.foodfusion.dto.CouponDtos.CouponValidateRequest;
import com.foodfusion.dto.CouponDtos.CouponValidateResponse;
import com.foodfusion.entity.Coupon;
import com.foodfusion.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponValidateResponse validateCoupon(CouponValidateRequest request) {
        String code = request.getCode().trim();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElse(null);

        if (coupon == null) {
            return new CouponValidateResponse(false, code, null, BigDecimal.ZERO, "Invalid coupon code.");
        }

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            return new CouponValidateResponse(false, code, null, BigDecimal.ZERO, "This coupon is currently inactive.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getExpiryDate())) {
            return new CouponValidateResponse(false, code, null, BigDecimal.ZERO, "This coupon has expired.");
        }

        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            return new CouponValidateResponse(false, code, null, BigDecimal.ZERO, "Coupon usage limit reached.");
        }

        if (coupon.getRestaurant() != null && request.getRestaurantId() != null) {
            if (!coupon.getRestaurant().getId().equals(request.getRestaurantId())) {
                return new CouponValidateResponse(false, code, null, BigDecimal.ZERO, "This coupon is only valid for " + coupon.getRestaurant().getName() + ".");
            }
        }

        BigDecimal subtotal = request.getSubtotal();
        if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new CouponValidateResponse(false, code, null, BigDecimal.ZERO,
                    "Minimum order of $" + coupon.getMinOrderAmount() + " required to use this coupon.");
        }

        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        // Discount cannot exceed subtotal
        discount = discount.min(subtotal);

        return new CouponValidateResponse(true, coupon.getCode(), coupon.getDescription(), discount, "Coupon applied successfully!");
    }
}
