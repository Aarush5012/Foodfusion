import React, { useEffect, useState } from 'react';
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Tag,
  ArrowRight,
  Plus,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { Address } from '../types';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const { cart, appliedCouponCode, discountAmount, applyCoupon, removeCoupon } = useCart();
  const { showToast } = useNotification();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newApt, setNewApt] = useState('');
  const [newCity, setNewCity] = useState('San Francisco');
  const [newState, setNewState] = useState('CA');
  const [newPostal, setNewPostal] = useState('94107');

  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CARD_PAYMENT_SIMULATED'>('CASH_ON_DELIVERY');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  useEffect(() => {
    async function loadAddresses() {
      if (user) {
        const list = await api.addresses.getByUser(user.id);
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setIsAddingAddress(true);
        }
      }
    }
    loadAddresses();
  }, [user]);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-display">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500">Add gourmet meals from our artisan kitchens before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const added = await api.addresses.add({
        userId: user.id,
        title: newTitle,
        streetAddress: newStreet,
        apartmentSuite: newApt,
        city: newCity,
        state: newState,
        postalCode: newPostal,
        isDefault: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, added]);
      setSelectedAddressId(added.id);
      setIsAddingAddress(false);
      showToast('Delivery address saved.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) {
      onOpenAuth('login');
      return;
    }

    let deliveryAddressString = 'San Francisco, CA';
    const chosenAddress = addresses.find((a) => a.id === selectedAddressId);
    if (chosenAddress) {
      deliveryAddressString = `${chosenAddress.streetAddress}${
        chosenAddress.apartmentSuite ? ', ' + chosenAddress.apartmentSuite : ''
      }, ${chosenAddress.city}, ${chosenAddress.state} ${chosenAddress.postalCode}`;
    }

    try {
      setIsSubmitting(true);
      const createdOrder = await api.orders.create({
        userId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        deliveryAddress: deliveryAddressString,
        paymentMethod,
        couponCode: appliedCouponCode || undefined,
        orderNotes,
      });

      showToast(`Order #${createdOrder.orderNumber} successfully placed!`);
      onNavigate('order-tracking', { id: createdOrder.id });
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalTotal = Math.max(0, cart.grandTotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-2 border-b border-stone-200 pb-4">
        <button
          onClick={() => onNavigate('home')}
          className="text-stone-400 hover:text-stone-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
          Checkout & Order Confirmation
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>1. Delivery Address</span>
              </div>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {isAddingAddress ? (
              <form onSubmit={handleCreateAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Home, Office, Apartment..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Apartment / Suite
                    </label>
                    <input
                      type="text"
                      placeholder="Apt 4B, Suite 100"
                      value={newApt}
                      onChange={(e) => setNewApt(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="742 Evergreen Terrace"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newPostal}
                      onChange={(e) => setNewPostal(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-3 py-1.5 border border-stone-300 text-stone-700 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-stone-900">{addr.title}</strong>
                      {selectedAddressId === addr.id && (
                        <Check className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <p className="text-stone-600 leading-snug">
                      {addr.streetAddress}
                      {addr.apartmentSuite ? `, ${addr.apartmentSuite}` : ''}
                    </p>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Banknote className="w-4 h-4 text-orange-600" />
              <span>2. Payment Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <strong className="text-stone-900">Cash on Delivery (Active)</strong>
                  </div>
                  {paymentMethod === 'CASH_ON_DELIVERY' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Pay securely upon arrival. No card needed upfront.
                </p>
              </div>

              <div
                onClick={() => setPaymentMethod('CARD_PAYMENT_SIMULATED')}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  paymentMethod === 'CARD_PAYMENT_SIMULATED'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-stone-600" />
                    <strong className="text-stone-900">Credit / Debit Card</strong>
                  </div>
                  {paymentMethod === 'CARD_PAYMENT_SIMULATED' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  <span className="text-orange-600 font-medium">Test Mode:</span> Simulated instant authorization.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Notes */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-stone-900">
              Special Delivery Notes / Gate Code
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Ring apartment 4B bell twice, leave at front porch..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Right column: Order Summary & Authoritative Totals */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Order Summary</h3>
              <p className="text-xs text-stone-500 mt-0.5">Kitchen: {cart.restaurantName}</p>
            </div>

            {/* Line items list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((i) => (
                <div key={i.id} className="flex justify-between items-center text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-stone-900">
                      {i.quantity}x {i.foodItem.name}
                    </span>
                    {i.specialInstructions && (
                      <p className="text-[10px] text-orange-700 italic">"{i.specialInstructions}"</p>
                    )}
                  </div>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    ${i.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Authoritative Financial Breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900 tabular-nums">${cart.subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCouponCode})</span>
                  <span className="tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span className="font-medium text-stone-900 tabular-nums">${cart.deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="font-medium text-stone-900 tabular-nums">${cart.tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-stone-200 pt-2 flex justify-between text-base font-bold text-stone-900">
                <span>Total Due</span>
                <span className="text-orange-600 tabular-nums">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !selectedAddressId}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Processing Transaction...' : 'Place Order & Pay with COD'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Transaction with Order Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
