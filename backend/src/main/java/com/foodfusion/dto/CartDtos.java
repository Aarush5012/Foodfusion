package com.foodfusion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartDtos {

    public static class AddToCartRequest {
        @NotNull(message = "Food item ID is required")
        private Long foodItemId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        private String specialInstructions;

        public Long getFoodItemId() { return foodItemId; }
        public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    }

    public static class UpdateCartItemRequest {
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity;

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class CartItemDto {
        private Long id;
        private Long foodItemId;
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private Boolean isVegetarian;
        private Integer quantity;
        private BigDecimal lineTotal;
        private String specialInstructions;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getFoodItemId() { return foodItemId; }
        public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Boolean getIsVegetarian() { return isVegetarian; }
        public void setIsVegetarian(Boolean isVegetarian) { this.isVegetarian = isVegetarian; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getLineTotal() { return lineTotal; }
        public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    }

    public static class CartDto {
        private Long id;
        private Long restaurantId;
        private String restaurantName;
        private BigDecimal deliveryFee = BigDecimal.ZERO;
        private BigDecimal minOrderValue = BigDecimal.ZERO;
        private List<CartItemDto> items = new ArrayList<>();
        private BigDecimal subtotal = BigDecimal.ZERO;
        private BigDecimal tax = BigDecimal.ZERO;
        private BigDecimal grandTotal = BigDecimal.ZERO;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getRestaurantId() { return restaurantId; }
        public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
        public String getRestaurantName() { return restaurantName; }
        public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
        public BigDecimal getMinOrderValue() { return minOrderValue; }
        public void setMinOrderValue(BigDecimal minOrderValue) { this.minOrderValue = minOrderValue; }
        public List<CartItemDto> getItems() { return items; }
        public void setItems(List<CartItemDto> items) { this.items = items; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public BigDecimal getTax() { return tax; }
        public void setTax(BigDecimal tax) { this.tax = tax; }
        public BigDecimal getGrandTotal() { return grandTotal; }
        public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    }
}
