import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { DemoRoleBar } from './components/DemoRoleBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ConflictModal } from './components/ConflictModal';
import { AuthModal } from './components/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

// Dashboards
import { CustomerDashboard } from './dashboards/customer/CustomerDashboard';
import { RestaurantOwnerDashboard } from './dashboards/owner/RestaurantOwnerDashboard';
import { AdminDashboard } from './dashboards/admin/AdminDashboard';

import { api } from './services/api';
import { Coupon, FoodItem, Restaurant } from './types';

function MainApp() {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<any>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Shared platform data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<FoodItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const loadData = async () => {
    try {
      const allRests = await api.restaurants.getAll();
      const allCoups = await api.coupons.getAll();
      const sampleDishList = await api.menu.getItems(1);
      const sampleDishList2 = await api.menu.getItems(2);
      const sampleDishList3 = await api.menu.getItems(3);
      const sampleDishList4 = await api.menu.getItems(4);

      setRestaurants(allRests);
      setCoupons(allCoups);
      setFeaturedDishes([...sampleDishList, ...sampleDishList2, ...sampleDishList3, ...sampleDishList4]);
    } catch (err) {
      console.error('Error fetching global initial data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNavigate = (view: string, param?: any) => {
    setCurrentView(view);
    setViewParam(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* 1-Click Demo Quick-Role Switcher */}
      <DemoRoleBar currentView={currentView} onNavigate={handleNavigate} />

      {/* Strict 3-zone Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            restaurants={restaurants}
            featuredDishes={featuredDishes}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'explore' && (
          <ExplorePage
            restaurants={restaurants}
            initialSearch={viewParam?.search || ''}
            initialCuisine={viewParam?.cuisine || 'All'}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'restaurant-detail' && (
          <RestaurantDetailPage
            restaurantId={viewParam?.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'order-tracking' && (
          <OrderTrackingPage
            orderId={viewParam?.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'offers' && (
          <OffersPage
            coupons={coupons}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentView === 'contact' && (
          <ContactPage />
        )}

        {/* Dashboards */}
        {currentView === 'dashboard-customer' && (
          <CustomerDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard-owner' && (
          <RestaurantOwnerDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard-admin' && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onBrowse={() => handleNavigate('explore')}
      />

      <ConflictModal />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (user?.role === 'ROLE_ADMIN') handleNavigate('dashboard-admin');
          else if (user?.role === 'ROLE_RESTAURANT_OWNER') handleNavigate('dashboard-owner');
          else handleNavigate('dashboard-customer');
        }}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
