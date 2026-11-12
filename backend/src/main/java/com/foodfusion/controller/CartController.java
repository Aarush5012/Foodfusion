package com.foodfusion.controller;

import com.foodfusion.dto.CartDtos.*;
import com.foodfusion.security.UserDetailsImpl;
import com.foodfusion.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
@Tag(name = "Shopping Cart", description = "Endpoints for managing persistent customer cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    @Operation(summary = "Get user's current persistent shopping cart")
    public ResponseEntity<CartDto> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.getOrCreateCart(userDetails.getId()));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the shopping cart")
    public ResponseEntity<CartDto> addToCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getId(), request));
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update line item quantity or delete if 0")
    public ResponseEntity<CartDto> updateCartItem(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userDetails.getId(), id, request.getQuantity()));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from the cart")
    public ResponseEntity<CartDto> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.clearCart(userDetails.getId()));
    }
}
