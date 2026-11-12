package com.foodfusion.repository;

import com.foodfusion.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByStatus(String status);
    List<Restaurant> findByOwnerId(Long ownerId);
    Optional<Restaurant> findByIdAndOwnerId(Long id, Long ownerId);
    Optional<Restaurant> findBySlug(String slug);

    @Query("SELECT r FROM Restaurant r WHERE r.status = 'ACTIVE' AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Restaurant> searchActiveRestaurants(@Param("keyword") String keyword);
}
