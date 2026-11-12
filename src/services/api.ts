import {
  Address,
  Cart,
  CartItem,
  Coupon,
  FoodCategory,
  FoodItem,
  Order,
  OrderStatus,
  Restaurant,
  Review,
  RoleName,
  User,
} from '../types';
import {
  INITIAL_ADDRESSES,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_FOOD_ITEMS,
  INITIAL_ORDERS,
  INITIAL_RESTAURANTS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
} from './mockData';

// Local storage key constants for persistent state in browser
const STORAGE_KEYS = {
  USERS: 'foodfusion_users_v2',
  RESTAURANTS: 'foodfusion_restaurants_v2',
  CATEGORIES: 'foodfusion_categories_v2',
  FOOD_ITEMS: 'foodfusion_food_items_v2',
  ORDERS: 'foodfusion_orders_v2',
  COUPONS: 'foodfusion_coupons_v2',
  ADDRESSES: 'foodfusion_addresses_v2',
  REVIEWS: 'foodfusion_reviews_v2',
  CURRENT_USER: 'foodfusion_current_user_v2',
  TOKEN: 'foodfusion_jwt_token_v2',
  CART: 'foodfusion_active_cart_v2',
};

// Helper to initialize and retrieve reactive store
function getStored<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to persist to localStorage', err);
  }
}

