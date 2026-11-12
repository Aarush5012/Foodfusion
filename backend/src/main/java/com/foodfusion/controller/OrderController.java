package com.foodfusion.controller;

import com.foodfusion.dto.OrderDtos.*;
import com.foodfusion.security.UserDetailsImpl;
import com.foodfusion.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Endpoints for placing, tracking, and managing orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    @Operation(summary = "Place order from current cart")
    public ResponseEntity<OrderDto> placeOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                               @Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromCart(userDetails.getId(), request));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get list of orders placed by authenticated customer")
    public ResponseEntity<List<OrderDto>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getCustomerOrders(userDetails.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed order information and snapshot items")
    public ResponseEntity<OrderDto> getOrderById(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                 @PathVariable Long id) {
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrderById(id, userDetails.getId(), isAdmin));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Customer order cancellation (allowed if order is PLACED or CONFIRMED)")
    public ResponseEntity<OrderDto> cancelOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status (Owner only)")
    public ResponseEntity<OrderDto> updateOrderStatus(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                      @PathVariable Long id,
                                                      @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, userDetails.getId(), request));
    }
}
