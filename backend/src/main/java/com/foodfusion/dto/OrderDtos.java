package com.foodfusion.dto;

import com.foodfusion.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDtos {

    public static class OrderCreateRequest {
        @NotNull(message = "Restaurant ID is required")
        private Long restaurantId;

        private Long addressId;
        private String deliveryStreetAddress;
        private String deliveryCity;
        private String deliveryState;
        private String deliveryPostalCode;
        private String couponCode;
        private String paymentMethod = "CASH_ON_DELIVERY"; // CASH_ON_DELIVERY or CARD_PAYMENT_SIMULATED
        private String orderNotes;

        public Long getRestaurantId() { return restaurantId; }
        public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
        public Long getAddressId() { return addressId; }
        public void setAddressId(Long addressId) { this.addressId = addressId; }
        public String getDeliveryStreetAddress() { return deliveryStreetAddress; }
        public void setDeliveryStreetAddress(String deliveryStreetAddress) { this.deliveryStreetAddress = deliveryStreetAddress; }
        public String getDeliveryCity() { return deliveryCity; }
        public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }
        public String getDeliveryState() { return deliveryState; }
        public void setDeliveryState(String deliveryState) { this.deliveryState = deliveryState; }
        public String getDeliveryPostalCode() { return deliveryPostalCode; }
        public void setDeliveryPostalCode(String deliveryPostalCode) { this.deliveryPostalCode = deliveryPostalCode; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getOrderNotes() { return orderNotes; }
        public void setOrderNotes(String orderNotes) { this.orderNotes = orderNotes; }
    }

    public static class OrderStatusUpdateRequest {
        @NotNull(message = "Order status is required")
        private OrderStatus status;
        private String rejectionReason;

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    }

    public static class OrderItemDto {
        private Long id;
        private Long foodItemId;
        private String itemName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String specialInstructions;

        public OrderItemDto(Long id, Long foodItemId, String itemName, BigDecimal unitPrice, Integer quantity, BigDecimal totalPrice, String specialInstructions) {
            this.id = id;
            this.foodItemId = foodItemId;
            this.itemName = itemName;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
            this.totalPrice = totalPrice;
            this.specialInstructions = specialInstructions;
        }

        public Long getId() { return id; }
        public Long getFoodItemId() { return foodItemId; }
        public String getItemName() { return itemName; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public Integer getQuantity() { return quantity; }
        public BigDecimal getTotalPrice() { return totalPrice; }
        public String getSpecialInstructions() { return specialInstructions; }
    }

    public static class OrderDto {
        private Long id;
        private String orderNumber;
        private Long restaurantId;
        private String restaurantName;
        private String restaurantCoverImage;
        private Long userId;
        private String customerName;
        private String deliveryAddress;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal deliveryFee;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String couponCode;
        private OrderStatus status;
        private String paymentMethod;
        private String paymentStatus;
        private String orderNotes;
        private String rejectionReason;
        private LocalDateTime placedAt;
        private List<OrderItemDto> items;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
        public Long getRestaurantId() { return restaurantId; }
        public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
        public String getRestaurantName() { return restaurantName; }
        public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
        public String getRestaurantCoverImage() { return restaurantCoverImage; }
        public void setRestaurantCoverImage(String restaurantCoverImage) { this.restaurantCoverImage = restaurantCoverImage; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getOrderNotes() { return orderNotes; }
        public void setOrderNotes(String orderNotes) { this.orderNotes = orderNotes; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
        public LocalDateTime getPlacedAt() { return placedAt; }
        public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }
        public List<OrderItemDto> getItems() { return items; }
        public void setItems(List<OrderItemDto> items) { this.items = items; }
    }
}
