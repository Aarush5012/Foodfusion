package com.foodfusion.repository;

import com.foodfusion.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantIdAndIsApprovedTrueOrderByCreatedAtDesc(Long restaurantId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Review> findByOrderId(Long orderId);
    List<Review> findByIsModeratedFalse();
}
