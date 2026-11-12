import React from 'react';
import { ShoppingBag, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const getDashboardRoute = () => {
    if (!user) return 'home';
    if (user.role === 'ROLE_ADMIN') return 'dashboard-admin';
    if (user.role === 'ROLE_RESTAURANT_OWNER') return 'dashboard-owner';
    return 'dashboard-customer';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'ROLE_ADMIN') return 'Admin Dashboard';
    if (user.role === 'ROLE_RESTAURANT_OWNER') return 'Owner Portal';
    return 'Customer Hub';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span>FoodFusion</span>
          <span className="text-orange-600 font-extrabold text-xs ml-0.5 px-1.5 py-0.5 bg-orange-50 border border-orange-200 rounded">2.0</span>
        </button>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
              currentView === 'home' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
              currentView === 'explore' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            Explore Restaurants
          </button>
          <button
            onClick={() => onNavigate('offers')}
            className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
              currentView === 'offers' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            Coupons & Offers
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
              currentView === 'about' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            About FoodFusion
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
              currentView === 'contact' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action cluster: Cart + User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-stone-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-sm">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* User Profile / Dashboard dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-800 text-xs font-medium transition-colors"
              >
                <img
                  src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="max-w-[120px] truncate hidden sm:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-medium text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate(getDashboardRoute());
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-stone-400" />
                    <span>{getDashboardLabel()}</span>
                  </button>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                      onNavigate('home');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                Register
              </button>
            </div>
          )}

          {/* Direct Go To Dashboard CTA */}
          {isAuthenticated && (
            <button
              onClick={() => onNavigate(getDashboardRoute())}
              className="hidden lg:inline-flex px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              {getDashboardLabel()}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
