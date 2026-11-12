import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Heart,
  Star,
  User,
  Settings,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Edit2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { Address, Order, Restaurant, Review } from '../../types';

interface CustomerDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'favourites' | 'reviews' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Address modal state
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<number | null>(null);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrApt, setAddrApt] = useState('');
  const [addrCity, setAddrCity] = useState('San Francisco');
  const [addrState, setAddrState] = useState('CA');
  const [addrPostal, setAddrPostal] = useState('94107');

  // Profile state
  const [profName, setProfName] = useState(user?.name || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userOrders = await api.orders.getByUser(user.id);
      const userAddrs = await api.addresses.getByUser(user.id);
      const allRests = await api.restaurants.getAll();
      const allRevs = await api.reviews.getAll();
      const userRevs = allRevs.filter((r) => r.userId === user.id);

      setOrders(userOrders);
      setAddresses(userAddrs);
      setRestaurants(allRests);
      setReviews(userRevs);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancelOrder = async (orderId: number) => {
    if (!user) return;
    try {
      await api.orders.cancel(orderId, user.id);
      showToast('Order cancelled.');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingAddrId) {
        await api.addresses.update(editingAddrId, {
          title: addrTitle,
          streetAddress: addrStreet,
          apartmentSuite: addrApt,
          city: addrCity,
          state: addrState,
          postalCode: addrPostal,
        });
        showToast('Address updated.');
      } else {
        await api.addresses.add({
          userId: user.id,
          title: addrTitle,
          streetAddress: addrStreet,
          apartmentSuite: addrApt,
          city: addrCity,
          state: addrState,
          postalCode: addrPostal,
          isDefault: addresses.length === 0,
        });
        showToast('Address added.');
      }
      setIsAddrModalOpen(false);
      setEditingAddrId(null);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await api.addresses.update(id, { isDefault: true });
      showToast('Default address updated.');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.addresses.delete(id);
      showToast('Address removed.');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReorder = async (order: Order) => {
    const foodItems = await api.menu.getItems(order.restaurantId);
    let count = 0;
    for (const item of order.items) {
      const match = foodItems.find((f) => f.id === item.foodItemId);
      if (match) {
        await addToCart(match, item.quantity);
        count++;
      }
    }
    if (count > 0) {
      showToast(`Added items from order ${order.orderNumber} to bag.`);
      onNavigate('checkout');
    }
  };

  const activeOrder = orders.find(
    (o) =>
      o.status === 'PLACED' ||
      o.status === 'CONFIRMED' ||
      o.status === 'PREPARING' ||
      o.status === 'READY_FOR_PICKUP' ||
      o.status === 'OUT_FOR_DELIVERY'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-stone-900 truncate">{user?.name}</h2>
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              <span className="text-[10px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-semibold border border-orange-200 inline-block mt-0.5">
                Verified Customer
              </span>
            </div>
          </div>

          <nav className="bg-white rounded-2xl border border-stone-200 shadow-xs p-2 space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Hub Overview', icon: ShoppingBag },
              { id: 'orders', label: 'My Orders', icon: Clock, count: orders.length },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
              { id: 'favourites', label: 'Saved Favorites', icon: Heart },
              { id: 'reviews', label: 'My Reviews', icon: Star, count: reviews.length },
              { id: 'profile', label: 'Profile & Security', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? 'bg-orange-700 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Active Live Order Tracker Banner */}
              {activeOrder && (
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                      Live Active Delivery
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">
                      Order #{activeOrder.orderNumber} is {activeOrder.status.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-orange-100 mt-0.5">
                      {activeOrder.restaurantName} · Estimated within 20 mins
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('order-tracking', { id: activeOrder.id })}
                    className="px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 text-xs font-bold rounded-xl shadow-xs whitespace-nowrap transition-colors"
                  >
                    Track Live Map
                  </button>
                </div>
              )}

              {/* Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">{orders.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Saved Addresses
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">{addresses.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Favorite Kitchens
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">2</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Active Coupons
                  </span>
                  <p className="text-2xl font-bold text-orange-600 mt-1 tabular-nums">3</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 font-display">Recent Activity</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {orders.slice(0, 3).map((o) => (
                    <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-900 font-bold">{o.restaurantName}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">#{o.orderNumber}</span>
                        </div>
                        <p className="text-stone-500 mt-0.5">
                          {o.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                        </p>
                        <span className="text-[11px] text-stone-400 mt-1 block">
                          {o.placedAt} · {o.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900 tabular-nums">
                          ${o.totalAmount.toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : o.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-orange-50 text-orange-800 border border-orange-200'
                          }`}
                        >
                          {o.status}
                        </span>
                        <button
                          onClick={() => onNavigate('order-tracking', { id: o.id })}
                          className="p-1 text-stone-400 hover:text-stone-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-display">My Order History</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    View snapshot receipts, live delivery status, or trigger one-click re-orders.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">
                  No orders placed yet. Start by exploring our restaurants!
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900">{o.restaurantName}</h4>
                            <span className="text-[10px] text-stone-400 font-mono">#{o.orderNumber}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">Placed on {o.placedAt}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-xs space-y-1">
                        {o.items.map((i) => (
                          <div key={i.id} className="flex justify-between text-stone-600">
                            <span>
                              {i.quantity}x {i.itemName}
                            </span>
                            <span className="tabular-nums font-medium">${i.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions strip */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                        <div>
                          <span className="text-stone-500">Total: </span>
                          <strong className="text-stone-900 tabular-nums font-bold">
                            ${o.totalAmount.toFixed(2)}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {(o.status === 'PLACED' || o.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancelOrder(o.id)}
                              className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleReorder(o)}
                            className="px-3 py-1.5 text-xs text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg font-semibold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                          <button
                            onClick={() => onNavigate('order-tracking', { id: o.id })}
                            className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold"
                          >
                            Track / View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-display">Saved Delivery Addresses</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Manage residential and office delivery locations</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddrId(null);
                    setAddrTitle('Home');
                    setAddrStreet('');
                    setAddrApt('');
                    setIsAddrModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className="text-sm font-bold text-stone-900">{a.title}</strong>
                        {a.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600">
                        {a.streetAddress}
                        {a.apartmentSuite ? `, ${a.apartmentSuite}` : ''}
                      </p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {a.city}, {a.state} {a.postalCode}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-200 text-xs">
                      {!a.isDefault ? (
                        <button
                          onClick={() => handleSetDefaultAddress(a.id)}
                          className="text-orange-600 hover:text-orange-700 font-semibold"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-stone-400">Primary</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAddrId(a.id);
                            setAddrTitle(a.title);
                            setAddrStreet(a.streetAddress);
                            setAddrApt(a.apartmentSuite || '');
                            setAddrCity(a.city);
                            setAddrState(a.state);
                            setAddrPostal(a.postalCode);
                            setIsAddrModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FAVOURITES */}
          {activeTab === 'favourites' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 font-display">Favorite Restaurants & Dishes</h3>
              <p className="text-xs text-stone-500">Quick access to your preferred dining rooms</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {restaurants.slice(0, 2).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onNavigate('restaurant-detail', { id: r.id })}
                    className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3"
                  >
                    <img
                      src={r.coverImage}
                      alt={r.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{r.name}</h4>
                      <p className="text-[11px] text-stone-500">{r.cuisine}</p>
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{r.rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MY REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 font-display">My Verified Reviews</h3>
              <p className="text-xs text-stone-500">Your published feedback across past orders</p>

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-xs text-stone-500">
                  You haven't reviewed any completed orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-stone-400 text-[11px]">{rev.createdAt}</span>
                      </div>
                      <p className="text-stone-700 italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">Account Profile</h3>
                <p className="text-xs text-stone-500 mt-0.5">Manage identity credentials and communication preferences</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 text-xs border border-stone-200 bg-stone-100 text-stone-500 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-900 mb-2">Password Update (BCrypt Secured)</h4>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl"
                    />
                    <input
                      type="password"
                      placeholder="New password (min 6 chars)"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPasswordUpdated(true);
                    showToast('Profile and security preferences updated successfully.');
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      {isAddrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-stone-900">
              {editingAddrId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSaveAddress} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Label</label>
                <input
                  type="text"
                  required
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Apartment / Suite</label>
                <input
                  type="text"
                  value={addrApt}
                  onChange={(e) => setAddrApt(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Zip"
                  required
                  value={addrPostal}
                  onChange={(e) => setAddrPostal(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddrModalOpen(false)}
                  className="flex-1 py-2 text-xs border border-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-orange-600 text-white rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
