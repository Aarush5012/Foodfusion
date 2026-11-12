package com.foodfusion.controller;

import com.foodfusion.entity.*;
import com.foodfusion.exception.ResourceNotFoundException;
import com.foodfusion.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Platform Administrator", description = "Endpoints restricted to platform administrators")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide executive metrics")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> response = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalRestaurants = restaurantRepository.count();
        long activeRestaurants = restaurantRepository.findByStatus("ACTIVE").size();
        long pendingRestaurants = restaurantRepository.findByStatus("PENDING_APPROVAL").size();
        long totalOrders = orderRepository.count();
        BigDecimal totalGmv = orderRepository.calculatePlatformTotalRevenue();
        if (totalGmv == null) totalGmv = BigDecimal.ZERO;

        response.put("totalUsers", totalUsers);
        response.put("totalRestaurants", totalRestaurants);
        response.put("activeRestaurants", activeRestaurants);
        response.put("pendingRestaurants", pendingRestaurants);
        response.put("totalOrders", totalOrders);
        response.put("totalGmv", totalGmv);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users on the platform")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Suspend or reactivate user account")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setStatus(status.toUpperCase());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/restaurants")
    @Operation(summary = "Get all restaurants across all statuses")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @PatchMapping("/restaurants/{id}/status")
    @Operation(summary = "Approve, suspend, or reject restaurant listing")
    public ResponseEntity<Restaurant> updateRestaurantStatus(@PathVariable Long id, @RequestParam String status) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + id));
        restaurant.setStatus(status.toUpperCase());
        if ("ACTIVE".equalsIgnoreCase(status)) {
            restaurant.setIsOpen(true);
        }
        return ResponseEntity.ok(restaurantRepository.save(restaurant));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all platform orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/reports/export-csv")
    @Operation(summary = "Export platform order transactions to CSV")
    public void exportOrdersToCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"foodfusion_orders_report.csv\"");

        List<Order> orders = orderRepository.findAll();
        PrintWriter writer = response.getWriter();

        writer.println("Order Number,Date,Restaurant,Customer,Delivery Fee,Tax,Subtotal,Total Amount,Status,Payment Method");

        for (Order o : orders) {
            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f,%.2f,\"%s\",\"%s\"%n",
                    o.getOrderNumber(),
                    o.getPlacedAt(),
                    o.getRestaurant().getName().replace("\"", "\"\""),
                    o.getUser().getName().replace("\"", "\"\""),
                    o.getDeliveryFee(),
                    o.getTaxAmount(),
                    o.getSubtotal(),
                    o.getTotalAmount(),
                    o.getStatus(),
                    o.getPaymentMethod());
        }

        writer.flush();
    }
}
