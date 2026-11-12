package com.foodfusion;

import com.foodfusion.dto.AuthDtos.RegisterRequest;
import com.foodfusion.dto.AuthDtos.MessageResponse;
import com.foodfusion.entity.Role;
import com.foodfusion.entity.RoleName;
import com.foodfusion.entity.User;
import com.foodfusion.exception.BadRequestException;
import com.foodfusion.repository.RoleRepository;
import com.foodfusion.repository.UserRepository;
import com.foodfusion.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private Role customerRole;
    private Role ownerRole;

    @BeforeEach
    void setUp() {
        customerRole = new Role(RoleName.ROLE_CUSTOMER);
        customerRole.setId(1L);

        ownerRole = new Role(RoleName.ROLE_RESTAURANT_OWNER);
        ownerRole.setId(2L);
    }

    @Test
    void testRegisterCustomerSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Jane Doe");
        req.setEmail("jane@example.com");
        req.setPassword("SecurePass123!");
        req.setPhone("+15551234567");
        req.setRole("ROLE_CUSTOMER");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(roleRepository.findByName(RoleName.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        MessageResponse response = authService.registerUser(req);
        assertTrue(response.isSuccess());
        assertEquals("Customer registered successfully!", response.getMessage());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmailThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@example.com");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterOwnerSetsPendingApproval() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Chef Luigi");
        req.setEmail("luigi@trattoria.com");
        req.setPassword("ChefSecret123!");
        req.setRole("ROLE_RESTAURANT_OWNER");

        when(userRepository.existsByEmail("luigi@trattoria.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");
        when(roleRepository.findByName(RoleName.ROLE_RESTAURANT_OWNER)).thenReturn(Optional.of(ownerRole));

        MessageResponse response = authService.registerUser(req);
        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains("pending Administrator approval"));
    }
}
