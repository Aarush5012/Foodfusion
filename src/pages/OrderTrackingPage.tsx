import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  RotateCcw,
  Star,
  AlertTriangle,
  ArrowLeft,
  XCircle,
  Truck,
  ChefHat,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { Order, OrderStatus } from '../types';

interface OrderTrackingPageProps {
  orderId: number;
  onNavigate: (view: string, param?: any) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getById(orderId);
      setOrder(res);
    } catch (err: any) {
      showToast(err.message || 'Order not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center text-xs text-stone-500">
        Loading order details and tracking status...
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (!user) return;
    try {
      setCancelling(true);
      const updated = await api.orders.cancel(order.id, user.id);
      setOrder(updated);
      showToast('Order successfully cancelled.');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    const foodItems = await api.menu.getItems(order.restaurantId);
    let addedCount = 0;
    for (const item of order.items) {
      const match = foodItems.find((f) => f.id === item.foodItemId);
      if (match) {
        await addToCart(match, item.quantity);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      showToast(`Added ${addedCount} items back to your bag.`);
      onNavigate('checkout');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.reviews.add({
        orderId: order.id,
        userId: user.id,
        userName: user.name,
        restaurantId: order.restaurantId,
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast('Review submitted! Thank you for your feedback.');
      setShowReviewModal(false);
      setReviewComment('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const steps: { key: OrderStatus; label: string; icon: any }[] = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'In the Kitchen', icon: ChefHat },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Courier', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: ShoppingBag },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (order.status === 'CANCELLED' || order.status === 'REJECTED') return 'inactive';

    const orderStatusOrder: OrderStatus[] = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    const currentIndex = orderStatusOrder.indexOf(order.status);
    const stepIndex = orderStatusOrder.indexOf(stepKey);

    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <button
          onClick={() => onNavigate('dashboard-customer')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </button>

        <span className="font-mono text-xs font-bold text-stone-500">
          Order ID: <strong className="text-stone-900">{order.orderNumber}</strong>
        </span>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              {order.restaurantName}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display mt-0.5">
              {order.status === 'DELIVERED' && 'Delivered & Enjoyed'}
              {order.status === 'CANCELLED' && 'Order Cancelled'}
              {order.status === 'REJECTED' && 'Order Declined by Kitchen'}
              {order.status === 'PLACED' && 'Order Placed — Awaiting Kitchen'}
              {order.status === 'CONFIRMED' && 'Order Confirmed by Chef'}
              {order.status === 'PREPARING' && 'Freshly Preparing in Kitchen'}
              {order.status === 'READY_FOR_PICKUP' && 'Packaged & Waiting for Courier'}
              {order.status === 'OUT_FOR_DELIVERY' && 'Courier on the Way to You'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">Placed on {order.placedAt}</p>
          </div>

          <div className="flex items-center gap-2">
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}

            {order.status === 'DELIVERED' && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Rate & Review</span>
              </button>
            )}

            <button
              onClick={handleReorder}
              className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reorder</span>
            </button>
          </div>
        </div>

        {/* Timeline visualization */}
        {order.status !== 'CANCELLED' && order.status !== 'REJECTED' ? (
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {steps.map((step, idx) => {
                const status = getStepStatus(step.key);
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                      status === 'completed'
                        ? 'bg-orange-50/70 border-orange-300 text-orange-950 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        status === 'completed'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] leading-tight">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">This order was {order.status.toLowerCase()}</p>
              {order.rejectionReason && (
                <p className="text-[11px] text-rose-700 mt-0.5">Reason: {order.rejectionReason}</p>
              )}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
          {/* Items Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Itemized Items Snapshot
            </h3>
            <div className="space-y-2 divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="pt-2 flex justify-between items-start text-xs">
                  <div>
                    <span className="font-semibold text-stone-900">
                      {item.quantity}x {item.itemName}
                    </span>
                    <span className="text-stone-400 text-[11px] block">
                      ${item.unitPrice.toFixed(2)} each
                    </span>
                    {item.specialInstructions && (
                      <span className="text-orange-700 text-[10px] italic">
                        "{item.specialInstructions}"
                      </span>
                    )}
                  </div>
                  <strong className="text-stone-900 tabular-nums">
                    ${item.totalPrice.toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Billing Snapshot */}
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Delivery Destination
              </h3>
              <div className="flex items-start gap-2 text-stone-700">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </div>
              {order.orderNotes && (
                <p className="text-stone-500 text-[11px] italic">Notes: "{order.orderNotes}"</p>
              )}
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="tabular-nums">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({order.couponCode})</span>
                  <span className="tabular-nums">-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="tabular-nums">${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Sales Tax</span>
                <span className="tabular-nums">${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-stone-200 pt-1.5 flex justify-between font-bold text-stone-900 text-sm">
                <span>Total Paid</span>
                <span className="text-orange-600 tabular-nums">${order.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-stone-400 pt-1">
                Payment: {order.paymentMethod.replace(/_/g, ' ')} ({order.paymentStatus})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-stone-900">
              Review your meal from {order.restaurantName}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Your feedback is verified and helps culinary chefs maintain excellence.
            </p>

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          num <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Written Review
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell others what you loved about the texture, presentation, flavor, or delivery speed..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 text-xs border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Post Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
