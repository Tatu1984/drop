'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Truck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/useStore';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = {
  phone: '9876543210',
  password: 'rider123',
  name: 'Demo Rider',
  id: 'rider-1',
};

export default function RiderLoginPage() {
  const router = useRouter();
  const { setRiderUser } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (phone === DEMO_CREDENTIALS.phone && password === DEMO_CREDENTIALS.password) {
      setRiderUser({
        id: DEMO_CREDENTIALS.id,
        phone: DEMO_CREDENTIALS.phone,
        name: DEMO_CREDENTIALS.name,
        isAuthenticated: true,
        isVerified: true,
        status: 'active',
      });
      toast.success('Welcome back!');
      router.push('/rider');
    } else {
      toast.error('Invalid credentials. Try: 9876543210 / rider123');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-red-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-orange-500 font-bold text-2xl">D</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-xl">Drop Rider</h1>
              <p className="text-sm text-white/80">Delivery Partner</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Earn on Your Own Schedule
          </h2>
          <p className="text-white/80 text-lg">
            Join our fleet of delivery partners and earn competitive pay with flexible hours.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Rider Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">₹</div>
                <span>Earn up to ₹25,000/month</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Truck className="h-4 w-4" />
                </div>
                <span>Weekly payouts</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">24</div>
                <span>Work anytime, anywhere</span>
              </div>
            </div>
          </div>

          <div className="text-white/60 text-sm">
            <p>Demo Credentials:</p>
            <p>Phone: 9876543210</p>
            <p>Password: rider123</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Rider Login</h1>
            <p className="text-gray-500">Sign in to start delivering</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rider Login</h2>
              <p className="text-gray-500">Sign in to your rider account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-orange-500 hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" fullWidth loading={isLoading}>
                Sign In <ArrowRight className="h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                New to Drop?{' '}
                <Link href="/rider/onboarding" className="text-orange-500 font-medium hover:underline">
                  Become a rider
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
