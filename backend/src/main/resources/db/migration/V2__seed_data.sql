-- Flyway Migration V2: Development Seed Data for FoodFusion 2.0
-- Standard BCrypt hash for passwords ($2a$10$w8.1t3Nq3oVz.67YlX7wEu5.eQf7V/jQ9xU1Kk0g7LpM4S6G1t6C.):
-- Admin123! -> $2a$10$w8.1t3Nq3oVz.67YlX7wEu5.eQf7V/jQ9xU1Kk0g7LpM4S6G1t6C. (or generic BCrypt hashes)

-- 1. Insert Roles
INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_CUSTOMER'),
(2, 'ROLE_RESTAURANT_OWNER'),
(3, 'ROLE_ADMIN');

-- 2. Insert Users (BCrypt hashed passwords)
-- password for all demo accounts: Password123!
-- hash: $2a$10$eAccYoNOz2F5DO7mUiVncOJN2GDzGgYg8UjHqXk4r1m1c9J1o/YkC
INSERT INTO users (id, name, email, password, phone, profile_image, status) VALUES
(1, 'Platform Admin', 'admin@foodfusion.com', '$2a$10$eAccYoNOz2F5DO7mUiVncOJN2GDzGgYg8UjHqXk4r1m1c9J1o/YkC', '+1 (555) 019-2831', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'ACTIVE'),
(2, 'Marco Bellini', 'owner@bistrogood.com', '$2a$10$eAccYoNOz2F5DO7mUiVncOJN2GDzGgYg8UjHqXk4r1m1c9J1o/YkC', '+1 (555) 018-9922', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'ACTIVE'),
(3, 'Chef Kenji Sato', 'owner2@sakurarestaurant.com', '$2a$10$eAccYoNOz2F5DO7mUiVncOJN2GDzGgYg8UjHqXk4r1m1c9J1o/YkC', '+1 (555) 014-3829', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'ACTIVE'),
(4, 'Sarah Jenkins', 'customer@foodfusion.com', '$2a$10$eAccYoNOz2F5DO7mUiVncOJN2GDzGgYg8UjHqXk4r1m1c9J1o/YkC', '+1 (555) 012-7744', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 'ACTIVE'),
(5, 'Marcus Vance', 'pending.chef@freshgrill.com', '$2a$10$eAccYoNOz2F5DO7mUiVncOJN2GDzGgYg8UjHqXk4r1m1c9J1o/YkC', '+1 (555) 017-6655', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', 'PENDING_APPROVAL');

-- 3. Assign User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 3), -- Admin
(2, 2), -- Marco Bellini (Restaurant Owner)
(3, 2), -- Kenji Sato (Restaurant Owner)
(4, 1), -- Sarah Jenkins (Customer)
(5, 2); -- Pending Chef (Restaurant Owner role pending approval)

-- 4. Insert Addresses for Customer
INSERT INTO addresses (id, user_id, title, street_address, apartment_suite, city, state, postal_code, delivery_instructions, is_default) VALUES
(1, 4, 'Home', '742 Evergreen Terrace', 'Apt 4B', 'San Francisco', 'CA', '94107', 'Ring doorbell twice, leave at front gate.', TRUE),
(2, 4, 'Work Studio', '100 Montgomery St', 'Suite 1200', 'San Francisco', 'CA', '94104', 'Front desk reception on 12th floor.', FALSE);

