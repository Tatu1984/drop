'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Gift,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Heart,
  Award,
  MessageSquare,
  TrendingUp,
  Edit,
  Eye,
  Send,
  Tag,
  Percent,
  CreditCard,
  Crown,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalVisits: number;
  totalSpent: number;
  avgOrderValue: number;
  lastVisit: Date;
  joinDate: Date;
  loyaltyPoints: number;
  tags: string[];
  preferences: string[];
  allergies: string[];
  birthday?: Date;
  anniversary?: Date;
  notes?: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  audience: string;
  sent: number;
  opened: number;
  converted: number;
  scheduledFor?: Date;
}

interface GiftCard {
  id: string;
  code: string;
  initialValue: number;
  currentBalance: number;
  purchasedBy: string;
  recipientName?: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
}

const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@email.com',
    phone: '+91 98765 43210',
    tier: 'PLATINUM',
    totalVisits: 45,
    totalSpent: 125000,
    avgOrderValue: 2778,
    lastVisit: new Date('2024-01-12'),
    joinDate: new Date('2022-06-15'),
    loyaltyPoints: 12500,
    tags: ['Regular', 'Wine Enthusiast', 'Business Dinners'],
    preferences: ['Corner Table', 'Quiet Area', 'Wine Pairing'],
    allergies: [],
    birthday: new Date('1985-03-22'),
    notes: 'Prefers table 12. Usually orders wine with dinner.',
  },
  {
    id: '2',
    name: 'Priya Kapoor',
    email: 'priya.k@email.com',
    phone: '+91 98765 43211',
    tier: 'GOLD',
    totalVisits: 28,
    totalSpent: 68000,
    avgOrderValue: 2428,
    lastVisit: new Date('2024-01-10'),
    joinDate: new Date('2023-02-20'),
    loyaltyPoints: 6800,
    tags: ['Vegetarian', 'Celebrates Here'],
    preferences: ['Vegetarian Menu', 'Garden View'],
    allergies: ['Nuts'],
    birthday: new Date('1990-08-14'),
    anniversary: new Date('2018-12-05'),
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@email.com',
    phone: '+91 98765 43212',
    tier: 'SILVER',
    totalVisits: 12,
    totalSpent: 28000,
    avgOrderValue: 2333,
    lastVisit: new Date('2024-01-05'),
    joinDate: new Date('2023-08-10'),
    loyaltyPoints: 2800,
    tags: ['Family Dining'],
    preferences: ['Kids Menu', 'High Chair'],
    allergies: ['Gluten'],
  },
  {
    id: '4',
    name: 'Anita Shah',
    email: 'anita.s@email.com',
    phone: '+91 98765 43213',
    tier: 'BRONZE',
    totalVisits: 5,
    totalSpent: 8500,
    avgOrderValue: 1700,
    lastVisit: new Date('2023-12-20'),
    joinDate: new Date('2023-10-15'),
    loyaltyPoints: 850,
    tags: ['New Guest'],
    preferences: [],
    allergies: [],
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Year Special Offer',
    type: 'EMAIL',
    status: 'COMPLETED',
    audience: 'All Guests',
    sent: 1250,
    opened: 485,
    converted: 72,
  },
  {
    id: '2',
    name: 'Birthday Month Discount',
    type: 'SMS',
    status: 'ACTIVE',
    audience: 'January Birthdays',
    sent: 45,
    opened: 42,
    converted: 18,
  },
  {
    id: '3',
    name: 'Valentine\'s Day Preview',
    type: 'EMAIL',
    status: 'SCHEDULED',
    audience: 'Gold & Platinum',
    sent: 0,
    opened: 0,
    converted: 0,
    scheduledFor: new Date('2024-02-01'),
  },
];

