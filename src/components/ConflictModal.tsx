import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ConflictModal: React.FC = () => {
  const { conflictItem, setConflictItem, confirmClearAndAdd, cart } = useCart();

  if (!conflictItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-stone-900 text-center">
          Order from one restaurant at a time
        </h3>

        <p className="text-xs text-stone-600 text-center mt-2 leading-relaxed">
          Your cart currently contains items from <strong>{cart.restaurantName}</strong>. You are trying to add{' '}
          <strong>{conflictItem.item.name}</strong> from a different kitchen.
        </p>

        <p className="text-[11px] text-stone-500 text-center mt-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
          Would you like to clear your current cart and start a new order with this item?
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setConflictItem(null)}
            className="flex-1 py-2 px-3 border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-xl transition-colors"
          >
            Keep Existing Cart
          </button>
          <button
            onClick={confirmClearAndAdd}
            className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Clear & Add New Item
          </button>
        </div>
      </div>
    </div>
  );
};
