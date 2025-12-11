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
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo, accept any 6-digit OTP
    if (otpValue.length === 6) {
      // Create mock user
      setUser({
        id: 'user-1',
        phone: phone,
        name: 'User',
        isKycVerified: false,
        isAgeVerified: false,
        preferredLanguage: 'en',
        cuisinePreferences: [],
        groceryBrands: [],
        alcoholPreferences: [],
      });
      toast.success('Login successful!');
      router.push('/');
    } else {
      toast.error('Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setResendTimer(30);
    toast.success('OTP resent successfully!');
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
