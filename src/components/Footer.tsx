import React from 'react';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-base tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              <span>FoodFusion</span>
              <span className="text-orange-500 text-xs ml-0.5">2.0</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Curated dining from verified culinary artisans and independent kitchens. Delivered with integrity and precision.
            </p>
            <div className="pt-2 text-[11px] text-stone-500">
              Spring Boot 3.3 · MySQL 8+ · React 19
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Explore Platform</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-white transition-colors">
                  All Restaurants
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offers')} className="hover:text-white transition-colors">
                  Promotions & Coupons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Culinary Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Merchant & Admin</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('dashboard-owner')} className="hover:text-white transition-colors">
                  Restaurant Owner Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard-admin')} className="hover:text-white transition-colors">
                  Platform Administration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard-customer')} className="hover:text-white transition-colors">
                  Customer Order Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">San Francisco HQ</h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>500 Howard Street, San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>+1 (800) 555-FUSION</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>concierge@foodfusion.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500">
          <p>© 2026 FoodFusion Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>for authentic gastronomy</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
