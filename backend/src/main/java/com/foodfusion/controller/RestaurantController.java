package com.foodfusion.controller;

import com.foodfusion.entity.FoodCategory;
import com.foodfusion.entity.FoodItem;
import com.foodfusion.entity.Restaurant;
import com.foodfusion.exception.ResourceNotFoundException;
import com.foodfusion.repository.FoodCategoryRepository;
import com.foodfusion.repository.FoodItemRepository;
import com.foodfusion.repository.RestaurantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/restaurants")
@Tag(name = "Restaurants", description = "Public endpoints for restaurant browsing and menus")
public class RestaurantController {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodCategoryRepository categoryRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @GetMapping
    @Operation(summary = "Get all active restaurants with optional keyword filter")
    public ResponseEntity<List<Restaurant>> getAllActiveRestaurants(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(restaurantRepository.searchActiveRestaurants(search.trim()));
        }
        return ResponseEntity.ok(restaurantRepository.findByStatus("ACTIVE"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get restaurant profile by ID")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/{id}/menu")
    @Operation(summary = "Get full menu with categories and items for restaurant")
    public ResponseEntity<Map<String, Object>> getRestaurantMenu(@PathVariable Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        List<FoodCategory> categories = categoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(id);
        List<FoodItem> items = foodItemRepository.findByRestaurantIdAndIsAvailableTrue(id);

        Map<String, Object> response = new HashMap<>();
        response.put("restaurant", restaurant);
        response.put("categories", categories);
        response.put("items", items);

        return ResponseEntity.ok(response);
    }
}
