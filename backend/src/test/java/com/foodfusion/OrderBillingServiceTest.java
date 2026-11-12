package com.foodfusion;

import com.foodfusion.dto.OrderDtos.OrderCreateRequest;
import com.foodfusion.dto.OrderDtos.OrderDto;
import com.foodfusion.entity.*;
import com.foodfusion.exception.BadRequestException;
import com.foodfusion.repository.*;
import com.foodfusion.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderBillingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private Restaurant restaurant;
    private FoodItem pizzaItem;
    private Cart cart;

    @BeforeEach
    void setUp() {
        customer = new User("Sarah Jenkins", "customer@foodfusion.com", "hash", "+15551234567");
        customer.setId(4L);

        restaurant = new Restaurant();
        restaurant.setId(1L);
        restaurant.setName("Bella Italia Trattoria");
        restaurant.setDeliveryFee(new BigDecimal("2.99"));
        restaurant.setMinOrderValue(new BigDecimal("15.00"));

        pizzaItem = new FoodItem();
        pizzaItem.setId(1L);
        pizzaItem.setName("Neapolitan Margherita");
        pizzaItem.setPrice(new BigDecimal("18.50"));
        pizzaItem.setRestaurant(restaurant);
        pizzaItem.setIsAvailable(true);

        cart = new Cart();
        cart.setId(1L);
        cart.setUser(customer);
        cart.setRestaurant(restaurant);

        CartItem item = new CartItem(cart, pizzaItem, 2);
        cart.getItems().add(item);
    }

    @Test
    void testOrderCreationCalculatesAccurateTotals() {
        OrderCreateRequest req = new OrderCreateRequest();
        req.setRestaurantId(1L);
        req.setDeliveryStreetAddress("742 Evergreen Terrace");
        req.setDeliveryCity("San Francisco");
        req.setDeliveryState("CA");
        req.setDeliveryPostalCode("94107");
        req.setPaymentMethod("CASH_ON_DELIVERY");

        when(userRepository.findById(4L)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(4L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(100L);
            return o;
        });

        OrderDto orderDto = orderService.createOrderFromCart(4L, req);

        assertNotNull(orderDto);
        // Subtotal: 18.50 * 2 = 37.00
        assertEquals(new BigDecimal("37.00"), orderDto.getSubtotal());
        // Delivery fee: 2.99
        assertEquals(new BigDecimal("2.99"), orderDto.getDeliveryFee());
        // Tax (8% of 37.00) = 2.96
        assertEquals(new BigDecimal("2.96"), orderDto.getTaxAmount());
        // Grand Total = 37.00 + 2.99 + 2.96 = 42.95
        assertEquals(new BigDecimal("42.95"), orderDto.getTotalAmount());
        // Items snapshot
        assertEquals(1, orderDto.getItems().size());
        assertEquals("Neapolitan Margherita", orderDto.getItems().get(0).getItemName());
        assertEquals(new BigDecimal("18.50"), orderDto.getItems().get(0).getUnitPrice());
    }

    @Test
    void testEmptyCartThrowsBadRequest() {
        cart.getItems().clear();
        when(userRepository.findById(4L)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(4L)).thenReturn(Optional.of(cart));

        OrderCreateRequest req = new OrderCreateRequest();
        req.setRestaurantId(1L);

        assertThrows(BadRequestException.class, () -> orderService.createOrderFromCart(4L, req));
    }
}
