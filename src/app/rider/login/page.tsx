'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Truck, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export default function RiderLoginPage() {
  const router = useRouter();
  const { setRiderUser } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+91${phone}`,
          type: 'rider',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP sent successfully!');
        setShowOtpInput(true);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+91${phone}`,
          otp,
          type: 'rider',
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store token in localStorage
        localStorage.setItem('rider-token', data.data.token);

        // Update auth store
        setRiderUser({
          id: data.data.rider.id,
          phone: data.data.rider.phone,
          name: data.data.rider.name,
          isAuthenticated: true,
          isVerified: true,
          status: data.data.rider.status || 'active',
        });

        toast.success('Welcome back!');
        router.push('/rider');
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <p>Phone: Any 10-digit number</p>
            <p>OTP: 123456</p>
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

            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" fullWidth loading={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-600">+91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    leftIcon={<Phone className="h-5 w-5" />}
                    className="flex-1"
                    disabled
                  />
                </div>

                <Input
                  label="OTP"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  leftIcon={<Lock className="h-5 w-5" />}
                  required
                  disabled={isLoading}
                  maxLength={6}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp('');
                    }}
                    disabled={isLoading}
                  >
                    Change Number
                  </Button>
                  <Button type="submit" fullWidth loading={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify OTP <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-sm text-orange-500 hover:underline w-full text-center"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                New to Drop?{' '}
                <Link href="/rider/onboarding" className="text-orange-500 font-medium hover:underline">
                  Become a rider
                </Link>
              </p>
            </div>

            {/* Mobile Demo Credentials */}
            <div className="lg:hidden mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-800 mb-1">Demo Credentials</p>
              <p className="text-xs text-orange-700">Phone: Any 10-digit number | OTP: 123456</p>
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
