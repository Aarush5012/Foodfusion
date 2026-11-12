package com.foodfusion.service;

import com.foodfusion.dto.CartDtos.*;
import com.foodfusion.entity.Cart;
import com.foodfusion.entity.CartItem;
import com.foodfusion.entity.FoodItem;
import com.foodfusion.entity.User;
import com.foodfusion.exception.BadRequestException;
import com.foodfusion.exception.ResourceNotFoundException;
import com.foodfusion.repository.CartItemRepository;
import com.foodfusion.repository.CartRepository;
import com.foodfusion.repository.FoodItemRepository;
import com.foodfusion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");

    @Transactional
    public CartDto getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + request.getFoodItemId()));

        if (!foodItem.getIsAvailable()) {
            throw new BadRequestException("This item is currently unavailable.");
        }

        // Single Restaurant Cart Restriction
        if (cart.getRestaurant() != null && !cart.getItems().isEmpty()) {
            if (!cart.getRestaurant().getId().equals(foodItem.getRestaurant().getId())) {
                throw new BadRequestException("Your cart already contains items from " +
                        cart.getRestaurant().getName() + ". You can only order from one restaurant at a time. Clear your cart to add this item.");
            }
        } else {
            cart.setRestaurant(foodItem.getRestaurant());
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItem.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            if (request.getSpecialInstructions() != null) {
                item.setSpecialInstructions(request.getSpecialInstructions());
            }
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(cart, foodItem, request.getQuantity());
            newItem.setSpecialInstructions(request.getSpecialInstructions());
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToCartDto(savedCart);
    }

    @Transactional
    public CartDto updateItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user."));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart.");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            if (cart.getItems().isEmpty()) {
                cart.setRestaurant(null);
            }
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToCartDto(savedCart);
    }

    @Transactional
    public CartDto clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user."));

        cart.getItems().clear();
        cart.setRestaurant(null);
        Cart savedCart = cartRepository.save(cart);
        return mapToCartDto(savedCart);
    }

    private CartDto mapToCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());

        if (cart.getRestaurant() != null) {
            dto.setRestaurantId(cart.getRestaurant().getId());
            dto.setRestaurantName(cart.getRestaurant().getName());
            dto.setDeliveryFee(cart.getRestaurant().getDeliveryFee());
            dto.setMinOrderValue(cart.getRestaurant().getMinOrderValue());
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        dto.setItems(new ArrayList<>());

        for (CartItem item : cart.getItems()) {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setFoodItemId(item.getFoodItem().getId());
            itemDto.setName(item.getFoodItem().getName());
            itemDto.setDescription(item.getFoodItem().getDescription());
            itemDto.setPrice(item.getFoodItem().getPrice());
            itemDto.setImageUrl(item.getFoodItem().getImageUrl());
            itemDto.setIsVegetarian(item.getFoodItem().getIsVegetarian());
            itemDto.setQuantity(item.getQuantity());

            BigDecimal lineTotal = item.getFoodItem().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setLineTotal(lineTotal);
            itemDto.setSpecialInstructions(item.getSpecialInstructions());

            subtotal = subtotal.add(lineTotal);
            dto.getItems().add(itemDto);
        }

        dto.setSubtotal(subtotal);
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        dto.setTax(tax);

        BigDecimal deliveryFee = dto.getDeliveryFee() != null ? dto.getDeliveryFee() : BigDecimal.ZERO;
        dto.setGrandTotal(subtotal.add(tax).add(deliveryFee).setScale(2, RoundingMode.HALF_UP));

        return dto;
    }
}
