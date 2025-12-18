'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/useStore';
import { validatePhone } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { phone, setPhone, setOtpSent } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'user' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      toast.success('OTP sent successfully!');

      // In development, show OTP for testing
      if (data.data?.otp) {
        toast(`Dev OTP: ${data.data.otp}`, { icon: '🔑', duration: 10000 });
      }

      router.push('/auth/verify');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-6">
          <span className="text-white text-4xl font-bold">D</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Drop</h1>
        <p className="text-gray-500 text-center">
          Food, Grocery & More Delivered
        </p>
      </div>

      {/* Login Form */}
      <div className="p-6 pb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Login or Sign up
        </h2>
        <p className="text-gray-500 mb-6">
          Enter your mobile number to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-600">+91</span>
            </div>
            <Input
              type="tel"
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={error}
              leftIcon={<Phone className="h-5 w-5" />}
              className="flex-1"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={phone.length !== 10}
          >
            Continue <ArrowRight className="h-5 w-5" />
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                or continue with
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => toast('Google login coming soon!', { icon: '🔜' })}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={20}
                height={20}
              />
              <span className="font-medium text-gray-700">Google</span>
            </button>
            <button
              onClick={() => toast('Apple login coming soon!', { icon: '🔜' })}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="font-medium text-gray-700">Apple</span>
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-orange-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-orange-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
