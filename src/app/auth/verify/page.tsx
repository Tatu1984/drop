'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useStore';
import { maskPhone } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { phone, otpSent, setUser } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if OTP not sent
  useEffect(() => {
    if (!otpSent) {
      router.push('/auth');
    }
  }, [otpSent, router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpValue: string) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpValue, type: 'user' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store token in localStorage for API calls
      if (data.data?.token) {
        localStorage.setItem('auth-token', data.data.token);
      }

      // Set user in store
      if (data.data?.user) {
        setUser({
          id: data.data.user.id,
          phone: data.data.user.phone,
          name: data.data.user.name || 'User',
          email: data.data.user.email,
          avatar: data.data.user.avatar,
          isKycVerified: data.data.user.isKycVerified || false,
          isAgeVerified: data.data.user.isAgeVerified || false,
          preferredLanguage: data.data.user.preferredLanguage || 'en',
          cuisinePreferences: data.data.user.cuisinePreferences || [],
          groceryBrands: data.data.user.groceryBrands || [],
          alcoholPreferences: data.data.user.alcoholPreferences || [],
        });
      }

      toast.success(data.data?.isNewUser ? 'Welcome to Drop!' : 'Welcome back!');
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'user' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setResendTimer(30);
      toast.success('OTP resent successfully!');

      // In development, show OTP for testing
      if (data.data?.otp) {
        toast(`Dev OTP: ${data.data.otp}`, { icon: '🔑', duration: 10000 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend OTP';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      {/* Content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verify your number
        </h1>
        <p className="text-gray-500 mb-8">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-gray-700">
            +91 {maskPhone(phone)}
          </span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center mb-8">
          {resendTimer > 0 ? (
            <p className="text-gray-500">
              Resend OTP in{' '}
              <span className="font-medium text-gray-700">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="flex items-center gap-2 text-orange-500 font-medium mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Resend OTP
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          fullWidth
          loading={isLoading}
          disabled={otp.some((digit) => !digit)}
          onClick={() => handleVerify(otp.join(''))}
        >
          Verify & Continue
        </Button>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          Didn&apos;t receive the code?{' '}
          <a href="/help" className="text-orange-500">
            Get help
          </a>
        </p>
      </div>
    </div>
  );
}
