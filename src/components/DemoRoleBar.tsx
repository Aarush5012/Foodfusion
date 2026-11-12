import React from 'react';
import { ShieldCheck, Store, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleName } from '../types';

interface DemoRoleBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = ({ currentView, onNavigate }) => {
  const { user, switchRole } = useAuth();

  const handleRoleSelect = async (role: RoleName, destination: string) => {
    await switchRole(role);
    onNavigate(destination);
  };

  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-orange-400">DEMO QUICK-ROLE SWITCHER</span>
          <span className="text-stone-500 hidden sm:inline">·</span>
          <span className="text-stone-400 hidden sm:inline">
            Active: <strong className="text-white">{user?.name}</strong> ({user?.role.replace('ROLE_', '')})
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleRoleSelect('ROLE_CUSTOMER', 'dashboard-customer')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              user?.role === 'ROLE_CUSTOMER' && currentView.startsWith('dashboard')
                ? 'bg-orange-500 text-white font-medium'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </button>

          <button
            onClick={() => handleRoleSelect('ROLE_RESTAURANT_OWNER', 'dashboard-owner')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              user?.role === 'ROLE_RESTAURANT_OWNER' && currentView.startsWith('dashboard')
                ? 'bg-orange-500 text-white font-medium'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Restaurant Owner View</span>
          </button>

          <button
            onClick={() => handleRoleSelect('ROLE_ADMIN', 'dashboard-admin')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              user?.role === 'ROLE_ADMIN' && currentView.startsWith('dashboard')
                ? 'bg-orange-500 text-white font-medium'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