const mockGiftCards: GiftCard[] = [
  {
    id: '1',
    code: 'GC-2024-001',
    initialValue: 5000,
    currentBalance: 3200,
    purchasedBy: 'Arjun Mehta',
    recipientName: 'Vikram Mehta',
    status: 'ACTIVE',
    expiresAt: new Date('2024-06-15'),
    createdAt: new Date('2023-12-15'),
  },
  {
    id: '2',
    code: 'GC-2024-002',
    initialValue: 2000,
    currentBalance: 0,
    purchasedBy: 'Priya Kapoor',
    status: 'USED',
    expiresAt: new Date('2024-05-20'),
    createdAt: new Date('2023-11-20'),
  },
  {
    id: '3',
    code: 'GC-2024-003',
    initialValue: 3000,
    currentBalance: 3000,
    purchasedBy: 'Walk-in',
    recipientName: 'Corporate Gift',
    status: 'ACTIVE',
    expiresAt: new Date('2024-07-01'),
    createdAt: new Date('2024-01-01'),
  },
];

export default function GuestsPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'loyalty' | 'campaigns' | 'giftcards'>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showGuestModal, setShowGuestModal] = useState(false);

  const filteredGuests = mockGuests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.phone.includes(searchQuery);
    const matchesTier = tierFilter === 'all' || guest.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier: Guest['tier']) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      BRONZE: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🥉' },
      SILVER: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🥈' },
      GOLD: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🥇' },
      PLATINUM: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '👑' },
    };
    const style = styles[tier];
    return (
      <span className={`px-2 py-1 ${style.bg} ${style.text} rounded-full text-xs font-medium flex items-center gap-1`}>
        <span>{style.icon}</span> {tier}
      </span>
    );
  };

  const getCampaignStatusBadge = (status: Campaign['status']) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SCHEDULED: 'bg-blue-100 text-blue-700',
      ACTIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-purple-100 text-purple-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const getGiftCardStatusBadge = (status: GiftCard['status']) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      USED: 'bg-gray-100 text-gray-700',
      EXPIRED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const totalGuests = mockGuests.length;
  const platinumGuests = mockGuests.filter(g => g.tier === 'PLATINUM').length;
  const totalLoyaltyPoints = mockGuests.reduce((sum, g) => sum + g.loyaltyPoints, 0);
  const activeGiftCards = mockGiftCards.filter(gc => gc.status === 'ACTIVE').reduce((sum, gc) => sum + gc.currentBalance, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest CRM & Loyalty</h1>
          <p className="text-gray-600">Manage guests, loyalty programs, and marketing campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Campaign
          </Button>
          <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">VIP Members</p>
              <p className="text-2xl font-bold text-purple-600">{platinumGuests}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Loyalty Points</p>
              <p className="text-2xl font-bold text-orange-600">{totalLoyaltyPoints.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gift Card Balance</p>
              <p className="text-2xl font-bold text-green-600">₹{activeGiftCards.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'guests', label: 'Guest Directory', icon: Users },
              { id: 'loyalty', label: 'Loyalty Program', icon: Award },
              { id: 'campaigns', label: 'Campaigns', icon: Send },
              { id: 'giftcards', label: 'Gift Cards', icon: Gift },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="p-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Tiers</option>
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
              </select>
            </div>

            {/* Guests List */}
            <div className="space-y-3">
              {filteredGuests.map((guest) => (
                <div key={guest.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      guest.tier === 'PLATINUM' ? 'bg-purple-500' :
                      guest.tier === 'GOLD' ? 'bg-yellow-500' :
                      guest.tier === 'SILVER' ? 'bg-gray-400' : 'bg-amber-500'
                    }`}>
                      {guest.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Guest Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{guest.name}</h3>
                        {getTierBadge(guest.tier)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Visits:</span>
                          <span className="ml-1 font-medium text-gray-900">{guest.totalVisits}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Spent:</span>
                          <span className="ml-1 font-medium text-gray-900">₹{guest.totalSpent.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Points:</span>
                          <span className="ml-1 font-medium text-orange-600">{guest.loyaltyPoints.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Visit:</span>
                          <span className="ml-1 font-medium text-gray-900">{guest.lastVisit.toLocaleDateString()}</span>
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {guest.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {guest.allergies.length > 0 && guest.allergies.map((allergy, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            Allergy: {allergy}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === 'loyalty' && (
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tiers */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Loyalty Tiers</h3>
                <div className="space-y-3">
                  {[
                    { tier: 'PLATINUM', minSpend: 100000, benefits: ['20% off all orders', 'Priority reservations', 'Complimentary dessert', 'VIP events access'], members: 1 },
                    { tier: 'GOLD', minSpend: 50000, benefits: ['15% off all orders', 'Priority reservations', 'Birthday surprise'], members: 1 },
                    { tier: 'SILVER', minSpend: 20000, benefits: ['10% off all orders', 'Birthday discount'], members: 1 },
                    { tier: 'BRONZE', minSpend: 0, benefits: ['5% off all orders', 'Points on every order'], members: 1 },
                  ].map((tierInfo) => (
                    <div key={tierInfo.tier} className={`rounded-xl p-4 border-2 ${
                      tierInfo.tier === 'PLATINUM' ? 'border-purple-300 bg-purple-50' :
                      tierInfo.tier === 'GOLD' ? 'border-yellow-300 bg-yellow-50' :
                      tierInfo.tier === 'SILVER' ? 'border-gray-300 bg-gray-50' :
                      'border-amber-300 bg-amber-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{tierInfo.tier}</span>
                        <span className="text-sm text-gray-600">{tierInfo.members} members</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Min spend: ₹{tierInfo.minSpend.toLocaleString()}</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {tierInfo.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points Rules */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Points & Rewards</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Points per ₹100 spent</span>
                    <span className="font-bold text-orange-600">10 points</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Points value</span>
                    <span className="font-bold text-gray-900">100 pts = ₹10</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Minimum redemption</span>
                    <span className="font-bold text-gray-900">500 points</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700">Points expiry</span>
                    <span className="font-bold text-gray-900">12 months</span>
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mt-6 mb-3">Bonus Points Triggers</h4>
                <div className="space-y-2">
                  {[
                    { trigger: 'Birthday visit', points: 500 },
                    { trigger: 'Anniversary visit', points: 500 },
                    { trigger: 'Refer a friend', points: 1000 },
                    { trigger: 'Write a review', points: 200 },
                    { trigger: 'First visit', points: 300 },
                  ].map((bonus, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">{bonus.trigger}</span>
                      <span className="font-bold text-green-600">+{bonus.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Marketing Campaigns</h3>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
            <div className="space-y-3">
              {mockCampaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        {getCampaignStatusBadge(campaign.status)}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          campaign.type === 'EMAIL' ? 'bg-blue-100 text-blue-700' :
                          campaign.type === 'SMS' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {campaign.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Audience: {campaign.audience}</p>
                      {campaign.scheduledFor && (
                        <p className="text-sm text-blue-600 mt-1">
                          Scheduled for: {campaign.scheduledFor.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                  {campaign.sent > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Sent</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.sent}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Opened</p>
                        <p className="text-lg font-bold text-blue-600">{campaign.opened}</p>
                        <p className="text-xs text-gray-500">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Converted</p>
                        <p className="text-lg font-bold text-green-600">{campaign.converted}</p>
                        <p className="text-xs text-gray-500">{((campaign.converted / campaign.sent) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="text-lg font-bold text-orange-600">₹{(campaign.converted * 2500).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gift Cards Tab */}
        {activeTab === 'giftcards' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Gift Cards</h3>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Issue Gift Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-600">Active Cards Value</p>
                <p className="text-2xl font-bold text-green-700">₹{activeGiftCards.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600">Total Issued</p>
                <p className="text-2xl font-bold text-blue-700">{mockGiftCards.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Redeemed Value</p>
                <p className="text-2xl font-bold text-gray-700">₹{mockGiftCards.reduce((sum, gc) => sum + (gc.initialValue - gc.currentBalance), 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchased By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initial Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockGiftCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono font-medium text-gray-900">{card.code}</td>
                      <td className="px-4 py-4 text-gray-600">{card.purchasedBy}</td>
                      <td className="px-4 py-4 text-gray-600">{card.recipientName || '-'}</td>
                      <td className="px-4 py-4 text-gray-900">₹{card.initialValue.toLocaleString()}</td>
                      <td className="px-4 py-4 font-medium text-green-600">₹{card.currentBalance.toLocaleString()}</td>
                      <td className="px-4 py-4">{getGiftCardStatusBadge(card.status)}</td>
                      <td className="px-4 py-4 text-gray-600">{card.expiresAt.toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <Button variant="outline" size="sm">View History</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
