import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  Truck,
  ChefHat,
  PackageCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { FoodItem, Order, OrderStatus, Restaurant } from '../../types';

interface RestaurantOwnerDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const RestaurantOwnerDashboard: React.FC<RestaurantOwnerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'restaurant' | 'menu' | 'orders' | 'analytics'>('overview');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit item modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('18.00');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategory, setItemCategory] = useState<number>(1);
  const [itemVeg, setItemVeg] = useState(false);
  const [itemAvail, setItemAvail] = useState(true);
  const [itemSpicy, setItemSpicy] = useState(0);
  const [itemImg, setItemImg] = useState('');

  // Reject order modal
  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const owned = await api.restaurants.getByOwnerId(user.id);
      setRestaurants(owned);

      if (owned.length > 0) {
        const primary = owned[0];
        setCurrentRestaurant(primary);
        const items = await api.menu.getItems(primary.id);
        const restOrders = await api.orders.getByRestaurant(primary.id);
        setMenuItems(items);
        setOrders(restOrders);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateRestaurantInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;
    try {
      const updated = await api.restaurants.update(currentRestaurant.id, {
        name: currentRestaurant.name,
        description: currentRestaurant.description,
        cuisine: currentRestaurant.cuisine,
        phone: currentRestaurant.phone,
        deliveryFee: currentRestaurant.deliveryFee,
        minOrderValue: currentRestaurant.minOrderValue,
        isOpen: currentRestaurant.isOpen,
        openingTime: currentRestaurant.openingTime,
        closingTime: currentRestaurant.closingTime,
      });
      setCurrentRestaurant(updated);
      showToast('Restaurant settings successfully updated.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;
    try {
      if (editingItemId) {
        await api.menu.updateItem(editingItemId, {
          name: itemName,
          price: parseFloat(itemPrice),
          description: itemDesc,
          isVegetarian: itemVeg,
          isAvailable: itemAvail,
          spicyLevel: itemSpicy,
          imageUrl: itemImg || currentRestaurant.coverImage,
        });
        showToast('Food item updated.');
      } else {
        await api.menu.addItem({
          restaurantId: currentRestaurant.id,
          categoryId: itemCategory,
          name: itemName,
          price: parseFloat(itemPrice),
          description: itemDesc,
          isVegetarian: itemVeg,
          isAvailable: itemAvail,
          isFeatured: false,
          preparationTimeMinutes: 15,
          spicyLevel: itemSpicy,
          imageUrl: itemImg || currentRestaurant.coverImage,
        });
        showToast('New food item added to menu.');
      }
      setIsItemModalOpen(false);
      setEditingItemId(null);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await api.menu.deleteItem(id);
      showToast('Item deleted from menu.');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleItemAvailability = async (item: FoodItem) => {
    try {
      await api.menu.updateItem(item.id, { isAvailable: !item.isAvailable });
      showToast(`${item.name} is now ${!item.isAvailable ? 'available' : 'marked sold out'}.`);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTransitionOrderStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await api.orders.updateStatus(orderId, nextStatus);
      showToast(`Order status updated to ${nextStatus.replace(/_/g, ' ')}.`);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleConfirmRejectOrder = async () => {
    if (!rejectOrderId) return;
    try {
      await api.orders.updateStatus(rejectOrderId, 'REJECTED', rejectReason || 'Kitchen at full capacity');
      showToast('Order rejected.');
      setRejectOrderId(null);
      setRejectReason('');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <Store className="w-12 h-12 text-stone-300 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-display">No Associated Restaurant</h2>
        <p className="text-xs text-stone-500">
          Your account is currently registered as a Restaurant Owner, but your restaurant listing is pending review by the platform administrator.
        </p>
      </div>
    );
  }

  // Authoritative calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
  );
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
              Merchant Operations
            </span>
            <h2 className="text-sm font-bold text-stone-900 leading-tight">{currentRestaurant.name}</h2>
            <p className="text-xs text-stone-500">{currentRestaurant.cuisine}</p>

            <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-xs">
              <span className="text-stone-500">Store Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRestaurant.isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {currentRestaurant.isOpen ? 'Accepting Orders' : 'Paused'}
              </span>
            </div>
          </div>

          <nav className="bg-white rounded-2xl border border-stone-200 shadow-xs p-2 space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview Analytics', icon: LayoutDashboard },
              { id: 'orders', label: 'Incoming Orders', icon: ShoppingBag, count: pendingOrders.length },
              { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed, count: menuItems.length },
              { id: 'restaurant', label: 'Kitchen Profile & Hours', icon: Store },
              { id: 'analytics', label: 'Revenue Trends', icon: TrendingUp },
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
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Pending Orders
                  </span>
                  <p className="text-2xl font-bold text-orange-600 mt-1 tabular-nums">
                    {pendingOrders.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Completed
                  </span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                    {completedOrders.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Active Dishes
                  </span>
                  <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                    {menuItems.filter((i) => i.isAvailable).length}
                  </p>
                </div>
              </div>

              {/* Today's Incoming Orders Feed */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Incoming Order Queue ({pendingOrders.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View All Orders
                  </button>
                </div>

                {pendingOrders.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">
                    All orders are completed! Kitchen is currently idle.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-stone-900 text-sm">#{o.orderNumber}</strong>
                            <span className="text-stone-500">· {o.customerName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {o.status}
                            </span>
                          </div>
                          <p className="text-stone-600 mt-1">
                            {o.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                          </p>
                          <span className="text-stone-400 text-[11px] mt-0.5 block">
                            Address: {o.deliveryAddress}
                          </span>
                        </div>

                        {/* Order Status Transition Controls */}
                        <div className="flex items-center gap-2">
                          {o.status === 'PLACED' && (
                            <>
                              <button
                                onClick={() => handleTransitionOrderStatus(o.id, 'CONFIRMED')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                              >
                                Accept Order
                              </button>
                              <button
                                onClick={() => setRejectOrderId(o.id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {o.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleTransitionOrderStatus(o.id, 'PREPARING')}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center gap-1"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Start Cooking</span>
                            </button>
                          )}
                          {o.status === 'PREPARING' && (
                            <button
                              onClick={() => handleTransitionOrderStatus(o.id, 'READY_FOR_PICKUP')}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Ready for Pickup</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INCOMING ORDERS FULL VIEW */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Order Management Pipeline
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Controlled lifecycle transitions: Accept → Preparing → Ready for Pickup → Out for Delivery → Delivered.
                </p>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-900 text-sm">#{o.orderNumber}</strong>
                          <span className="text-stone-600">· {o.customerName}</span>
                          <span className="text-[11px] text-stone-400">({o.customerPhone || 'No phone'})</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">Placed at {o.placedAt}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'CANCELLED' || o.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1">
                      {o.items.map((i) => (
                        <div key={i.id} className="flex justify-between text-stone-700">
                          <span>
                            {i.quantity}x {i.itemName}
                          </span>
                          <span className="tabular-nums font-semibold">${i.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {o.orderNotes && (
                        <p className="text-[11px] text-orange-800 italic pt-1">Notes: "{o.orderNotes}"</p>
                      )}
                    </div>

                    {/* Transition action buttons */}
                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-stone-900">
                        Total: <span className="tabular-nums">${o.totalAmount.toFixed(2)}</span> ({o.paymentMethod.replace(/_/g, ' ')})
                      </div>

                      <div className="flex items-center gap-2">
                        {o.status === 'PLACED' && (
                          <>
                            <button
                              onClick={() => handleTransitionOrderStatus(o.id, 'CONFIRMED')}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setRejectOrderId(o.id)}
                              className="px-2.5 py-1 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {o.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleTransitionOrderStatus(o.id, 'PREPARING')}
                            className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold"
                          >
                            Mark Preparing
                          </button>
                        )}
                        {o.status === 'PREPARING' && (
                          <button
                            onClick={() => handleTransitionOrderStatus(o.id, 'READY_FOR_PICKUP')}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold"
                          >
                            Mark Ready for Pickup
                          </button>
                        )}
                        {o.status === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() => handleTransitionOrderStatus(o.id, 'OUT_FOR_DELIVERY')}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold"
                          >
                            Hand to Courier (Out for Delivery)
                          </button>
                        )}
                        {o.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() => handleTransitionOrderStatus(o.id, 'DELIVERED')}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-display">Menu Offerings</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Add new culinary creations, adjust pricing, and toggle immediate availability.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingItemId(null);
                    setItemName('');
                    setItemPrice('18.00');
                    setItemDesc('');
                    setItemVeg(false);
                    setItemAvail(true);
                    setItemSpicy(0);
                    setItemImg(currentRestaurant.coverImage);
                    setIsItemModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex gap-3"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-stone-900 truncate">{item.name}</h4>
                          <span className="font-bold text-stone-900 tabular-nums">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-stone-500 text-[11px] line-clamp-1 mt-0.5">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-200/60">
                        <button
                          onClick={() => handleToggleItemAvailability(item)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isAvailable ? 'Available' : 'Paused'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setItemName(item.name);
                              setItemPrice(item.price.toString());
                              setItemDesc(item.description);
                              setItemVeg(item.isVegetarian);
                              setItemAvail(item.isAvailable);
                              setItemSpicy(item.spicyLevel || 0);
                              setItemImg(item.imageUrl);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESTAURANT PROFILE */}
          {activeTab === 'restaurant' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">Kitchen Profile & Settings</h3>
                <p className="text-xs text-stone-500 mt-0.5">Configure operational hours, delivery pricing, and capacity</p>
              </div>

              <form onSubmit={handleUpdateRestaurantInfo} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={currentRestaurant.name}
                    onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Cuisine Specialty</label>
                  <input
                    type="text"
                    required
                    value={currentRestaurant.cuisine}
                    onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, cuisine: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Culinary Description</label>
                  <textarea
                    rows={2}
                    value={currentRestaurant.description}
                    onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, description: e.target.value })}
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Fee ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={currentRestaurant.deliveryFee}
                      onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, deliveryFee: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Minimum Order ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={currentRestaurant.minOrderValue}
                      onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, minOrderValue: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Opening Time</label>
                    <input
                      type="text"
                      value={currentRestaurant.openingTime}
                      onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, openingTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Closing Time</label>
                    <input
                      type="text"
                      value={currentRestaurant.closingTime}
                      onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, closingTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Open/Close Toggle */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-bold text-stone-900 block">Accept Incoming Orders</strong>
                    <span className="text-[11px] text-stone-500">Toggle off to temporarily pause new customer orders</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentRestaurant.isOpen}
                    onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, isOpen: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Restaurant Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">Revenue & Sales Trends</h3>
                <p className="text-xs text-stone-500 mt-0.5">Authoritative transaction records and dish popularity</p>
              </div>

              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Top-Selling Dishes</h4>
                <div className="space-y-2">
                  {menuItems.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-stone-900">{item.name}</span>
                      </div>
                      <span className="font-bold text-stone-900 tabular-nums">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Food Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-stone-900">
              {editingItemId ? 'Edit Food Item' : 'Add New Dish to Menu'}
            </h3>
            <form onSubmit={handleSaveItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Burrata Gnocchi"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Spicy Level (0-3)</label>
                  <select
                    value={itemSpicy}
                    onChange={(e) => setItemSpicy(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg font-medium"
                  >
                    <option value={0}>0 - Mild / None</option>
                    <option value={1}>1 - Light Warmth</option>
                    <option value={2}>2 - Medium Heat</option>
                    <option value={3}>3 - Fiery Hot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ingredients, preparation method, culinary accents..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="Paste image URL or use default"
                  value={itemImg}
                  onChange={(e) => setItemImg(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemVeg}
                    onChange={(e) => setItemVeg(e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemAvail}
                    onChange={(e) => setItemAvail(e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <span>Available Now</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-2 text-xs border border-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-orange-600 text-white font-bold rounded-xl"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-sm font-bold text-stone-900">Decline Incoming Order</h3>
            <p className="text-xs text-stone-500 mt-1">Please provide a reason to notify the customer:</p>
            <input
              type="text"
              placeholder="e.g. Kitchen at full capacity, ingredient out of stock"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg mt-3"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRejectOrderId(null)}
                className="flex-1 py-1.5 text-xs border border-stone-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectOrder}
                className="flex-1 py-1.5 text-xs bg-rose-600 text-white rounded-lg font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
