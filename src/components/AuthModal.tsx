import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Store, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { RoleName } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const { showToast } = useNotification();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleName>('ROLE_CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Signed in successfully.');
        onSuccess();
        onClose();
      } else if (mode === 'register') {
        const msg = await register(name, email, password, phone, selectedRole);
        showToast(msg);
        if (selectedRole === 'ROLE_RESTAURANT_OWNER') {
          setMode('login');
        } else {
          onSuccess();
          onClose();
        }
      } else if (mode === 'forgot') {
        setForgotSubmitted(true);
        showToast('Password reset link simulated and sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'customer' | 'owner' | 'admin') => {
    if (role === 'customer') {
      setEmail('customer@foodfusion.com');
      setPassword('Password123!');
    } else if (role === 'owner') {
      setEmail('owner@bistrogood.com');
      setPassword('Password123!');
    } else {
      setEmail('admin@foodfusion.com');
      setPassword('Password123!');
    }
    setMode('login');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {mode === 'login' && 'Sign in to FoodFusion'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === 'login' && 'Access customer orders or merchant dashboards'}
              {mode === 'register' && 'Join thousands of food lovers & culinary partners'}
              {mode === 'forgot' && 'Enter your registered email address'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Credentials Bar */}
        {mode === 'login' && (
          <div className="my-3.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
              Quick 1-Click Demo Accounts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('customer')}
                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800 transition-colors"
              >
                Customer (Sarah)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('owner')}
                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800 transition-colors"
              >
                Owner (Marco)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800 transition-colors"
              >
                Admin (Executive)
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {forgotSubmitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Check your inbox</h4>
            <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
              We have dispatched a secure password reset link to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => {
                setForgotSubmitted(false);
                setMode('login');
              }}
              className="mt-5 px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            {mode === 'register' && (
              <>
                {/* Account Type Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ROLE_CUSTOMER')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                      selectedRole === 'ROLE_CUSTOMER'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ROLE_RESTAURANT_OWNER')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                      selectedRole === 'ROLE_RESTAURANT_OWNER'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Restaurant Owner</span>
                  </button>
                </div>

                {selectedRole === 'ROLE_RESTAURANT_OWNER' && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Notice:</strong> Restaurant owner registration remains pending until approved by a platform administrator.
                  </p>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-stone-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Complete Registration' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Mode Switchers */}
        <div className="mt-4 pt-3 border-t border-stone-100 text-center text-xs text-stone-600">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="font-bold text-orange-600 hover:text-orange-700"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="font-bold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
