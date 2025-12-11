'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Send, Calendar, Users, Tag, Bell, Mail, MessageSquare, TrendingUp, Gift, Percent, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  type: 'push' | 'sms' | 'email' | 'in_app';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  targetAudience: string;
  reach: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledAt?: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat' | 'free_delivery';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: 'active' | 'expired' | 'disabled';
  applicableTo: 'all' | 'food' | 'grocery' | 'wine' | 'new_users';
}

interface Referrer {
  name: string;
  referrals: number;
  conversions: number;
  earnings: number;
}

interface Segment {
  name: string;
  description: string;
  count: number;
  color: string;
}

interface MarketingData {
  campaigns: Campaign[];
  coupons: Coupon[];
  topReferrers: Referrer[];
  segments: Segment[];
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalReach: number;
    avgOpenRate: number;
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    avgUsageRate: number;
  };
  referralSettings: {
    referrerReward: number;
    referrerRewardType: string;
    refereeReward: number;
    refereeRewardType: string;
    minOrderForReferee: number;
    maxReferralsPerUser: number;
  };
}

export default function AdminMarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'push',
    targetAudience: 'All Users',
    title: '',
    body: '',
  });

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    usageLimit: 1000,
    validFrom: '',
    validTo: '',
    applicableTo: 'all',
  });

  const tabs = [
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'coupons', label: 'Coupons' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'segments', label: 'User Segments' },
  ];

  const fetchMarketing = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/marketing?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load marketing data');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMarketing();
  }, [fetchMarketing]);

  const createCampaign = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'create-campaign', ...campaignForm }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Campaign created!');
        setShowCampaignModal(false);
        setCampaignForm({ name: '', type: 'push', targetAudience: 'All Users', title: '', body: '' });
        fetchMarketing();
      } else {
        toast.error(result.error || 'Failed to create campaign');
      }
    } catch (err) {
      toast.error('Failed to create campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const createCoupon = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'create-coupon', ...couponForm }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Coupon created!');
        setShowCouponModal(false);
        setCouponForm({
          code: '',
          type: 'percentage',
          value: 0,
          minOrder: 0,
          maxDiscount: 0,
          usageLimit: 1000,
          validFrom: '',
          validTo: '',
          applicableTo: 'all',
        });
        fetchMarketing();
      } else {
        toast.error(result.error || 'Failed to create coupon');
      }
    } catch (err) {
      toast.error('Failed to create coupon');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete-campaign', campaignId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Campaign deleted');
        fetchMarketing();
      } else {
        toast.error(result.error || 'Failed to delete campaign');
      }
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete-coupon', couponId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Coupon deleted');
        fetchMarketing();
      } else {
        toast.error(result.error || 'Failed to delete coupon');
      }
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const saveReferralSettings = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'update-referral-settings', settings: data?.referralSettings }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Settings saved!');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      active: 'success',
      scheduled: 'info',
      completed: 'default',
      paused: 'warning',
      draft: 'default',
      expired: 'error',
      disabled: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getCampaignIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      push: Bell,
      sms: MessageSquare,
      email: Mail,
      in_app: Send,
    };
    const Icon = icons[type] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const campaigns = data?.campaigns || [];
  const coupons = data?.coupons || [];
  const topReferrers = data?.topReferrers || [];
  const segments = data?.segments || [];
  const stats = data?.stats || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReach: 0,
    avgOpenRate: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    avgUsageRate: 0,
  };
  const referralSettings = data?.referralSettings || {
    referrerReward: 100,
    referrerRewardType: 'Wallet Credit',
    refereeReward: 50,
    refereeRewardType: 'Wallet Credit',
    minOrderForReferee: 200,
    maxReferralsPerUser: 10,
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Marketing & CRM">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reach</p>
                <p className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Coupons</p>
                <p className="text-2xl font-bold">{stats.activeCoupons}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Open Rate</p>
                <p className="text-2xl font-bold">{stats.avgOpenRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border">
          <div className="border-b px-4 flex items-center justify-between">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <Button variant="outline" onClick={fetchMarketing} loading={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            {loading && !data ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                {activeTab === 'campaigns' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex-1 min-w-[200px] max-w-md">
                        <Input
                          placeholder="Search campaigns..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                        />
                      </div>
                      <Button onClick={() => setShowCampaignModal(true)}>
                        <Plus className="h-4 w-4" />
                        New Campaign
                      </Button>
                    </div>

                    {filteredCampaigns.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No campaigns found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Campaign</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reach</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CTR</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredCampaigns.map((campaign) => (
                              <tr key={campaign.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                  <p className="font-medium">{campaign.name}</p>
                                  <p className="text-xs text-gray-500">{campaign.targetAudience}</p>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    {getCampaignIcon(campaign.type)}
                                    <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">{getStatusBadge(campaign.status)}</td>
                                <td className="px-4 py-4">{campaign.reach.toLocaleString()}</td>
                                <td className="px-4 py-4">
                                  {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                                </td>
                                <td className="px-4 py-4">
                                  {campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0}%
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                      <Edit2 className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <button
                                      className="p-2 hover:bg-gray-100 rounded"
                                      onClick={() => deleteCampaign(campaign.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex-1 min-w-[200px] max-w-md">
                        <Input
                          placeholder="Search coupons..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                        />
                      </div>
                      <Button onClick={() => setShowCouponModal(true)}>
                        <Plus className="h-4 w-4" />
                        New Coupon
                      </Button>
                    </div>

                    {filteredCoupons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No coupons found</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCoupons.map((coupon) => (
                          <Card key={coupon.id} className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500 transform rotate-45 translate-x-8 -translate-y-8" />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    {coupon.type === 'percentage' && <Percent className="h-5 w-5 text-orange-500" />}
                                    {coupon.type === 'flat' && <Tag className="h-5 w-5 text-orange-500" />}
                                    {coupon.type === 'free_delivery' && <Gift className="h-5 w-5 text-orange-500" />}
                                    <span className="font-bold text-lg">{coupon.code}</span>
                                  </div>
                                  {getStatusBadge(coupon.status)}
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-orange-500">
                                    {coupon.type === 'percentage' ? `${coupon.value}%` :
                                     coupon.type === 'flat' ? `₹${coupon.value}` : 'FREE'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {coupon.type === 'free_delivery' ? 'Delivery' : 'OFF'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>Min Order</span>
                                  <span>₹{coupon.minOrder}</span>
                                </div>
                                {coupon.maxDiscount && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Max Discount</span>
                                    <span>₹{coupon.maxDiscount}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                  <span>Usage</span>
                                  <span>{coupon.usedCount}/{coupon.usageLimit}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Valid: {coupon.validFrom}</span>
                                  <span>to {coupon.validTo}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" fullWidth>
                                  <Edit2 className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                  className="text-red-600"
                                  onClick={() => deleteCoupon(coupon.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'referrals' && (
                  <div className="space-y-6">
                    <Card>
                      <h3 className="font-semibold mb-4">Referral Program Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Referrer Reward
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={referralSettings.referrerReward}
                              onChange={(e) => {
                                if (data) {
                                  setData({
                                    ...data,
                                    referralSettings: {
                                      ...referralSettings,
                                      referrerReward: Number(e.target.value),
                                    },
                                  });
                                }
                              }}
                            />
                            <select
                              className="px-4 py-2 border rounded-lg"
                              value={referralSettings.referrerRewardType}
                              onChange={(e) => {
                                if (data) {
                                  setData({
                                    ...data,
                                    referralSettings: {
                                      ...referralSettings,
                                      referrerRewardType: e.target.value,
                                    },
                                  });
                                }
                              }}
                            >
                              <option>Wallet Credit</option>
                              <option>Loyalty Points</option>
                              <option>Coupon</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Referee Reward
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={referralSettings.refereeReward}
                              onChange={(e) => {
                                if (data) {
                                  setData({
                                    ...data,
                                    referralSettings: {
                                      ...referralSettings,
                                      refereeReward: Number(e.target.value),
                                    },
                                  });
                                }
                              }}
                            />
                            <select
                              className="px-4 py-2 border rounded-lg"
                              value={referralSettings.refereeRewardType}
                              onChange={(e) => {
                                if (data) {
                                  setData({
                                    ...data,
                                    referralSettings: {
                                      ...referralSettings,
                                      refereeRewardType: e.target.value,
                                    },
                                  });
                                }
                              }}
                            >
                              <option>Wallet Credit</option>
                              <option>Loyalty Points</option>
                              <option>Coupon</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Order for Referee
                          </label>
                          <Input
                            type="number"
                            value={referralSettings.minOrderForReferee}
                            onChange={(e) => {
                              if (data) {
                                setData({
                                  ...data,
                                  referralSettings: {
                                    ...referralSettings,
                                    minOrderForReferee: Number(e.target.value),
                                  },
                                });
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Referrals per User
                          </label>
                          <Input
                            type="number"
                            value={referralSettings.maxReferralsPerUser}
                            onChange={(e) => {
                              if (data) {
                                setData({
                                  ...data,
                                  referralSettings: {
                                    ...referralSettings,
                                    maxReferralsPerUser: Number(e.target.value),
                                  },
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button onClick={saveReferralSettings}>Save Settings</Button>
                      </div>
                    </Card>

                    <Card padding="none">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">Top Referrers</h3>
                      </div>
                      {topReferrers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No referral data yet</div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Referrals</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Conversions</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Earnings</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {topReferrers.map((user, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                <td className="px-4 py-3">{user.referrals}</td>
                                <td className="px-4 py-3">{user.conversions}</td>
                                <td className="px-4 py-3">₹{user.earnings}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </Card>
                  </div>
                )}

                {activeTab === 'segments' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Create user segments for targeted marketing</p>
                      <Button>
                        <Plus className="h-4 w-4" />
                        New Segment
                      </Button>
                    </div>

                    {segments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No segments created yet</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {segments.map((segment, idx) => (
                          <Card key={idx}>
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 bg-${segment.color}-100 rounded-lg flex items-center justify-center`}>
                                <Users className={`h-5 w-5 text-${segment.color}-600`} />
                              </div>
                              <Badge variant="default">{segment.count.toLocaleString()} users</Badge>
                            </div>
                            <h4 className="font-semibold">{segment.name}</h4>
                            <p className="text-sm text-gray-500 mb-4">{segment.description}</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" fullWidth>View</Button>
                              <Button size="sm" fullWidth>Target</Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Campaign Modal */}
      <Modal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title="Create New Campaign"
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="Enter campaign name"
            value={campaignForm.name}
            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={campaignForm.type}
              onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
            >
              <option value="push">Push Notification</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-App Message</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={campaignForm.targetAudience}
              onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
            >
              <option>All Users</option>
              <option>New Users</option>
              <option>High Value Users</option>
              <option>Inactive Users</option>
            </select>
          </div>
          <Input
            label="Message Title"
            placeholder="Enter message title"
            value={campaignForm.title}
            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
              placeholder="Enter your message..."
              value={campaignForm.body}
              onChange={(e) => setCampaignForm({ ...campaignForm, body: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowCampaignModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={createCampaign} loading={actionLoading}>
              Create Campaign
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Coupon Modal */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="Create New Coupon"
      >
        <div className="space-y-4">
          <Input
            label="Coupon Code"
            placeholder="e.g., SAVE50"
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={couponForm.type}
              onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
              <option value="free_delivery">Free Delivery</option>
            </select>
          </div>
          <Input
            label="Discount Value"
            type="number"
            placeholder="e.g., 50"
            value={couponForm.value || ''}
            onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
          />
          <Input
            label="Minimum Order"
            type="number"
            placeholder="e.g., 200"
            value={couponForm.minOrder || ''}
            onChange={(e) => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
          />
          <Input
            label="Maximum Discount"
            type="number"
            placeholder="e.g., 100"
            value={couponForm.maxDiscount || ''}
            onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
          />
          <Input
            label="Usage Limit"
            type="number"
            placeholder="e.g., 1000"
            value={couponForm.usageLimit || ''}
            onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              value={couponForm.validFrom}
              onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
            />
            <Input
              label="Valid To"
              type="date"
              value={couponForm.validTo}
              onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Applicable To</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={couponForm.applicableTo}
              onChange={(e) => setCouponForm({ ...couponForm, applicableTo: e.target.value })}
            >
              <option value="all">All Orders</option>
              <option value="food">Food Only</option>
              <option value="grocery">Grocery Only</option>
              <option value="wine">Wine Only</option>
              <option value="new_users">New Users Only</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowCouponModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={createCoupon} loading={actionLoading}>
              Create Coupon
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
