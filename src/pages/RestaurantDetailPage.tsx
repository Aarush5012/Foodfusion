import React, { useEffect, useState } from 'react';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  Plus,
  Minus,
  Check,
  Flame,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { FoodCategory, FoodItem, Restaurant, Review } from '../types';
import { useCart } from '../context/CartContext';

interface RestaurantDetailPageProps {
  restaurantId: number;
  onNavigate: (view: string, param?: any) => void;
}

export const RestaurantDetailPage: React.FC<RestaurantDetailPageProps> = ({
  restaurantId,
  onNavigate,
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
  const [selectedItemForModal, setSelectedItemForModal] = useState<FoodItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemInstructions, setItemInstructions] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const rest = await api.restaurants.getById(restaurantId);
        const cats = await api.menu.getCategories(restaurantId);
        const food = await api.menu.getItems(restaurantId);
        const revs = await api.reviews.getByRestaurant(restaurantId);

        setRestaurant(rest);
        setCategories(cats);
        setItems(food);
        setReviews(revs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [restaurantId]);

  if (loading || !restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-stone-500">
        Loading culinary menu...
      </div>
    );
  }

  const handleOpenItemModal = (item: FoodItem) => {
    setSelectedItemForModal(item);
    setItemQuantity(1);
    setItemInstructions('');
  };

  const handleConfirmAddToCart = async () => {
    if (!selectedItemForModal) return;
    const added = await addToCart(selectedItemForModal, itemQuantity, itemInstructions);
    if (added) {
      setSelectedItemForModal(null);
      setIsCartOpen(true);
    }
  };

  const filteredItems =
    activeCategoryId === 'all'
      ? items
      : items.filter((i) => i.categoryId === activeCategoryId);

  return (
    <div className="space-y-10 pb-20">
      {/* Restaurant Header Banner */}
      <div className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <button
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Restaurants</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {restaurant.cuisine}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-1">
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-2 leading-relaxed">
                {restaurant.description}
              </p>

              {/* Metadata strip */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-300">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">({restaurant.totalReviews} verified reviews)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span>{restaurant.estimatedDeliveryMinutes} min delivery</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span>{restaurant.address}, {restaurant.city}</span>
                </div>
              </div>
            </div>

            {/* Quick Order Info Card */}
            <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-4 text-xs space-y-1.5 shrink-0 min-w-[220px]">
              <div className="flex justify-between">
                <span className="text-stone-400">Delivery Fee:</span>
                <strong className="text-white tabular-nums">${restaurant.deliveryFee.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Min. Order:</span>
                <strong className="text-white tabular-nums">${restaurant.minOrderValue.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Hours:</span>
                <span className="text-stone-300">{restaurant.openingTime} - {restaurant.closingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Category Tabs & Food Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeCategoryId === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            All Menu Items ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeCategoryId === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div>
          <h2 className="text-lg font-bold text-stone-900 mb-4 font-display">
            {activeCategoryId === 'all'
              ? 'Complete Menu'
              : categories.find((c) => c.id === activeCategoryId)?.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between p-4"
              >
                <div>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.isVegetarian && (
                        <span className="px-2 py-0.5 bg-emerald-700/90 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                          VEG
                        </span>
                      )}
                      {item.spicyLevel && item.spicyLevel > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-700/90 text-white text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />
                          <span>Spicy</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-stone-900 leading-tight">{item.name}</h3>
                    <span className="text-sm font-bold text-stone-900 tabular-nums">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {item.calories && (
                    <span className="text-[11px] text-stone-400 mt-2 block">
                      {item.calories} kcal · {item.preparationTimeMinutes} min prep
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    {item.isAvailable ? 'Freshly Made' : 'Sold Out'}
                  </span>
                  <button
                    onClick={() => handleOpenItemModal(item)}
                    disabled={!item.isAvailable}
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-10 border-t border-stone-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-stone-900 font-display">Verified Customer Reviews</h2>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-stone-500">No reviews submitted for this kitchen yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-900">{r.userName}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-600 leading-relaxed italic">"{r.comment}"</p>
                  <span className="text-[10px] text-stone-400 mt-2 block">Verified Order · {r.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Customization & Add-to-Cart Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <img
              src={selectedItemForModal.imageUrl}
              alt={selectedItemForModal.name}
              className="w-full h-44 object-cover rounded-xl mb-3"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">{selectedItemForModal.name}</h3>
                <span className="text-sm font-bold text-orange-600 tabular-nums">
                  ${selectedItemForModal.price.toFixed(2)}
                </span>
              </div>
              {selectedItemForModal.isVegetarian && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Vegetarian
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">{selectedItemForModal.description}</p>

            {/* Special Instructions */}
            <div className="mt-4">
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Cooking or Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Extra sauce on side, allergies, spice preference..."
                value={itemInstructions}
                onChange={(e) => setItemInstructions(e.target.value)}
                className="w-full p-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700">Quantity</span>
              <div className="flex items-center gap-3 bg-stone-100 px-3 py-1 rounded-lg">
                <button
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-stone-600 hover:text-stone-900"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-stone-900 tabular-nums w-4 text-center">
                  {itemQuantity}
                </span>
                <button
                  onClick={() => setItemQuantity((q) => q + 1)}
                  className="p-1 text-stone-600 hover:text-stone-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="flex-1 py-2 px-3 border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Add (${(selectedItemForModal.price * itemQuantity).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
