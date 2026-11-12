import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
  onBrowse: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onBrowse }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    clearCart,
    appliedCouponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    const res = await applyCoupon(couponInput);
    setCouponLoading(false);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const remainingForMinOrder =
    cart.restaurantId && cart.subtotal < cart.minOrderValue
      ? (cart.minOrderValue - cart.subtotal).toFixed(2)
      : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Your Gourmet Bag</h2>
              {cart.restaurantName ? (
                <p className="text-xs text-stone-500 mt-0.5">
                  Ordering from <strong className="text-stone-800">{cart.restaurantName}</strong>
                </p>
              ) : (
                <p className="text-xs text-stone-500 mt-0.5">Your cart is currently empty</p>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-6">
                  Explore top-rated artisanal kitchens and delicious dishes to start your order.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onBrowse();
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Explore Restaurants
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <img
                      src={item.foodItem.imageUrl}
                      alt={item.foodItem.name}
                      className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-stone-900 leading-tight truncate">
                          {item.foodItem.name}
                        </h4>
                        <span className="text-xs font-semibold text-stone-900 tabular-nums">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        ${item.foodItem.price.toFixed(2)} each
                      </p>
                      {item.specialInstructions && (
                        <p className="text-[10px] text-orange-700 italic mt-0.5 line-clamp-1">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}

                      {/* Quantity stepper */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-stone-500 hover:text-stone-800 p-0.5"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-stone-900 tabular-nums w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-stone-500 hover:text-stone-800 p-0.5"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => updateQuantity(item.id, 0)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.items.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-4 sm:p-5 space-y-3.5">
              {/* Minimum order alert */}
              {remainingForMinOrder && (
                <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Add <strong>${remainingForMinOrder}</strong> more to meet the minimum order requirement of $
                    {cart.minOrderValue.toFixed(2)}.
                  </span>
                </div>
              )}

              {/* Coupon Engine input */}
              <div className="space-y-1">
                {appliedCouponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedCouponCode} applied</span>
                      <span className="text-emerald-700 font-bold tabular-nums">
                        (-${discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p
                    className={`text-[11px] ${
                      couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Authoritative Financial Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    ${cart.subtotal.toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-medium tabular-nums">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    ${cart.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    ${cart.tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-orange-600 tabular-nums">
                    ${Math.max(0, cart.grandTotal - discountAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="px-3 py-2 text-stone-500 hover:text-stone-800 text-xs font-medium rounded-lg border border-stone-200 hover:bg-white"
                >
                  Clear Bag
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  disabled={Boolean(remainingForMinOrder)}
                  className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
