export type RoleName = 'ROLE_CUSTOMER' | 'ROLE_RESTAURANT_OWNER' | 'ROLE_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: RoleName;
  status: UserStatus;
}

export interface Restaurant {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  coverImage: string;
  logoImage?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryFee: number;
  minOrderValue: number;
  estimatedDeliveryMinutes: number;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  openingTime: string;
  closingTime: string;
}

export interface FoodCategory {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface FoodItem {
  id: number;
  restaurantId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTimeMinutes: number;
  calories?: number;
  spicyLevel?: number; // 0, 1, 2, 3
}

export interface CartItem {
  id: number;
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
  lineTotal: number;
}

export interface Cart {
  restaurantId: number | null;
  restaurantName?: string;
  deliveryFee: number;
  minOrderValue: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItemSnapshot {
  id: number;
  foodItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerPhone?: string;
  restaurantId: number;
  restaurantName: string;
  restaurantCoverImage: string;
  deliveryAddress: string;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: 'CASH_ON_DELIVERY' | 'CARD_PAYMENT_SIMULATED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  orderNotes?: string;
  rejectionReason?: string;
  placedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  items: OrderItemSnapshot[];
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  restaurantId?: number | null;
  restaurantName?: string;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Address {
  id: number;
  userId: number;
  title: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface Review {
  id: number;
  orderId: number;
  userId: number;
  userName: string;
  restaurantId: number;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  isApproved: boolean;
}