-- 5. Insert Restaurants
INSERT INTO restaurants (id, owner_id, name, slug, description, cuisine, cover_image, logo_image, phone, address, city, state, postal_code, delivery_fee, min_order_value, estimated_delivery_minutes, rating, total_reviews, is_open, status, opening_time, closing_time) VALUES
(1, 2, 'Bella Italia Trattoria', 'bella-italia-trattoria', 'Handcrafted artisanal pasta, wood-fired Neapolitan pizza, and regional Italian specialties made fresh daily.', 'Italian', '/src/assets/images/restaurant_bella_italia_1794473599291.jpg', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80', '+1 (555) 321-7890', '458 Columbus Avenue', 'San Francisco', 'CA', '94133', 2.99, 15.00, 25, 4.9, 142, TRUE, 'ACTIVE', '11:00:00', '22:30:00'),
(2, 2, 'Urban Flame Smokehouse', 'urban-flame-smokehouse', 'Slow-smoked hickory barbecue, double smashed wagyu burgers, and gourmet rustic loaded sides.', 'American / Grill', '/src/assets/images/restaurant_urban_flame_1794473600379.jpg', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80', '+1 (555) 432-8765', '1240 Folsom Street', 'San Francisco', 'CA', '94103', 3.49, 18.00, 30, 4.8, 98, TRUE, 'ACTIVE', '11:30:00', '23:00:00'),
(3, 3, 'Sakura Blossom Kaiseki', 'sakura-blossom-kaiseki', 'Masterfully crafted sashimi, artisan nigiri, and traditional seasonal Japanese small plates.', 'Japanese / Sushi', '/src/assets/images/restaurant_sakura_sushi_1794473601280.jpg', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=150&q=80', '+1 (555) 654-9870', '1820 Post Street', 'San Francisco', 'CA', '94115', 3.99, 25.00, 35, 4.95, 215, TRUE, 'ACTIVE', '12:00:00', '21:30:00'),
(4, 2, 'Verde Harvest Greens', 'verde-harvest-greens', '100% Organic Mediterranean nourish bowls, cold-pressed elixirs, and chef-curated vegan specialties.', 'Healthy / Salads', '/src/assets/images/restaurant_verde_harvest_1794473600993.jpg', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80', '+1 (555) 789-0123', '520 Hayes Street', 'San Francisco', 'CA', '94102', 2.49, 12.00, 20, 4.7, 76, TRUE, 'ACTIVE', '09:00:00', '20:00:00'),
(5, 5, 'Fresh Flame Churrasco', 'fresh-flame-churrasco', 'Artisan Brazilian skewers and flame-grilled steaks with chimichurri.', 'Steakhouse', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80', '+1 (555) 890-1234', '900 Mission Street', 'San Francisco', 'CA', '94103', 4.99, 30.00, 45, 0.0, 0, FALSE, 'PENDING_APPROVAL', '16:00:00', '23:00:00');

-- 6. Insert Food Categories
INSERT INTO food_categories (id, restaurant_id, name, description, display_order, is_active) VALUES
(1, 1, 'Wood-Fired Pizza', 'Crispy thin crust baked in our 900-degree imported oven.', 1, TRUE),
(2, 1, 'Artisan Pasta', 'Fresh handmade egg pasta prepared every morning.', 2, TRUE),
(3, 1, 'Antipasti & Dolci', 'Traditional Italian starters and desserts.', 3, TRUE),
(4, 2, 'Gourmet Burgers', '100% American Wagyu smashed patties on brioche.', 1, TRUE),
(5, 2, 'Smoked Barbecue', 'Smoked low and slow over seasoned hickory.', 2, TRUE),
(6, 3, 'Signature Nigiri & Sashimi', 'Pristine ocean fish prepared by Master Chef Kenji.', 1, TRUE),
(7, 3, 'Maki Rolls', 'Artisanal hand rolls wrapped in toasted nori.', 2, TRUE),
(8, 4, 'Nourish Grain Bowls', 'Warm ancient grains with roasted organic vegetables.', 1, TRUE),
(9, 4, 'Cold-Pressed Juices', 'Raw unpasteurized cold-pressed botanical blends.', 2, TRUE);

-- 7. Insert Food Items
INSERT INTO food_items (id, restaurant_id, category_id, name, description, price, image_url, is_vegetarian, is_available, is_featured, preparation_time_minutes, calories, spicy_level) VALUES
-- Bella Italia
(1, 1, 1, 'Neapolitan Margherita D.O.P.', 'San Marzano tomatoes, fresh buffalo mozzarella, fragrant sweet basil, and extra virgin olive oil.', 18.50, '/src/assets/images/restaurant_bella_italia_1794473599291.jpg', TRUE, TRUE, TRUE, 15, 780, 0),
(2, 1, 1, 'Diavola Spicy Salame', 'Crushed tomato sauce, fior di latte mozzarella, artisanal spicy Calabrian soppressata, chili oil.', 21.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80', FALSE, TRUE, TRUE, 15, 890, 2),
(3, 1, 2, 'Truffle Tagliatelle Funghi', 'Hand-rolled ribbon pasta with imported Italian black summer truffles, wild chanterelles, and parmigiano cream.', 24.50, '/src/assets/images/restaurant_bella_italia_1794473599291.jpg', TRUE, TRUE, TRUE, 18, 820, 0),
(4, 1, 2, 'Rigatoni Bolognese Tradizionale', 'Slow-braised beef and pork ragù, San Marzano reduction, aged 24-month Parmigiano-Reggiano.', 22.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80', FALSE, TRUE, FALSE, 20, 850, 0),
(5, 1, 3, 'Classic Venetian Tiramisu', 'Savoiardi ladyfingers soaked in espresso and Marsala, layered with mascarpone cream and Valrhona cocoa.', 9.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80', TRUE, TRUE, FALSE, 5, 420, 0),

-- Urban Flame Smokehouse
(6, 2, 4, 'Artisan Wagyu Double Smash', 'Two 1/4 lb Wagyu patties, double aged Wisconsin cheddar, crispy bacon, house garlic aioli on toasted brioche.', 17.50, '/src/assets/images/restaurant_urban_flame_1794473600379.jpg', FALSE, TRUE, TRUE, 15, 950, 1),
(7, 2, 4, 'Smoked Truffle Portobello Burger', 'Grilled balsamic-glazed portobello mushroom cap, provolone, caramelized sweet onions, truffle aioli.', 16.00, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=500&q=80', TRUE, TRUE, FALSE, 14, 620, 0),
(8, 2, 5, '14-Hour Smoked Texas Brisket', 'Half-pound prime black angus brisket sliced thick with spicy vinegar slaw and house pickles.', 26.00, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=500&q=80', FALSE, TRUE, TRUE, 12, 1050, 1),
(9, 2, 5, 'Golden Rosemary Herb Fries', 'Hand-cut russet potatoes tossed with sea salt, fresh rosemary, and garlic herb dipping sauce.', 6.50, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80', TRUE, TRUE, FALSE, 8, 380, 0),

-- Sakura Blossom Kaiseki
(10, 3, 6, 'Deluxe Chef Nigiri Platter', '9 pieces of seasonal ocean catch: Otoro bluefin tuna, king salmon, yellowtail, unagi, sweet scallop.', 38.00, '/src/assets/images/restaurant_sakura_sushi_1794473601280.jpg', FALSE, TRUE, TRUE, 20, 540, 0),
(11, 3, 6, 'Salmon & Avocado Tartare', 'Diced Norwegian salmon, Haas avocado, yuzu ponzu reduction, crispy wonton crisps.', 19.50, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=500&q=80', FALSE, TRUE, FALSE, 12, 380, 0),
(12, 3, 7, 'Spicy Bluefin Dragon Roll', 'Tempura prawn, avocado, topped with seared spicy bluefin tuna, tobiko caviar, and unagi glaze.', 21.50, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=500&q=80', FALSE, TRUE, TRUE, 15, 620, 2),

-- Verde Harvest Greens
(13, 4, 8, 'Golden Tahini Quinoa Nourish Bowl', 'Organic tri-color quinoa, roasted sweet potatoes, crispy edamame, purple cabbage, sliced avocado, lemon tahini.', 15.50, '/src/assets/images/restaurant_verde_harvest_1794473600993.jpg', TRUE, TRUE, TRUE, 10, 480, 0),
(14, 4, 8, 'Wild Berry Açaí Superfood Bowl', 'Pure organic Brazilian açaí puree, gluten-free granola, chia seeds, sliced bananas, local honeycomb.', 13.50, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=500&q=80', TRUE, TRUE, FALSE, 8, 390, 0),
(15, 4, 9, 'Sunrise Citrus Glow Juice', 'Cold-pressed Valencia orange, golden turmeric root, ginger, lemon, and raw agave nectar.', 7.50, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80', TRUE, TRUE, FALSE, 5, 130, 0);

-- 8. Insert Coupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, restaurant_id, start_date, expiry_date, usage_limit, usage_count, per_user_limit, is_active) VALUES
(1, 'WELCOME20', '20% off your entire first gourmet order', 'PERCENTAGE', 20.00, 25.00, 15.00, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 5000, 412, 1, TRUE),
(2, 'TASTY10', '$10 flat discount on orders over $40', 'FIXED_AMOUNT', 10.00, 40.00, 10.00, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 2000, 185, 2, TRUE),
(3, 'BELLA15', '15% off authentic Italian at Bella Italia', 'PERCENTAGE', 15.00, 30.00, 12.00, 1, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 89, 3, TRUE);

-- 9. Insert Sample Completed Orders for Demonstration
INSERT INTO orders (id, order_number, user_id, restaurant_id, address_id, delivery_street_address, delivery_city, delivery_state, delivery_postal_code, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, coupon_id, status, payment_method, payment_status, order_notes, placed_at, confirmed_at, delivered_at) VALUES
(1, 'FF-2026-10492', 4, 1, 1, '742 Evergreen Terrace, Apt 4B', 'San Francisco', 'CA', '94107', 43.00, 8.60, 2.99, 3.44, 40.83, 1, 'DELIVERED', 'CASH_ON_DELIVERY', 'COMPLETED', 'Extra parmesan cheese on the side please.', '2026-11-10 18:30:00', '2026-11-10 18:32:00', '2026-11-10 19:05:00'),
(2, 'FF-2026-10518', 4, 2, 1, '742 Evergreen Terrace, Apt 4B', 'San Francisco', 'CA', '94107', 43.50, 0.00, 3.49, 3.70, 50.69, NULL, 'PREPARING', 'CASH_ON_DELIVERY', 'PENDING', 'Crispy fries please!', '2026-11-12 12:15:00', '2026-11-12 12:17:00', NULL);

-- 10. Insert Order Items (with snapshot prices)
INSERT INTO order_items (id, order_id, food_item_id, item_name_snapshot, unit_price_snapshot, quantity, total_price_snapshot, special_instructions) VALUES
(1, 1, 1, 'Neapolitan Margherita D.O.P.', 18.50, 1, 18.50, 'Well-done crust'),
(2, 1, 3, 'Truffle Tagliatelle Funghi', 24.50, 1, 24.50, 'Extra cracked black pepper'),
(3, 2, 6, 'Artisan Wagyu Double Smash', 17.50, 2, 35.00, 'Pickles on the side'),
(4, 2, 9, 'Golden Rosemary Herb Fries', 6.50, 1, 6.50, 'Extra dipping sauce');

-- 11. Insert Reviews for Completed Order
INSERT INTO reviews (id, order_id, user_id, restaurant_id, rating, comment, is_moderated, is_approved) VALUES
(1, 1, 4, 1, 5, 'Absolute perfection! The Truffle Tagliatelle was heavenly, perfectly al dente and packed with flavor. The pizza crust had incredible leopard spotting.', TRUE, TRUE);

-- 12. Insert Favorites
INSERT INTO restaurant_favourites (user_id, restaurant_id) VALUES
(4, 1),
(4, 3);

INSERT INTO food_favourites (user_id, food_item_id) VALUES
(4, 3),
(4, 10);
