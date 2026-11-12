package com.foodfusion.repository;

import com.foodfusion.entity.Order;
import com.foodfusion.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByPlacedAtDesc(Long userId);
    List<Order> findByRestaurantIdOrderByPlacedAtDesc(Long restaurantId);
    List<Order> findByRestaurantIdAndStatus(Long restaurantId, OrderStatus status);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    Optional<Order> findByIdAndRestaurantOwnerId(Long id, Long ownerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculatePlatformTotalRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'DELIVERED'")
    BigDecimal calculateRestaurantTotalRevenue(Long restaurantId);
}
