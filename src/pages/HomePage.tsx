import React, { useState } from 'react';
import { Search, Star, Clock, ArrowRight, ShieldCheck, Sparkles, Check, ChevronRight } from 'lucide-react';
import { HERO_IMAGE } from '../services/mockData';
import { FoodItem, Restaurant } from '../types';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

interface HomePageProps {
  restaurants: Restaurant[];
  featuredDishes: FoodItem[];
  onNavigate: (view: string, param?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  restaurants,
  featuredDishes,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore', { search: searchQuery.trim() });
    } else {
      onNavigate('explore');
    }
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Copied coupon code ${code}!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      showToast('Thank you for subscribing to FoodFusion Culinary Notes.');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        {/* Background Image with Measured Contrast Scrim (§1.F) */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Artisanal food feast spread"
            className="w-full h-full object-cover opacity-35 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-900/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Artisan Dining & Delivery 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl font-display text-white" style={{ textWrap: 'balance' }}>
            Exceptional culinary masters, delivered to your table.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
            Experience hand-rolled pasta, wood-fired Neapolitan pizza, flame-smoked barbecue, and pristine Kaiseki sushi from San Francisco's most distinguished kitchens.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl w-full bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2 text-stone-900"
          >
            <div className="flex-1 flex items-center gap-3 pl-3">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or artisan dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder:text-stone-400 text-stone-900"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors whitespace-nowrap"
            >
              Find Food
            </button>
          </form>

          {/* Quick Cuisine Filters */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-300">
            <span className="text-stone-400">Popular:</span>
            {['Italian', 'American / Grill', 'Japanese / Sushi', 'Healthy / Bowls'].map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => onNavigate('explore', { cuisine })}
                className="px-3 py-1 bg-stone-800/80 hover:bg-stone-700 rounded-lg border border-stone-700/60 transition-colors"
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Food Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-display">Explore by Cuisine</h2>
            <p className="text-xs text-stone-500 mt-0.5">Handpicked categories crafted by verified master chefs</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Artisan Italian', count: '14 Dishes', tag: 'Italian', img: '/src/assets/images/restaurant_bella_italia_1794473599291.jpg' },
            { name: 'Smokehouse BBQ', count: '9 Dishes', tag: 'American / Grill', img: '/src/assets/images/restaurant_urban_flame_1794473600379.jpg' },
            { name: 'Kaiseki Sushi', count: '12 Dishes', tag: 'Japanese / Sushi', img: '/src/assets/images/restaurant_sakura_sushi_1794473601280.jpg' },
            { name: 'Organic Bowls', count: '8 Dishes', tag: 'Healthy / Bowls', img: '/src/assets/images/restaurant_verde_harvest_1794473600993.jpg' },
          ].map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate('explore', { cuisine: cat.tag })}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-stone-200 cursor-pointer transition-all aspect-4/3"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="font-bold text-sm leading-tight text-white">{cat.name}</h3>
                <span className="text-[11px] text-stone-300 mt-0.5">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-display">Featured Restaurants</h2>
            <p className="text-xs text-stone-500 mt-0.5">Premier dining establishments accepting delivery and pickup</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>See Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((rest) => (
            <div
              key={rest.id}
              onClick={() => onNavigate('restaurant-detail', { id: rest.id })}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={rest.coverImage}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg text-xs font-bold text-stone-900 flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="tabular-nums">{rest.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                    {rest.cuisine}
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 mt-0.5 group-hover:text-orange-600 transition-colors">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {rest.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{rest.estimatedDeliveryMinutes} mins</span>
                  </div>
                  <div>
                    <span>Delivery: </span>
                    <span className="font-semibold text-stone-900 tabular-nums">
                      ${rest.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Dishes Spotlight */}
      <section className="bg-stone-100/70 py-12 border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-stone-900 font-display">Popular Dishes Today</h2>
            <p className="text-xs text-stone-500 mt-0.5">Most ordered gourmet specialties across San Francisco</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDishes.slice(0, 4).map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between p-4"
              >
                <div>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {dish.isVegetarian && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-700/90 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                        VEG
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">{dish.name}</h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-900 tabular-nums">
                    ${dish.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(dish, 1)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers & Verified Coupons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Exclusive Savings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
              Live Verified Coupons & Promotions
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2">
              Apply coupon codes during checkout to enjoy authoritative discounts on eligible culinary orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { code: 'WELCOME20', label: '20% Off First Order', desc: 'Min order $25.00 · Max save $15.00' },
              { code: 'TASTY10', label: '$10 Flat Savings', desc: 'Valid on orders exceeding $40.00' },
              { code: 'BELLA15', label: '15% Off Bella Italia', desc: 'Exclusive Italian gourmet discount' },
            ].map((c) => (
              <div
                key={c.code}
                className="bg-stone-800/80 border border-stone-700 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 font-mono text-xs font-bold rounded-lg border border-orange-500/30">
                      {c.code}
                    </span>
                    <button
                      onClick={() => copyCoupon(c.code)}
                      className="text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedCode === c.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <span>Copy Code</span>
                      )}
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.label}</h4>
                  <p className="text-[11px] text-stone-400 mt-1">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How FoodFusion Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-stone-900 font-display">How FoodFusion Delivers Excellence</h2>
          <p className="text-xs text-stone-500 mt-1">From order placement to hot doorstep delivery with zero guesswork</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg font-display">
              01
            </div>
            <h3 className="text-sm font-bold text-stone-900">Select Handcrafted Menus</h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Explore authentic regional kitchens, browse verified ingredient lists, and customize cooking notes.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg font-display">
              02
            </div>
            <h3 className="text-sm font-bold text-stone-900">Live Status Tracking</h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Watch real-time status transitions from kitchen confirmation to pickup and doorstep courier delivery.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg font-display">
              03
            </div>
            <h3 className="text-sm font-bold text-stone-900">Honest Verified Reviews</h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Only verified customers who received their meals can rate and review, ensuring total community transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 rounded-2xl p-8 border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">FoodFusion Culinary Gazette</h3>
            <p className="text-xs text-stone-500 mt-1">Get weekly chef spotlights, seasonal secret dishes, and new promo drops.</p>
          </div>

          {newsletterSubscribed ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>You are subscribed to the Culinary Gazette!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="px-4 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-64"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xs"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
