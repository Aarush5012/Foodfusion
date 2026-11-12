package com.foodfusion.controller;

import com.foodfusion.entity.*;
import com.foodfusion.exception.ResourceNotFoundException;
import com.foodfusion.exception.UnauthorizedException;
import com.foodfusion.repository.*;
import com.foodfusion.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
@Tag(name = "Restaurant Owner", description = "Endpoints restricted to authenticated restaurant owners")
public class OwnerController {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private FoodCategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get overview metrics for owner's restaurants")
    public ResponseEntity<Map<String, Object>> getOwnerDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(userDetails.getId());
        Map<String, Object> response = new HashMap<>();

        if (restaurants.isEmpty()) {
            response.put("hasRestaurant", false);
            return ResponseEntity.ok(response);
        }

        Restaurant primary = restaurants.get(0);
        List<Order> orders = orderRepository.findByRestaurantIdOrderByPlacedAtDesc(primary.getId());

        long pendingCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.PLACED || o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.PREPARING).count();
        long completedCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();

        BigDecimal revenue = orderRepository.calculateRestaurantTotalRevenue(primary.getId());
        if (revenue == null) revenue = BigDecimal.ZERO;

        response.put("hasRestaurant", true);
        response.put("restaurant", primary);
        response.put("totalOrders", orders.size());
        response.put("pendingOrders", pendingCount);
        response.put("completedOrders", completedCount);
        response.put("totalRevenue", revenue);
        response.put("recentOrders", orders.stream().limit(5).toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/restaurants")
    @Operation(summary = "Get all restaurants owned by authenticated owner")
    public ResponseEntity<List<Restaurant>> getMyRestaurants(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(restaurantRepository.findByOwnerId(userDetails.getId()));
    }

    @PutMapping("/restaurants/{id}")
    @Operation(summary = "Update restaurant details with owner authorization check")
    public ResponseEntity<Restaurant> updateRestaurant(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                       @PathVariable Long id,
                                                       @RequestBody Restaurant update) {
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerId(id, userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("You do not own this restaurant."));

        restaurant.setName(update.getName());
        restaurant.setDescription(update.getDescription());
        restaurant.setCuisine(update.getCuisine());
        restaurant.setPhone(update.getPhone());
        restaurant.setAddress(update.getAddress());
        restaurant.setCity(update.getCity());
        restaurant.setDeliveryFee(update.getDeliveryFee());
        restaurant.setMinOrderValue(update.getMinOrderValue());
        restaurant.setIsOpen(update.getIsOpen());
        if (update.getCoverImage() != null) restaurant.setCoverImage(update.getCoverImage());

        return ResponseEntity.ok(restaurantRepository.save(restaurant));
    }

    @GetMapping("/menu/{restaurantId}")
    @Operation(summary = "Get menu items with owner authorization check")
    public ResponseEntity<List<FoodItem>> getRestaurantMenuItems(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                 @PathVariable Long restaurantId) {
        restaurantRepository.findByIdAndOwnerId(restaurantId, userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized access to restaurant menu."));

        return ResponseEntity.ok(foodItemRepository.findByRestaurantId(restaurantId));
    }

    @PostMapping("/menu/{restaurantId}")
    @Operation(summary = "Create food item under owned restaurant")
    public ResponseEntity<FoodItem> createFoodItem(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                   @PathVariable Long restaurantId,
                                                   @RequestBody FoodItem foodItem) {
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerId(restaurantId, userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized access to restaurant."));

        foodItem.setRestaurant(restaurant);
        return ResponseEntity.ok(foodItemRepository.save(foodItem));
    }

    @DeleteMapping("/menu/{restaurantId}/{itemId}")
    @Operation(summary = "Delete food item from owned restaurant")
    public ResponseEntity<Map<String, Object>> deleteFoodItem(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                              @PathVariable Long restaurantId,
                                                              @PathVariable Long itemId) {
        restaurantRepository.findByIdAndOwnerId(restaurantId, userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized access."));

        FoodItem item = foodItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found."));

        if (!item.getRestaurant().getId().equals(restaurantId)) {
            throw new UnauthorizedException("Item does not belong to specified restaurant.");
        }

        foodItemRepository.delete(item);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Item deleted successfully.");
        return ResponseEntity.ok(res);
    }
}
