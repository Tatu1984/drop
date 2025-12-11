'use client';

import { useState } from 'react';
import { ArrowLeft, Star, Gift, TrendingUp, ChevronRight, Award, Zap } from 'lucide-react';
import Link from 'next/link';
import { useWalletStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const rewards = [
  {
    id: '1',
    name: '₹50 Off on next order',
    points: 500,
    type: 'discount',
    description: 'Get ₹50 off on orders above ₹200',
  },
  {
    id: '2',
    name: 'Free Delivery',
    points: 300,
    type: 'delivery',
    description: 'Free delivery on your next order',
  },
  {
    id: '3',
    name: '₹100 Wallet Credit',
    points: 1000,
    type: 'wallet',
    description: 'Add ₹100 to your wallet instantly',
  },
  {
    id: '4',
    name: 'Premium Dessert Free',
    points: 800,
    type: 'food',
    description: 'Get a free premium dessert with any order',
  },
];

const tiers = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, color: 'from-amber-600 to-amber-800', benefits: ['1 point per ₹10 spent', 'Birthday bonus'] },
  { name: 'Silver', minPoints: 1000, maxPoints: 4999, color: 'from-gray-400 to-gray-600', benefits: ['1.5x points', 'Priority support', 'Exclusive offers'] },
  { name: 'Gold', minPoints: 5000, maxPoints: 9999, color: 'from-yellow-400 to-yellow-600', benefits: ['2x points', 'Free deliveries', 'Early access'] },
  { name: 'Platinum', minPoints: 10000, maxPoints: Infinity, color: 'from-purple-400 to-purple-600', benefits: ['3x points', 'Personal concierge', 'VIP events'] },
];

const pointsHistory = [
  { id: '1', description: 'Order #1234', points: 50, type: 'earned', date: '2024-01-15' },
  { id: '2', description: 'Redeemed ₹50 Off', points: -500, type: 'redeemed', date: '2024-01-14' },
  { id: '3', description: 'Order #1230', points: 75, type: 'earned', date: '2024-01-13' },
  { id: '4', description: 'Referral Bonus', points: 200, type: 'bonus', date: '2024-01-10' },
  { id: '5', description: 'Order #1225', points: 120, type: 'earned', date: '2024-01-08' },
];

export default function LoyaltyPage() {
  const { loyaltyPoints } = useWalletStore();
  const currentPoints = loyaltyPoints?.points || 1250;
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);

  const currentTier = tiers.find(t => currentPoints >= t.minPoints && currentPoints <= t.maxPoints) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressToNext = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const handleRedeem = () => {
    if (!selectedReward) return;
    if (currentPoints < selectedReward.points) {
      toast.error('Not enough points');
      return;
    }
    toast.success(`Redeemed ${selectedReward.name}!`);
    setShowRedeemModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Loyalty Points</h1>
      </div>

      {/* Points Card */}
      <div className="p-4">
        <Card className={`bg-gradient-to-br ${currentTier.color} text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Available Points</p>
              <p className="text-4xl font-bold">{currentPoints.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white mb-1">
                {currentTier.name}
              </Badge>
              <Award className="h-10 w-10 mx-auto" />
            </div>
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-sm text-white/80 mb-1">
                <span>{currentPoints} pts</span>
                <span>{nextTier.minPoints} pts to {nextTier.name}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card hoverable className="text-center" onClick={() => setShowRedeemModal(true)}>
            <Gift className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Redeem</p>
          </Card>
          <Link href="/profile/loyalty/history">
            <Card hoverable className="text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">History</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Redeem Rewards</h2>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward) => (
            <Card
              key={reward.id}
              hoverable
              padding="sm"
              onClick={() => {
                setSelectedReward(reward);
                setShowRedeemModal(true);
              }}
              className={currentPoints < reward.points ? 'opacity-50' : ''}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-500">{reward.points} pts</span>
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{reward.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Benefits</h2>
        <Card padding="none">
          {currentTier.benefits.map((benefit, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 ${
                index !== currentTier.benefits.length - 1 ? 'border-b' : ''
              }`}
            >
              <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/profile/loyalty/history" className="text-orange-500 text-sm">
            View All
          </Link>
        </div>
        <Card padding="none">
          {pointsHistory.slice(0, 3).map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 ${
                index !== 2 ? 'border-b' : ''
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
              <span
                className={`font-semibold ${
                  item.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.points > 0 ? '+' : ''}{item.points} pts
              </span>
            </div>
          ))}
        </Card>
      </div>

      {/* Redeem Modal */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false);
          setSelectedReward(null);
        }}
        title="Redeem Reward"
      >
        {selectedReward ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {selectedReward.name}
            </h3>
            <p className="text-gray-500 mb-4">{selectedReward.description}</p>
            <p className="text-lg font-bold text-orange-500 mb-6">
              {selectedReward.points} points
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRedeemModal(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleRedeem}
                disabled={currentPoints < selectedReward.points}
              >
                Redeem
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <button
                key={reward.id}
                onClick={() => setSelectedReward(reward)}
                disabled={currentPoints < reward.points}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  currentPoints >= reward.points
                    ? 'border-gray-200 hover:border-orange-500'
                    : 'border-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{reward.name}</h3>
                    <p className="text-sm text-gray-500">{reward.description}</p>
                  </div>
                  <Badge variant="warning">{reward.points} pts</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
