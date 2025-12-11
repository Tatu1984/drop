'use client';

import { useState } from 'react';
import { ArrowLeft, Copy, Share2, Gift, Users, Wallet, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const referralHistory = [
  { id: '1', name: 'Rahul Sharma', status: 'completed', reward: 100, date: '2024-01-15' },
  { id: '2', name: 'Priya Patel', status: 'pending', reward: 100, date: '2024-01-14' },
  { id: '3', name: 'Amit Kumar', status: 'completed', reward: 100, date: '2024-01-10' },
];

const steps = [
  { icon: Share2, title: 'Share your code', description: 'Share your unique referral code with friends' },
  { icon: Users, title: 'Friend signs up', description: 'They sign up using your code' },
  { icon: Gift, title: 'Both get rewarded', description: 'You both get ₹100 in wallet' },
];

export default function ReferralPage() {
  const referralCode = 'DROP100XYZ';
  const [copied, setCopied] = useState(false);

  const totalEarned = referralHistory.filter(r => r.status === 'completed').reduce((acc, r) => acc + r.reward, 0);
  const totalReferrals = referralHistory.length;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    const shareData = {
      title: 'Join Drop!',
      text: `Use my referral code ${referralCode} to get ₹100 off your first order on Drop!`,
      url: `https://drop.app/referral/${referralCode}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyCode();
      }
    } catch {
      copyCode();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Refer & Earn</h1>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-4 py-8 text-center">
        <Gift className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Invite Friends, Earn ₹100</h2>
        <p className="text-white/80">
          Share your referral code and get ₹100 when they complete their first order
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6 relative z-10">
        <Card>
          <div className="grid grid-cols-2 divide-x">
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
              <p className="text-sm text-gray-500">Friends Referred</p>
            </div>
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-green-600">₹{totalEarned}</p>
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Referral Code */}
      <div className="px-4 mt-6">
        <Card>
          <p className="text-sm text-gray-500 text-center mb-3">Your Referral Code</p>
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-4">
            <span className="flex-1 text-xl font-bold text-center tracking-widest">
              {referralCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 bg-white rounded-lg shadow-sm"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
          <Button fullWidth className="mt-4" onClick={shareCode}>
            <Share2 className="h-4 w-4" />
            Share with Friends
          </Button>
        </Card>
      </div>

      {/* How it works */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">How it works</h2>
        <Card padding="none">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 ${
                index !== steps.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <step.icon className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Referral History */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Referral History</h2>
        {referralHistory.length > 0 ? (
          <Card padding="none">
            {referralHistory.map((referral, index) => (
              <div
                key={referral.id}
                className={`flex items-center gap-3 p-4 ${
                  index !== referralHistory.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {referral.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{referral.name}</p>
                  <p className="text-xs text-gray-500">{referral.date}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={referral.status === 'completed' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {referral.status === 'completed' ? 'Earned' : 'Pending'}
                  </Badge>
                  {referral.status === 'completed' && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      +₹{referral.reward}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start sharing to earn rewards
            </p>
          </Card>
        )}
      </div>

      {/* Terms */}
      <div className="px-4 mt-6">
        <p className="text-xs text-gray-400 text-center">
          * Referral rewards are credited after your friend completes their first order.
          Terms and conditions apply.
        </p>
      </div>
    </div>
  );
}
