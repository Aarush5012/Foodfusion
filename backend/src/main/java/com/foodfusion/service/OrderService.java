package com.foodfusion.service;

import com.foodfusion.dto.OrderDtos.*;
import com.foodfusion.entity.*;
import com.foodfusion.exception.BadRequestException;
import com.foodfusion.exception.ResourceNotFoundException;
import com.foodfusion.exception.UnauthorizedException;
import com.foodfusion.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CouponRepository couponRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08"); // 8% sales tax

    @Transactional
    public OrderDto createOrderFromCart(Long userId, OrderCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Active cart not found for user."));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create order from an empty cart.");
        }

        Restaurant restaurant = cart.getRestaurant();
        if (restaurant == null) {
            restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found."));
        }

        // Calculate authoritative subtotal from database items
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal lineTotal = item.getFoodItem().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
        }

        // Check minimum order value
        if (subtotal.compareTo(restaurant.getMinOrderValue()) < 0) {
            throw new BadRequestException("Minimum order value for " + restaurant.getName() + " is $" + restaurant.getMinOrderValue());
        }

        // Validate coupon if applied
        BigDecimal discount = BigDecimal.ZERO;
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            coupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim())
                    .orElse(null);

            if (coupon != null && coupon.getIsActive()) {
                if (coupon.getRestaurant() == null || coupon.getRestaurant().getId().equals(restaurant.getId())) {
                    if (subtotal.compareTo(coupon.getMinOrderAmount()) >= 0) {
                        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                            discount = subtotal.multiply(coupon.getDiscountValue())
                                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                                discount = coupon.getMaxDiscountAmount();
                            }
                        } else {
                            discount = coupon.getDiscountValue();
                        }
                    }
                }
            }
        }

        BigDecimal deliveryFee = restaurant.getDeliveryFee();
        BigDecimal taxableAmount = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = taxableAmount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxableAmount.add(deliveryFee).add(tax).setScale(2, RoundingMode.HALF_UP);

        // Resolve delivery address
        String street = request.getDeliveryStreetAddress();
        String city = request.getDeliveryCity();
        String state = request.getDeliveryState();
        String postal = request.getDeliveryPostalCode();

        if (request.getAddressId() != null) {
            Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                    .orElse(null);
            if (address != null) {
                street = address.getStreetAddress() + (address.getApartmentSuite() != null ? ", " + address.getApartmentSuite() : "");
                city = address.getCity();
                state = address.getState();
                postal = address.getPostalCode();
            }
        }

        if (street == null || street.trim().isEmpty()) {
            street = "Default delivery location";
            city = "San Francisco";
            state = "CA";
            postal = "94107";
        }

        Order order = new Order();
        order.setOrderNumber("FF-" + System.currentTimeMillis() % 1000000);
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setDeliveryStreetAddress(street);
        order.setDeliveryCity(city != null ? city : "San Francisco");
        order.setDeliveryState(state != null ? state : "CA");
        order.setDeliveryPostalCode(postal != null ? postal : "94107");
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discount);
        order.setDeliveryFee(deliveryFee);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);
        order.setCoupon(coupon);
        order.setStatus(OrderStatus.PLACED);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH_ON_DELIVERY");
        order.setPaymentStatus("PENDING");
        order.setOrderNotes(request.getOrderNotes());

        // Snapshot items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                    order,
                    cartItem.getFoodItem(),
                    cartItem.getFoodItem().getName(),
                    cartItem.getFoodItem().getPrice(),
                    cartItem.getQuantity(),
                    cartItem.getSpecialInstructions()
            );
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cart.setRestaurant(null);
        cartRepository.save(cart);

        return mapToDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders(Long userId) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getRestaurantOrders(Long restaurantId, Long ownerId) {
        // Enforce owner isolation
        restaurantRepository.findByIdAndOwnerId(restaurantId, ownerId)
                .orElseThrow(() -> new UnauthorizedException("You are not authorized to view orders for this restaurant."));

        return orderRepository.findByRestaurantIdOrderByPlacedAtDesc(restaurantId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId) && !order.getRestaurant().getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view this order.");
        }

        return mapToDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, Long ownerId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the restaurant owner can modify this order's status.");
        }

        OrderStatus newStatus = request.getStatus();
        order.setStatus(newStatus);

        if (newStatus == OrderStatus.CONFIRMED) {
            order.setConfirmedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            order.setPaymentStatus("COMPLETED");
        } else if (newStatus == OrderStatus.REJECTED) {
            order.setRejectionReason(request.getRejectionReason());
        }

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only cancel your own orders.");
        }

        // Cancellation rules: only PLACED or CONFIRMED can be cancelled by customer
        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in state: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToDto(orderRepository.save(order));
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setRestaurantId(order.getRestaurant().getId());
        dto.setRestaurantName(order.getRestaurant().getName());
        dto.setRestaurantCoverImage(order.getRestaurant().getCoverImage());
        dto.setUserId(order.getUser().getId());
        dto.setCustomerName(order.getUser().getName());
        dto.setDeliveryAddress(order.getDeliveryStreetAddress() + ", " + order.getDeliveryCity() + ", " + order.getDeliveryState());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCouponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null);
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setOrderNotes(order.getOrderNotes());
        dto.setRejectionReason(order.getRejectionReason());
        dto.setPlacedAt(order.getPlacedAt());

        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(i -> new OrderItemDto(
                        i.getId(),
                        i.getFoodItem() != null ? i.getFoodItem().getId() : null,
                        i.getItemNameSnapshot(),
                        i.getUnitPriceSnapshot(),
                        i.getQuantity(),
                        i.getTotalPriceSnapshot(),
                        i.getSpecialInstructions()))
                .collect(Collectors.toList());
        dto.setItems(itemDtos);

        return dto;
    }
}
