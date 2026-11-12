import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { Cart, FoodItem } from '../types';
import { useNotification } from './NotificationContext';

interface CartContextType {
  cart: Cart;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  conflictItem: { item: FoodItem; quantity: number } | null;
  setConflictItem: (conflict: { item: FoodItem; quantity: number } | null) => void;
  appliedCouponCode: string | null;
  discountAmount: number;
  addToCart: (item: FoodItem, quantity?: number, instructions?: string) => Promise<boolean>;
  confirmClearAndAdd: () => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    restaurantId: null,
    deliveryFee: 0,
    minOrderValue: 0,
    items: [],
    subtotal: 0,
    tax: 0,
    grandTotal: 0,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [conflictItem, setConflictItem] = useState<{ item: FoodItem; quantity: number } | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const { showToast } = useNotification();

  const refreshCart = async () => {
    const c = await api.cart.get();
    setCart({ ...c });
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const totalItemsCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = async (item: FoodItem, quantity = 1, instructions?: string): Promise<boolean> => {
    try {
      const updated = await api.cart.addItem(item, quantity, instructions);
      setCart({ ...updated });
      showToast(`Added ${item.name} to cart.`);
      return true;
    } catch (err: any) {
      if (err.message === 'DIFFERENT_RESTAURANT') {
        setConflictItem({ item, quantity });
        return false;
      }
      showToast(err.message || 'Failed to add item to cart', 'error');
      return false;
    }
  };

  const confirmClearAndAdd = async () => {
    if (!conflictItem) return;
    await api.cart.clear();
    const updated = await api.cart.addItem(conflictItem.item, conflictItem.quantity);
    setCart({ ...updated });
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    showToast(`Cart reset to ${conflictItem.item.name}.`);
    setConflictItem(null);
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    const updated = await api.cart.updateQuantity(cartItemId, quantity);
    setCart({ ...updated });
    if (updated.items.length === 0) {
      setAppliedCouponCode(null);
      setDiscountAmount(0);
    }
  };

  const clearCart = async () => {
    const updated = await api.cart.clear();
    setCart({ ...updated });
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    showToast('Shopping cart cleared.', 'info');
  };

  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    const res = await api.coupons.validate(code, cart.subtotal, cart.restaurantId || undefined);
    if (res.valid && res.discountAmount !== undefined) {
      setAppliedCouponCode(res.coupon?.code || code.toUpperCase());
      setDiscountAmount(res.discountAmount);
      showToast(`Coupon ${code.toUpperCase()} applied: Saved $${res.discountAmount.toFixed(2)}!`);
      return { success: true, message: res.message || 'Coupon applied' };
    } else {
      return { success: false, message: res.message || 'Invalid coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    showToast('Coupon removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
        conflictItem,
        setConflictItem,
        appliedCouponCode,
        discountAmount,
        addToCart,
        confirmClearAndAdd,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
