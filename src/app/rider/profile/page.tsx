'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Star, Phone, Mail, MapPin, Car, FileText, Shield, ChevronRight, LogOut, Camera, Award, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface RiderProfile {
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalDeliveries: number;
  joinedDate: string;
  vehicle: string;
  vehicleNumber: string;
  zone: string;
  verified: boolean;
  tier: string;
  stats?: {
    totalDeliveries: number;
    thisMonth: number;
    avgRating: number;
    onTimePercent: number;
    acceptanceRate: number;
  };
}

const menuItems = [
  { icon: FileText, label: 'Documents', href: '/rider/documents' },
  { icon: Car, label: 'Vehicle Details', href: '/rider/vehicle' },
  { icon: Shield, label: 'Insurance', href: '/rider/insurance' },
  { icon: MapPin, label: 'Preferred Zones', href: '/rider/zones' },
];

export default function RiderProfilePage() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [riderData, setRiderData] = useState<RiderProfile>({
    name: '',
    phone: '',
    email: '',
    rating: 0,
    totalDeliveries: 0,
    joinedDate: '',
    vehicle: '',
    vehicleNumber: '',
    zone: '',
    verified: false,
    tier: '',
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('rider-token');
        if (!token) {
          toast.error('Please login to continue');
          router.push('/rider/login');
          return;
        }

        const response = await fetch('/api/rider/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data) {
          setRiderData(data.data);
        } else {
          toast.error(data.error || 'Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rider-token');
    toast.success('Logged out successfully');
    setShowLogoutModal(false);
    router.push('/rider/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Deliveries', value: riderData.stats?.totalDeliveries.toString() || riderData.totalDeliveries.toString() },
    { label: 'This Month', value: riderData.stats?.thisMonth.toString() || '0' },
    { label: 'Avg. Rating', value: riderData.stats?.avgRating.toFixed(1) || riderData.rating.toFixed(1) },
    { label: 'On-Time %', value: `${riderData.stats?.onTimePercent || 98}%` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/rider">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">My Profile</h1>
        </div>

        <div className="px-4 pb-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Camera className="h-4 w-4 text-orange-500" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{riderData.name}</h2>
              {riderData.verified && (
                <Shield className="h-5 w-5 text-green-300" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{riderData.rating}</span>
              </div>
              <Badge className="bg-yellow-400 text-yellow-900">
                <Award className="h-3 w-3" />
                {riderData.tier}
              </Badge>
            </div>
            <p className="text-white/70 text-sm mt-1">
              {riderData.totalDeliveries} deliveries • Since {riderData.joinedDate}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center py-3">
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Contact Info */}
        <Card>
          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span>+91 {riderData.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{riderData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>{riderData.zone}</span>
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <h3 className="font-semibold mb-3">Vehicle Details</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{riderData.vehicle}</p>
              <p className="text-sm text-gray-500">{riderData.vehicleNumber}</p>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Performance</h3>
            <Link href="/rider/performance" className="text-orange-500 text-sm">
              View Details
            </Link>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Acceptance Rate</span>
                <span className="font-medium">{riderData.stats?.acceptanceRate || 95}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${riderData.stats?.acceptanceRate || 95}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">On-Time Delivery</span>
                <span className="font-medium">{riderData.stats?.onTimePercent || 98}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${riderData.stats?.onTimePercent || 98}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Customer Rating</span>
                <span className="font-medium">{riderData.rating.toFixed(1)}/5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(riderData.rating / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Menu */}
        <Card padding="none">
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 p-4 ${
                index !== menuItems.length - 1 ? 'border-b' : ''
              }`}
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          fullWidth
          className="text-red-500 border-red-200"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>

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
