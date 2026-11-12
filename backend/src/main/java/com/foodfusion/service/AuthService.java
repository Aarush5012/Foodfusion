package com.foodfusion.service;

import com.foodfusion.dto.AuthDtos.*;
import com.foodfusion.entity.Role;
import com.foodfusion.entity.RoleName;
import com.foodfusion.entity.User;
import com.foodfusion.exception.BadRequestException;
import com.foodfusion.repository.RoleRepository;
import com.foodfusion.repository.UserRepository;
import com.foodfusion.security.JwtUtils;
import com.foodfusion.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getStatus(),
                roles);
    }

    @Transactional
    public MessageResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        User user = new User(signUpRequest.getName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getPhone());

        Set<Role> roles = new HashSet<>();
        String strRole = signUpRequest.getRole();

        if (strRole != null && strRole.equalsIgnoreCase("ROLE_RESTAURANT_OWNER")) {
            Role ownerRole = roleRepository.findByName(RoleName.ROLE_RESTAURANT_OWNER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(ownerRole);
            // Restaurant owner registration must remain pending until approved by an administrator
            user.setStatus("PENDING_APPROVAL");
        } else {
            Role userRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
            user.setStatus("ACTIVE");
        }

        user.setRoles(roles);
        userRepository.save(user);

        if ("PENDING_APPROVAL".equals(user.getStatus())) {
            return new MessageResponse("Restaurant Owner registered successfully. Account is pending Administrator approval.", true);
        }

        return new MessageResponse("Customer registered successfully!", true);
    }
}
