package com.foodfusion.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id")
    private FoodItem foodItem;

    @Column(name = "item_name_snapshot", nullable = false, length = 150)
    private String itemNameSnapshot;

    @Column(name = "unit_price_snapshot", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPriceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "total_price_snapshot", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPriceSnapshot;

    @Column(name = "special_instructions")
    private String specialInstructions;

    public OrderItem() {}

    public OrderItem(Order order, FoodItem foodItem, String itemNameSnapshot, BigDecimal unitPriceSnapshot, Integer quantity, String specialInstructions) {
        this.order = order;
        this.foodItem = foodItem;
        this.itemNameSnapshot = itemNameSnapshot;
        this.unitPriceSnapshot = unitPriceSnapshot;
        this.quantity = quantity;
        this.totalPriceSnapshot = unitPriceSnapshot.multiply(BigDecimal.valueOf(quantity));
        this.specialInstructions = specialInstructions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public FoodItem getFoodItem() { return foodItem; }
    public void setFoodItem(FoodItem foodItem) { this.foodItem = foodItem; }
    public String getItemNameSnapshot() { return itemNameSnapshot; }
    public void setItemNameSnapshot(String itemNameSnapshot) { this.itemNameSnapshot = itemNameSnapshot; }
    public BigDecimal getUnitPriceSnapshot() { return unitPriceSnapshot; }
    public void setUnitPriceSnapshot(BigDecimal unitPriceSnapshot) { this.unitPriceSnapshot = unitPriceSnapshot; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getTotalPriceSnapshot() { return totalPriceSnapshot; }
    public void setTotalPriceSnapshot(BigDecimal totalPriceSnapshot) { this.totalPriceSnapshot = totalPriceSnapshot; }
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
}
