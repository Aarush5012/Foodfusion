package com.foodfusion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CouponDtos {

    public static class CouponValidateRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        @NotNull(message = "Subtotal is required")
        private BigDecimal subtotal;

        private Long restaurantId;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public Long getRestaurantId() { return restaurantId; }
        public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
    }

    public static class CouponValidateResponse {
        private boolean valid;
        private String code;
        private String description;
        private BigDecimal discountAmount;
        private String message;

        public CouponValidateResponse(boolean valid, String code, String description, BigDecimal discountAmount, String message) {
            this.valid = valid;
            this.code = code;
            this.description = description;
            this.discountAmount = discountAmount;
            this.message = message;
        }

        public boolean isValid() { return valid; }
        public String getCode() { return code; }
        public String getDescription() { return description; }
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public String getMessage() { return message; }
    }
}
