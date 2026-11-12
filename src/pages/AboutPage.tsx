import React from 'react';
import { ChefHat, Award, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
          Our Culinary Philosophy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
          Redefining Gastronomy at Home
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          FoodFusion 2.0 was founded on a simple conviction: delivery should never compromise the integrity, flavor profile, or artistic presentation of fine artisanal food.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <ChefHat className="w-6 h-6 text-orange-600" />
          <h3 className="text-sm font-bold text-stone-900">Independent Masters Only</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Every kitchen on FoodFusion undergoes rigorous culinary evaluation. We champion executive chefs, heritage trattorias, and independent smokehouses over industrial ghost kitchens.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <Award className="w-6 h-6 text-orange-600" />
          <h3 className="text-sm font-bold text-stone-900">Fair Merchant Economics</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Unlike predatory aggregators, our platform takes a modest commission, allowing local restaurant owners to invest in superior organic ingredients and dignified staff wages.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <ShieldCheck className="w-6 h-6 text-orange-600" />
          <h3 className="text-sm font-bold text-stone-900">Verified Review Transparency</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Zero fake reviews. Only patrons who have actually placed, paid for, and received an order can post community ratings.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <HeartHandshake className="w-6 h-6 text-orange-600" />
          <h3 className="text-sm font-bold text-stone-900">Temperature-Controlled Couriers</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Our couriers use custom thermal carriers designed specifically for Neapolitan pizza crust preservation and delicate sushi refrigeration.
          </p>
        </div>
      </div>

      <div className="p-8 bg-stone-900 text-white rounded-3xl text-center space-y-4">
        <h3 className="text-lg font-bold font-display">Own an Exceptional Culinary Establishment?</h3>
        <p className="text-xs text-stone-400 max-w-md mx-auto">
          Join FoodFusion 2.0 as a restaurant partner. Submit your application today for prompt administrative review.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Partner With Us
        </button>
      </div>
    </div>
  );
};