// In-browser authoritative state store
let users: User[] = getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
let restaurants: Restaurant[] = getStored(STORAGE_KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
let categories: FoodCategory[] = getStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
let foodItems: FoodItem[] = getStored(STORAGE_KEYS.FOOD_ITEMS, INITIAL_FOOD_ITEMS);
let orders: Order[] = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
let coupons: Coupon[] = getStored(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
let addresses: Address[] = getStored(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);
let reviews: Review[] = getStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);

// Default active cart
const initialCart: Cart = {
  restaurantId: null,
  deliveryFee: 0,
  minOrderValue: 0,
  items: [],
  subtotal: 0,
  tax: 0,
  grandTotal: 0,
};
let cart: Cart = getStored(STORAGE_KEYS.CART, initialCart);

export const api = {
  // Authentication
  auth: {
    login: async (email: string, _pass: string) => {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password.');
      }
      if (user.status === 'SUSPENDED') {
        throw new Error('This account has been suspended by an administrator.');
      }
      if (user.status === 'PENDING_APPROVAL') {
        throw new Error('Your restaurant owner account is pending approval by an administrator.');
      }
      const token = 'mock_jwt_token_' + btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
      setStored(STORAGE_KEYS.TOKEN, token);
      setStored(STORAGE_KEYS.CURRENT_USER, user);
      return { token, user };
    },

    register: async (name: string, email: string, _pass: string, phone: string, role: RoleName) => {
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email is already registered.');
      }
      const newUser: User = {
        id: Date.now(),
        name,
        email,
        phone,
        role,
        status: role === 'ROLE_RESTAURANT_OWNER' ? 'PENDING_APPROVAL' : 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      };
      users.push(newUser);
      setStored(STORAGE_KEYS.USERS, users);
      return {
        user: newUser,
        message:
          role === 'ROLE_RESTAURANT_OWNER'
            ? 'Restaurant owner registration successful! Your application is pending administrator approval.'
            : 'Registration successful! Welcome to FoodFusion.',
      };
    },

    switchDemoRole: async (role: RoleName) => {
      const targetUser = users.find((u) => u.role === role && u.status === 'ACTIVE') || users[0];
      setStored(STORAGE_KEYS.CURRENT_USER, targetUser);
      setStored(STORAGE_KEYS.TOKEN, 'mock_token_' + role);
      return targetUser;
    },

    getCurrentUser: (): User | null => {
      return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, users[3]); // default Sarah Jenkins (Customer)
    },

    logout: async () => {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },
  },

  // Restaurants
  restaurants: {
    getAll: async (filter?: { cuisine?: string; search?: string; vegetarianOnly?: boolean }) => {
      let result = restaurants.filter((r) => r.status === 'ACTIVE');
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        result = result.filter((r) => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
      }
      if (filter?.cuisine && filter.cuisine !== 'All') {
        result = result.filter((r) => r.cuisine.toLowerCase().includes(filter.cuisine!.toLowerCase()));
      }
      return result;
    },

    getById: async (id: number) => {
      const restaurant = restaurants.find((r) => r.id === id);
      if (!restaurant) throw new Error('Restaurant not found.');
      return restaurant;
    },

    getByOwnerId: async (ownerId: number) => {
      return restaurants.filter((r) => r.ownerId === ownerId);
    },

    update: async (id: number, updates: Partial<Restaurant>) => {
      const index = restaurants.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Restaurant not found.');
      restaurants[index] = { ...restaurants[index], ...updates };
      setStored(STORAGE_KEYS.RESTAURANTS, restaurants);
      return restaurants[index];
    },

    updateStatus: async (id: number, status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED') => {
      const index = restaurants.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Restaurant not found.');
      restaurants[index].status = status;
      if (status === 'ACTIVE') restaurants[index].isOpen = true;
      setStored(STORAGE_KEYS.RESTAURANTS, restaurants);
      return restaurants[index];
    },
  },

  // Menu items and Categories
  menu: {
    getCategories: async (restaurantId: number) => {
      return categories.filter((c) => c.restaurantId === restaurantId).sort((a, b) => a.displayOrder - b.displayOrder);
    },

    getItems: async (restaurantId: number) => {
      return foodItems.filter((i) => i.restaurantId === restaurantId);
    },

    addItem: async (item: Omit<FoodItem, 'id'>) => {
      const newItem: FoodItem = {
        ...item,
        id: Date.now(),
      };
      foodItems.push(newItem);
      setStored(STORAGE_KEYS.FOOD_ITEMS, foodItems);
      return newItem;
    },

    updateItem: async (id: number, updates: Partial<FoodItem>) => {
      const index = foodItems.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Item not found.');
      foodItems[index] = { ...foodItems[index], ...updates };
      setStored(STORAGE_KEYS.FOOD_ITEMS, foodItems);
      return foodItems[index];
    },

    deleteItem: async (id: number) => {
      foodItems = foodItems.filter((i) => i.id !== id);
      setStored(STORAGE_KEYS.FOOD_ITEMS, foodItems);
      return true;
    },
  },

  // Shopping Cart & Authoritative calculations
  cart: {
    get: async (): Promise<Cart> => {
      return cart;
    },

    addItem: async (foodItem: FoodItem, quantity: number, instructions?: string) => {
      // Single Restaurant Constraint
      if (cart.restaurantId && cart.items.length > 0 && cart.restaurantId !== foodItem.restaurantId) {
        throw new Error('DIFFERENT_RESTAURANT');
      }

      const rest = restaurants.find((r) => r.id === foodItem.restaurantId);
      cart.restaurantId = foodItem.restaurantId;
      cart.restaurantName = rest?.name;
      cart.deliveryFee = rest?.deliveryFee ?? 2.99;
      cart.minOrderValue = rest?.minOrderValue ?? 15.0;

      const existingIndex = cart.items.findIndex((i) => i.foodItem.id === foodItem.id);
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
        cart.items[existingIndex].lineTotal = Number(
          (cart.items[existingIndex].quantity * foodItem.price).toFixed(2)
        );
        if (instructions) cart.items[existingIndex].specialInstructions = instructions;
      } else {
        cart.items.push({
          id: Date.now(),
          foodItem,
          quantity,
          specialInstructions: instructions,
          lineTotal: Number((quantity * foodItem.price).toFixed(2)),
        });
      }

      recalculateCart();
      setStored(STORAGE_KEYS.CART, cart);
      return cart;
    },

    updateQuantity: async (itemId: number, quantity: number) => {
      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.id !== itemId);
        if (cart.items.length === 0) {
          cart.restaurantId = null;
          cart.restaurantName = undefined;
        }
      } else {
        const item = cart.items.find((i) => i.id === itemId);
        if (item) {
          item.quantity = quantity;
          item.lineTotal = Number((item.quantity * item.foodItem.price).toFixed(2));
        }
      }
      recalculateCart();
      setStored(STORAGE_KEYS.CART, cart);
      return cart;
    },

    clear: async () => {
      cart = {
        restaurantId: null,
        restaurantName: undefined,
        deliveryFee: 0,
        minOrderValue: 0,
        items: [],
        subtotal: 0,
        tax: 0,
        grandTotal: 0,
      };
      setStored(STORAGE_KEYS.CART, cart);
      return cart;
    },
  },

  // Coupons
  coupons: {
    validate: async (code: string, subtotal: number, restaurantId?: number) => {
      const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!coupon || !coupon.isActive) {
        return { valid: false, message: 'Invalid or inactive coupon code.' };
      }
      if (coupon.restaurantId && restaurantId && coupon.restaurantId !== restaurantId) {
        return { valid: false, message: `This coupon is only valid for ${coupon.restaurantName}.` };
      }
      if (subtotal < coupon.minOrderAmount) {
        return { valid: false, message: `Minimum order of $${coupon.minOrderAmount.toFixed(2)} required for this coupon.` };
      }

      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }
      discount = Math.min(discount, subtotal);

      return {
        valid: true,
        coupon,
        discountAmount: Number(discount.toFixed(2)),
        message: 'Coupon applied successfully!',
      };
    },

    getAll: async () => coupons,

    create: async (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
      const newCoupon: Coupon = {
        ...couponData,
        id: Date.now(),
        usageCount: 0,
      };
      coupons.push(newCoupon);
      setStored(STORAGE_KEYS.COUPONS, coupons);
      return newCoupon;
    },

    toggleStatus: async (id: number) => {
      const index = coupons.findIndex((c) => c.id === id);
      if (index !== -1) {
        coupons[index].isActive = !coupons[index].isActive;
        setStored(STORAGE_KEYS.COUPONS, coupons);
      }
      return coupons[index];
    },
  },

  // Orders
  orders: {
    create: async (orderPayload: {
      userId: number;
      customerName: string;
      customerPhone?: string;
      deliveryAddress: string;
      paymentMethod: 'CASH_ON_DELIVERY' | 'CARD_PAYMENT_SIMULATED';
      couponCode?: string;
      orderNotes?: string;
    }) => {
      if (cart.items.length === 0 || !cart.restaurantId) {
        throw new Error('Cannot place an order with an empty cart.');
      }

      const rest = restaurants.find((r) => r.id === cart.restaurantId);
      if (!rest) throw new Error('Restaurant not found.');

      if (cart.subtotal < rest.minOrderValue) {
        throw new Error(`Minimum order amount is $${rest.minOrderValue.toFixed(2)}.`);
      }

      // Check coupon
      let discountAmount = 0;
      if (orderPayload.couponCode) {
        const val = await api.coupons.validate(orderPayload.couponCode, cart.subtotal, rest.id);
        if (val.valid && val.discountAmount) {
          discountAmount = val.discountAmount;
        }
      }

      const taxable = Math.max(0, cart.subtotal - discountAmount);
      const tax = Number((taxable * 0.08).toFixed(2));
      const totalAmount = Number((taxable + rest.deliveryFee + tax).toFixed(2));

      const newOrder: Order = {
        id: Date.now(),
        orderNumber: 'FF-2026-' + Math.floor(10000 + Math.random() * 90000),
        userId: orderPayload.userId,
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone,
        restaurantId: rest.id,
        restaurantName: rest.name,
        restaurantCoverImage: rest.coverImage,
        deliveryAddress: orderPayload.deliveryAddress,
        subtotal: cart.subtotal,
        discountAmount,
        deliveryFee: rest.deliveryFee,
        taxAmount: tax,
        totalAmount,
        couponCode: orderPayload.couponCode,
        status: 'PLACED',
        paymentMethod: orderPayload.paymentMethod,
        paymentStatus: 'PENDING',
        orderNotes: orderPayload.orderNotes,
        placedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        items: cart.items.map((ci) => ({
          id: Date.now() + Math.random(),
          foodItemId: ci.foodItem.id,
          itemName: ci.foodItem.name,
          unitPrice: ci.foodItem.price,
          quantity: ci.quantity,
          totalPrice: ci.lineTotal,
          specialInstructions: ci.specialInstructions,
        })),
      };

      orders.unshift(newOrder);
      setStored(STORAGE_KEYS.ORDERS, orders);

      // Clear cart
      await api.cart.clear();

      return newOrder;
    },

    getByUser: async (userId: number) => {
      return orders.filter((o) => o.userId === userId);
    },

    getByRestaurant: async (restaurantId: number) => {
      return orders.filter((o) => o.restaurantId === restaurantId);
    },

    getAll: async () => orders,

    getById: async (id: number) => {
      const order = orders.find((o) => o.id === id);
      if (!order) throw new Error('Order not found.');
      return order;
    },

    updateStatus: async (id: number, status: OrderStatus, reason?: string) => {
      const index = orders.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Order not found.');
      orders[index].status = status;
      if (status === 'CONFIRMED') {
        orders[index].confirmedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      }
      if (status === 'DELIVERED') {
        orders[index].deliveredAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        orders[index].paymentStatus = 'COMPLETED';
      }
      if (status === 'REJECTED' && reason) {
        orders[index].rejectionReason = reason;
      }
      setStored(STORAGE_KEYS.ORDERS, orders);
      return orders[index];
    },

    cancel: async (id: number, userId: number) => {
      const index = orders.findIndex((o) => o.id === id && o.userId === userId);
      if (index === -1) throw new Error('Order not found.');
      if (orders[index].status !== 'PLACED' && orders[index].status !== 'CONFIRMED') {
        throw new Error(`Order cannot be cancelled in status: ${orders[index].status}`);
      }
      orders[index].status = 'CANCELLED';
      setStored(STORAGE_KEYS.ORDERS, orders);
      return orders[index];
    },
  },

  // Addresses
  addresses: {
    getByUser: async (userId: number) => {
      return addresses.filter((a) => a.userId === userId);
    },

    add: async (addr: Omit<Address, 'id'>) => {
      if (addr.isDefault) {
        addresses.forEach((a) => {
          if (a.userId === addr.userId) a.isDefault = false;
        });
      }
      const newAddr: Address = { ...addr, id: Date.now() };
      addresses.push(newAddr);
      setStored(STORAGE_KEYS.ADDRESSES, addresses);
      return newAddr;
    },

    update: async (id: number, updates: Partial<Address>) => {
      const idx = addresses.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Address not found.');
      if (updates.isDefault) {
        addresses.forEach((a) => {
          if (a.userId === addresses[idx].userId) a.isDefault = false;
        });
      }
      addresses[idx] = { ...addresses[idx], ...updates };
      setStored(STORAGE_KEYS.ADDRESSES, addresses);
      return addresses[idx];
    },

    delete: async (id: number) => {
      addresses = addresses.filter((a) => a.id !== id);
      setStored(STORAGE_KEYS.ADDRESSES, addresses);
      return true;
    },
  },

  // Reviews
  reviews: {
    getByRestaurant: async (restaurantId: number) => {
      return reviews.filter((r) => r.restaurantId === restaurantId && r.isApproved);
    },

    getAll: async () => reviews,

    add: async (review: Omit<Review, 'id' | 'createdAt' | 'isApproved'>) => {
      const newReview: Review = {
        ...review,
        id: Date.now(),
        createdAt: new Date().toISOString().substring(0, 10),
        isApproved: true,
      };
      reviews.unshift(newReview);
      setStored(STORAGE_KEYS.REVIEWS, reviews);
      return newReview;
    },

    moderate: async (id: number, approved: boolean) => {
      const idx = reviews.findIndex((r) => r.id === id);
      if (idx !== -1) {
        reviews[idx].isApproved = approved;
        setStored(STORAGE_KEYS.REVIEWS, reviews);
      }
      return reviews[idx];
    },
  },

  // Admin User & Platform Management
  admin: {
    getUsers: async () => users,

    toggleUserStatus: async (userId: number) => {
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('User not found.');
      users[idx].status = users[idx].status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      setStored(STORAGE_KEYS.USERS, users);
      return users[idx];
    },

    approveOwner: async (userId: number) => {
      const uIdx = users.findIndex((u) => u.id === userId);
      if (uIdx !== -1) {
        users[uIdx].status = 'ACTIVE';
        setStored(STORAGE_KEYS.USERS, users);
      }
      // Also approve their restaurant if any
      const rIdx = restaurants.findIndex((r) => r.ownerId === userId);
      if (rIdx !== -1) {
        restaurants[rIdx].status = 'ACTIVE';
        restaurants[rIdx].isOpen = true;
        setStored(STORAGE_KEYS.RESTAURANTS, restaurants);
      }
      return { success: true };
    },

    exportOrdersCsv: () => {
      const headers = ['Order Number', 'Date', 'Restaurant', 'Customer', 'Delivery Fee', 'Tax', 'Subtotal', 'Total Amount', 'Status', 'Payment Method'];
      const rows = orders.map((o) => [
        o.orderNumber,
        o.placedAt,
        `"${o.restaurantName.replace(/"/g, '""')}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        o.deliveryFee.toFixed(2),
        o.taxAmount.toFixed(2),
        o.subtotal.toFixed(2),
        o.totalAmount.toFixed(2),
        o.status,
        o.paymentMethod,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `foodfusion_orders_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};

function recalculateCart() {
  const subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
  cart.subtotal = Number(subtotal.toFixed(2));
  cart.tax = Number((subtotal * 0.08).toFixed(2));
  cart.grandTotal = Number((cart.subtotal + cart.tax + cart.deliveryFee).toFixed(2));
}
