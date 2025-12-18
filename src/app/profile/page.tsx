'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  MapPin,
  CreditCard,
  Wallet,
  Crown,
  Gift,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Heart,
  Bell,
  FileText,
  Shield,
  Headphones,
  Loader2,
} from 'lucide-react';
import { useAuthStore, useWalletStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  highlight?: boolean;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    section: 'Orders & Payments',
    items: [
      { icon: CreditCard, label: 'Payment Methods', href: '/profile/payments' },
      { icon: MapPin, label: 'Saved Addresses', href: '/profile/addresses' },
      { icon: Gift, label: 'Refer & Earn', href: '/profile/referral', badge: '₹100' },
    ],
  },
  {
    section: 'Rewards',
    items: [
      { icon: Crown, label: 'Drop Prime', href: '/subscription', highlight: true },
      { icon: Wallet, label: 'Wallet', href: '/profile/wallet' },
      { icon: Star, label: 'Loyalty Points', href: '/profile/loyalty' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { icon: Heart, label: 'Favorites', href: '/profile/favorites' },
      { icon: Bell, label: 'Notifications', href: '/notifications' },
      { icon: Settings, label: 'Settings', href: '/profile/settings' },
    ],
  },
  {
    section: 'Support',
    items: [
      { icon: Headphones, label: 'Help & Support', href: '/support' },
      { icon: FileText, label: 'Terms & Conditions', href: '/terms' },
      { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { wallet, loyaltyPoints } = useWalletStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(data.data);
        setOrderCount(data.data.orderCount || 0);
      } else {
        toast.error(data.error || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user?.name || 'User'}</h1>
            <p className="text-white/80 text-sm">
              {user?.phone ? `+91 ${user.phone}` : 'Add phone number'}
            </p>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-4 relative z-10">
        <Card>
          <div className="grid grid-cols-3 divide-x">
            <Link href="/profile/wallet" className="text-center py-2">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(wallet?.balance || 0)}
              </p>
              <p className="text-xs text-gray-500">Wallet</p>
            </Link>
            <Link href="/profile/loyalty" className="text-center py-2">
              <p className="text-lg font-bold text-gray-900">
                {loyaltyPoints?.points || 0}
              </p>
              <p className="text-xs text-gray-500">Points</p>
            </Link>
            <Link href="/orders" className="text-center py-2">
              <p className="text-lg font-bold text-gray-900">{orderCount}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </Link>
          </div>
        </Card>
      </div>

      {/* Prime Banner */}
      <Link href="/subscription" className="block px-4 mt-4">
        <Card className="bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-white" />
            <div className="flex-1 text-white">
              <h3 className="font-bold">Upgrade to Prime</h3>
              <p className="text-sm text-white/80">Get free delivery on all orders</p>
            </div>
            <ChevronRight className="h-6 w-6 text-white/70" />
          </div>
        </Card>
      </Link>

      {/* Menu Sections */}
      <div className="px-4 mt-6 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              {section.section}
            </h2>
            <Card padding="none">
              {section.items.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    index !== section.items.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.highlight
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-gray-100'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        item.highlight ? 'text-white' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge variant="success" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </Card>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <Button
          variant="outline"
          fullWidth
          className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>

      {/* App Version */}
      <p className="text-center text-xs text-gray-400 mt-6 pb-4">
        Drop v1.0.0
      </p>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to logout?
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Modal>
    </div>
  );
}
