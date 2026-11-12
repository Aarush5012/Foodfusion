import React, { useState } from 'react';
import { Tag, Check, ArrowRight } from 'lucide-react';
import { Coupon } from '../types';
import { useNotification } from '../context/NotificationContext';

interface OffersPageProps {
  coupons: Coupon[];
  onNavigate: (view: string, param?: any) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ coupons, onNavigate }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast } = useNotification();

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-6">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
          Promotions & Vouchers
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display mt-1">
          Special Offers & Verified Coupons
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
          Apply these verified promotional codes in your bag or during checkout for authoritative discounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 font-mono text-xs font-bold rounded-lg border border-orange-200">
                  {c.code}
                </span>
                <span className="text-[10px] font-semibold text-stone-400">
                  Expires {c.expiryDate}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 mt-3">{c.description}</h3>
              <p className="text-xs text-stone-500 mt-1">
                Minimum order: <strong className="text-stone-800">${c.minOrderAmount.toFixed(2)}</strong>
                {c.maxDiscountAmount && ` · Max discount: $${c.maxDiscountAmount.toFixed(2)}`}
              </p>
              {c.restaurantName && (
                <span className="mt-2 inline-block text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  Exclusive to {c.restaurantName}
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => handleCopy(c.code)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <span>Copy Code</span>
                )}
              </button>

              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Use on Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
