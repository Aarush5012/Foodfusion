import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Filter, ArrowRight, Utensils } from 'lucide-react';
import { Restaurant } from '../types';

interface ExplorePageProps {
  restaurants: Restaurant[];
  initialSearch?: string;
  initialCuisine?: string;
  onNavigate: (view: string, param?: any) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  restaurants,
  initialSearch = '',
  initialCuisine = 'All',
  onNavigate,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [sortBy, setSortBy] = useState<'rating' | 'delivery' | 'minOrder'>('rating');

  const cuisines = ['All', 'Italian', 'American / Grill', 'Japanese / Sushi', 'Healthy / Bowls'];

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => r.status === 'ACTIVE')
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase());
        const matchesCuisine =
          selectedCuisine === 'All' || r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
        return matchesSearch && matchesCuisine;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'delivery') return a.estimatedDeliveryMinutes - b.estimatedDeliveryMinutes;
        if (sortBy === 'minOrder') return a.minOrderValue - b.minOrderValue;
        return 0;
      });
  }, [restaurants, search, selectedCuisine, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
          Explore Artisan Restaurants
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Browse verified independent kitchens, trattorias, sushi bars, and smokehouses across San Francisco.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by restaurant or culinary specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
            />
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-stone-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-stone-800"
            >
              <option value="rating">Top Rated (Verified)</option>
              <option value="delivery">Fastest Delivery Time</option>
              <option value="minOrder">Lowest Minimum Order</option>
            </select>
          </div>
        </div>

        {/* Cuisine Filter Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 pt-2">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCuisine === c
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant List Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No restaurants found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset the cuisine filter to view all available kitchens.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCuisine('All');
            }}
            className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              onClick={() => onNavigate('restaurant-detail', { id: rest.id })}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image Cover */}
                <div className="relative aspect-16/9 overflow-hidden bg-stone-100">
                  <img
                    src={rest.coverImage}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-stone-900 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums">{rest.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-stone-400 font-normal">({rest.totalReviews})</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                    {rest.isOpen ? 'Open Now' : 'Closed for Orders'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                    {rest.cuisine}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5 group-hover:text-orange-600 transition-colors">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {rest.description}
                  </p>

                  <div className="mt-3 text-[11px] text-stone-500">
                    <span>{rest.address}, {rest.city}</span>
                  </div>
                </div>
              </div>

              {/* Bottom metadata strip */}
              <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{rest.estimatedDeliveryMinutes} min prep & delivery</span>
                </div>
                <div>
                  <span>Min order: </span>
                  <strong className="text-stone-900 tabular-nums">${rest.minOrderValue.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
