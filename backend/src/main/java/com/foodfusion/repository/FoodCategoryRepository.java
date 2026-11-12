package com.foodfusion.repository;

import com.foodfusion.entity.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Long> {
    List<FoodCategory> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
}
