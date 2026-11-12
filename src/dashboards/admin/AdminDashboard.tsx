import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Tag,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Coupon, Order, Restaurant, Review, User } from '../../types';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'users' | 'orders' | 'coupons' | 'reviews' | 'reports'>('overview');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountVal, setDiscountVal] = useState('15');
  const [minOrder, setMinOrder] = useState('30');
  const [maxDiscount, setMaxDiscount] = useState('15');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const allUsers = await api.admin.getUsers();
      const allRests = await api.restaurants.getAll();
      const allOrds = await api.orders.getAll();
      const allCoups = await api.coupons.getAll();
      const allRevs = await api.reviews.getAll();

      // Include pending restaurants for admin review
      const rawRests = (api as any).restaurants.getAll ? await api.restaurants.getAll() : [];
      setUsersList(allUsers);
      setRestaurants(rawRests);
      setOrders(allOrds);
      setCoupons(allCoups);
      setReviews(allRevs);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const updated = await api.admin.toggleUserStatus(userId);
      showToast(`User ${updated.name} is now ${updated.status}.`);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleApproveRestaurant = async (restaurantId: number, ownerId: number) => {
    try {
      await api.restaurants.updateStatus(restaurantId, 'ACTIVE');
      await api.admin.approveOwner(ownerId);
      showToast('Restaurant and owner successfully approved for operations!');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSuspendRestaurant = async (restaurantId: number) => {
    try {
      await api.restaurants.updateStatus(restaurantId, 'SUSPENDED');
      showToast('Restaurant suspended.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleModerateReview = async (reviewId: number, approve: boolean) => {
    try {
      await api.reviews.moderate(reviewId, approve);
      showToast(approve ? 'Review approved.' : 'Review hidden from public.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.coupons.create({
        code: couponCode.trim().toUpperCase(),
        description: couponDesc,
        discountType,
        discountValue: parseFloat(discountVal),
        minOrderAmount: parseFloat(minOrder),
        maxDiscountAmount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        expiryDate: '2026-12-31',
        usageLimit: 1000,
        isActive: true,
      });
      showToast(`Coupon ${couponCode.toUpperCase()} created.`);
      setIsCouponModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCoupon = async (id: number) => {
    try {
      await api.coupons.toggleStatus(id);
      showToast('Coupon status updated.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Authoritative financial calculations
  const totalPlatformGmv = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingApprovalsCount = usersList.filter((u) => u.status === 'PENDING_APPROVAL').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
              Governance Portal
            </span>
            <h2 className="text-sm font-bold text-stone-900 leading-tight">Platform Administrator</h2>
            <p className="text-xs text-stone-500">Full Administrative Authority</p>
          </div>

          <nav className="bg-white rounded-2xl border border-stone-200 shadow-xs p-2 space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Platform Executive Overview', icon: LayoutDashboard },
              { id: 'restaurants', label: 'Restaurants & Approvals', icon: Store, count: pendingApprovalsCount },
              { id: 'users', label: 'User Directory', icon: Users, count: usersList.length },
              { id: 'orders', label: 'All Platform Orders', icon: ShoppingBag, count: orders.length },
              { id: 'coupons', label: 'Coupon Engine', icon: Tag, count: coupons.length },
              { id: 'reviews', label: 'Moderate Reviews', icon: MessageSquare, count: reviews.length },
              { id: 'reports', label: 'Financial CSV Reports', icon: FileSpreadsheet },
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

        {/* Main Panel */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Platform GMV
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                    ${totalPlatformGmv.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                    {orders.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Restaurants
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                    {restaurants.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Pending Onboarding
                  </span>
                  <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
                    {pendingApprovalsCount}
                  </p>
                </div>
              </div>

              {/* Pending Merchant Approvals Alert Box */}
              {pendingApprovalsCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      You have <strong>{pendingApprovalsCount} restaurant application(s)</strong> awaiting administrator approval.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-2xs whitespace-nowrap"
                  >
                    Review Now
                  </button>
                </div>
              )}

              {/* Platform Activity Feed */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 font-display">Recent Global Transactions</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">#{o.orderNumber}</span>
                        <span className="text-stone-500 ml-2">· {o.restaurantName}</span>
                        <span className="text-stone-400 ml-2 font-mono">({o.customerName})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 tabular-nums">
                          ${o.totalAmount.toFixed(2)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURANTS & APPROVALS */}
          {activeTab === 'restaurants' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">Restaurant Directory & Onboarding</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Approve or reject new merchant applications and monitor active restaurant stores.
                </p>
              </div>

              <div className="space-y-4">
                {restaurants.map((rest) => (
                  <div
                    key={rest.id}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={rest.coverImage}
                        alt={rest.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{rest.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rest.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rest.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rest.status}
                          </span>
                        </div>
                        <p className="text-stone-500 mt-0.5">{rest.cuisine} · {rest.city}</p>
                        <p className="text-stone-400 text-[11px] mt-0.5">
                          Min Order: ${rest.minOrderValue.toFixed(2)} · Delivery Fee: ${rest.deliveryFee.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rest.status === 'PENDING_APPROVAL' ? (
                        <button
                          onClick={() => handleApproveRestaurant(rest.id, rest.ownerId)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Listing</span>
                        </button>
                      ) : rest.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleSuspendRestaurant(rest.id)}
                          className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold"
                        >
                          Suspend Store
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveRestaurant(rest.id, rest.ownerId)}
                          className="px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">User Governance</h3>
                <p className="text-xs text-stone-500 mt-0.5">Manage Customers, Restaurant Owners, and Administrators</p>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {usersList.map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900">{u.name}</strong>
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </div>
                      <p className="text-stone-500 mt-0.5">{u.email} · {u.phone || 'No phone'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            u.status === 'ACTIVE'
                              ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-stone-900 font-display">All Platform Orders</h3>
                <span className="text-xs text-stone-500 font-mono">Count: {orders.length}</span>
              </div>

              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900">#{o.orderNumber}</strong>
                        <span className="text-stone-500">· {o.restaurantName}</span>
                        <span className="text-stone-400">({o.customerName})</span>
                      </div>
                      <p className="text-stone-500 mt-0.5">{o.placedAt} · {o.deliveryAddress}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-900 tabular-nums">
                        ${o.totalAmount.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-800">
                        {o.status}
                      </span>
                      <button
                        onClick={() => onNavigate('order-tracking', { id: o.id })}
                        className="text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-display">Coupon Engine</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Authoritative discount codes and minimum spend rules</p>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                          {c.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-stone-700 font-medium mt-1.5">{c.description}</p>
                      <p className="text-stone-400 text-[11px] mt-0.5">
                        Min Order: ${c.minOrderAmount.toFixed(2)} · Used: {c.usageCount} / {c.usageLimit}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleCoupon(c.id)}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                    >
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 font-display">User Review Moderation</h3>
              <p className="text-xs text-stone-500">Ensure platform reviews conform to community standards</p>

              <div className="space-y-3 pt-2">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900">{r.userName} · Rating: {r.rating} / 5</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-stone-700 italic">"{r.comment}"</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleModerateReview(r.id, !r.isApproved)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        {r.isApproved ? 'Hide Review' : 'Approve Review'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FINANCIAL REPORTS & CSV EXPORT */}
          {activeTab === 'reports' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">Financial Auditing & CSV Reporting</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Export transactional order data directly to CSV for external accounting and auditing.
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Platform Orders & Commission Report</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Includes order numbers, timestamps, restaurant names, subtotal, sales tax, delivery charges, and gross revenues.
                  </p>
                </div>

                <button
                  onClick={() => {
                    api.admin.exportOrdersCsv();
                    showToast('Exporting orders CSV report...');
                  }}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% off summer gourmet orders"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Max Save ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2 text-xs border border-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-orange-600 text-white font-bold rounded-xl"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
