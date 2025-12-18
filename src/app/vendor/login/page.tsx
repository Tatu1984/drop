'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Store, ArrowRight, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = {
  vendor: { email: 'vendor@drop.com', password: 'vendor123', name: 'Demo Restaurant', id: 'vendor-1' },
};

export default function VendorLoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/vendor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginMethod === 'email' ? email : undefined,
          phone: loginMethod === 'phone' ? phone : undefined,
          password,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store token and vendor info
        localStorage.setItem('vendor-token', data.data.token);
        localStorage.setItem('vendorAuth', JSON.stringify({
          id: data.data.vendor.id,
          name: data.data.vendor.name,
          email: data.data.vendor.email,
          phone: data.data.vendor.phone,
          isAuthenticated: true,
        }));

        toast.success(data.message || 'Welcome back!');
        router.push('/vendor/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-green-600 font-bold text-2xl">D</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-xl">Drop Partner</h1>
              <p className="text-sm text-white/80">Vendor Portal</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Grow Your Business With Drop
          </h2>
          <p className="text-white/80 text-lg">
            Join thousands of restaurants and stores delivering to customers across India.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Why Partner With Us?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
                <span>Reach millions of customers</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">%</div>
                <span>Low commission rates</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">24</div>
                <span>24/7 partner support</span>
              </div>
            </div>
          </div>

          <div className="text-white/60 text-sm">
            <p>Demo Credentials:</p>
            <p>Email: vendor@drop.com</p>
            <p>Password: vendor123</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
            <p className="text-gray-500">Sign in to manage your store</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500">Sign in to your vendor account</p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === 'email' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === 'phone' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === 'email' ? (
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="vendor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-5 w-5" />}
                  required
                />
              ) : (
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-600">+91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    leftIcon={<Phone className="h-5 w-5" />}
                    className="flex-1"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-5 w-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-green-600 hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" fullWidth loading={isLoading}>
                Sign In <ArrowRight className="h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                New to Drop?{' '}
                <Link href="/vendor/onboarding" className="text-green-600 font-medium hover:underline">
                  Register your store
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
              Back to Drop Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
