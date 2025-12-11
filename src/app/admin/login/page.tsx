'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('admin-token', data.data.token);

        // Update auth store
        setAdminUser({
          id: data.data.admin.id,
          email: data.data.admin.email,
          name: data.data.admin.name,
          role: data.data.admin.role.toLowerCase() as 'superadmin' | 'admin' | 'manager',
          isAuthenticated: true,
        });

        toast.success(`Welcome back, ${data.data.admin.name}!`);
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid email or password');
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to server');
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/10" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">D</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Drop</h1>
              <p className="text-orange-400">Admin Portal</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Manage Your Delivery Empire
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Complete control over users, vendors, riders, orders, and analytics - all in one powerful dashboard.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Lock className="h-5 w-5 text-orange-400" />
              </div>
              <span>Secure authentication</span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4">Login Credentials</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Admin:</span>
                <span className="text-gray-300">admin@drop.com / admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Drop</h1>
              <p className="text-orange-400 text-sm">Admin Portal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Sign in to access admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@drop.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-orange-500 hover:text-orange-600">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" fullWidth loading={isLoading}>
                Sign In
              </Button>
            </form>

            {/* Mobile Demo Credentials */}
            <div className="lg:hidden mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Demo: admin@drop.com / admin123</p>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Protected by Drop Security
          </p>
        </div>
      </div>
    </div>
  );
}
