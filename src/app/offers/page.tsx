'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Tag,
  Percent,
  Clock,
  Copy,
  Check,
  Gift,
  Zap,
  Utensils,
  Wine,
  ShoppingCart,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  minOrder: number;
  maxDiscount?: number;
  validTill: string;
  category: 'all' | 'food' | 'grocery' | 'wine';
  isNew?: boolean;
  usageLimit?: number;
  usedCount?: number;
}

const offers: Offer[] = [
  {
    id: '1',
    code: 'WELCOME50',
    title: '50% OFF on First Order',
    description: 'Get 50% off on your first order. Valid for new users only.',
    discount: '50%',
    minOrder: 199,
    maxDiscount: 150,
    validTill: '2024-12-31',
    category: 'all',
    isNew: true,
  },
  {
    id: '2',
    code: 'FOODIE30',
    title: '30% OFF on Food',
    description: 'Flat 30% off on all restaurant orders above Rs.299',
    discount: '30%',
    minOrder: 299,
    maxDiscount: 100,
    validTill: '2024-02-28',
    category: 'food',
  },
  {
    id: '3',
    code: 'GROCERY20',
    title: '20% OFF on Groceries',
    description: 'Save 20% on your grocery orders. Stock up and save!',
    discount: '20%',
    minOrder: 499,
    maxDiscount: 200,
    validTill: '2024-02-15',
    category: 'grocery',
  },
  {
    id: '4',
    code: 'WINE25',
    title: 'Rs.250 OFF on Wine',
    description: 'Flat Rs.250 off on wine & spirits. Age verification required.',
    discount: 'Rs.250',
    minOrder: 1499,
    validTill: '2024-02-20',
    category: 'wine',
  },
  {
    id: '5',
    code: 'FREEDELIVERY',
    title: 'Free Delivery',
    description: 'Free delivery on all orders above Rs.199',
    discount: 'Free Delivery',
    minOrder: 199,
    validTill: '2024-03-31',
    category: 'all',
  },
  {
    id: '6',
    code: 'WEEKEND40',
    title: '40% OFF Weekend Special',
    description: 'Extra 40% off on weekends. Valid only on Sat & Sun.',
    discount: '40%',
    minOrder: 399,
    maxDiscount: 150,
    validTill: '2024-02-29',
    category: 'food',
    isNew: true,
  },
];

const categories = [
  { id: 'all', label: 'All Offers', icon: Sparkles },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { id: 'wine', label: 'Wine', icon: Wine },
];

export default function OffersPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredOffers = offers.filter(
    (offer) => selectedCategory === 'all' || offer.category === selectedCategory || offer.category === 'all'
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-orange-100 text-orange-700';
      case 'grocery':
        return 'bg-green-100 text-green-700';
      case 'wine':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-green-600 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Offers & Coupons</h1>
          </div>
          <p className="text-green-100 text-sm">
            {filteredOffers.length} offers available for you
          </p>
        </header>

        {/* Category Tabs */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="flex overflow-x-auto gap-2 p-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Featured Banner */}
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">Limited Time</span>
                </div>
                <h3 className="text-xl font-bold mb-1">MEGA SALE</h3>
                <p className="text-sm opacity-90">Up to 60% off on selected items</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">60%</p>
                <p className="text-sm opacity-90">OFF</p>
              </div>
            </div>
          </Card>

          {/* Offers List */}
          {filteredOffers.map((offer) => (
            <Card key={offer.id} padding="none">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {offer.isNew && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        NEW
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(offer.category)}`}>
                      {offer.category.charAt(0).toUpperCase() + offer.category.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Till {new Date(offer.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Percent className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{offer.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>Min. order: Rs.{offer.minOrder}</span>
                      {offer.maxDiscount && <span>Max discount: Rs.{offer.maxDiscount}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="border-t border-dashed border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="font-mono font-bold text-green-600">{offer.code}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(offer.code)}
                  className="flex items-center gap-1"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}

          {filteredOffers.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No offers available in this category</p>
              </div>
            </Card>
          )}

          {/* Refer & Earn */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">Refer & Earn</h3>
                <p className="text-sm opacity-90">Invite friends and earn Rs.100 for each referral</p>
              </div>
              <button
                onClick={() => router.push('/profile/referral')}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </Card>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center py-4">
            *Terms and conditions apply. Offers subject to availability.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
