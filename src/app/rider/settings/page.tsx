'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Bike,
  Car,
  Zap,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Globe,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface RiderProfile {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  address: string;
  bankAccount: string;
  upiId: string;
}

interface NotificationSettings {
  newOrders: boolean;
  orderUpdates: boolean;
  earnings: boolean;
  promotions: boolean;
  sound: boolean;
}

export default function RiderSettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [profile, setProfile] = useState<RiderProfile>({
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    vehicleType: 'BIKE',
    vehicleNumber: 'KA 01 AB 1234',
    licenseNumber: 'KA0520200012345',
    address: '123, 4th Cross, Koramangala, Bangalore - 560034',
    bankAccount: 'HDFC Bank •••• 4521',
    upiId: 'rajesh@upi',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newOrders: true,
    orderUpdates: true,
    earnings: true,
    promotions: false,
    sound: true,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleLogout = () => {
    localStorage.removeItem('riderAuth');
    router.push('/rider/login');
  };

  const vehicleIcons: Record<string, any> = {
    BIKE: Bike,
    CAR: Car,
    EV: Zap,
  };

  const VehicleIcon = vehicleIcons[profile.vehicleType] || Bike;

  const settingsMenu = [
    { id: 'profile', icon: User, label: 'Personal Information', desc: 'Name, email, phone number' },
    { id: 'vehicle', icon: Bike, label: 'Vehicle Details', desc: 'Vehicle type, number, documents' },
    { id: 'bank', icon: CreditCard, label: 'Bank & Payments', desc: 'Bank account, UPI settings' },
    { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Manage notification preferences' },
    { id: 'documents', icon: FileText, label: 'Documents', desc: 'License, RC, insurance' },
    { id: 'security', icon: Shield, label: 'Security', desc: 'Password, 2FA settings' },
    { id: 'preferences', icon: Globe, label: 'App Preferences', desc: 'Language, theme, sounds' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', desc: 'FAQs, contact support' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-orange-600 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-orange-500" />
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-orange-500 rounded-full text-white">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.phone}</p>
              <div className="flex items-center gap-2 mt-1">
                <VehicleIcon className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">{profile.vehicleNumber}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Verified
              </span>
            </div>
          </div>
        </Card>

        {/* Settings Menu */}
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {settingsMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(activeSection === item.id ? null : item.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <item.icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === item.id ? 'rotate-90' : ''}`} />
              </button>
            ))}
          </div>
        </Card>

        {/* Expanded Section - Notifications */}
        {activeSection === 'notifications' && (
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              {[
                { key: 'newOrders', label: 'New Order Alerts', desc: 'Get notified for new delivery requests' },
                { key: 'orderUpdates', label: 'Order Updates', desc: 'Status changes and customer messages' },
                { key: 'earnings', label: 'Earnings Updates', desc: 'Daily earnings and payout notifications' },
                { key: 'promotions', label: 'Promotions', desc: 'Incentives, bonuses, and offers' },
                { key: 'sound', label: 'Sound Alerts', desc: 'Play sound for new notifications' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationSettings] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof NotificationSettings] ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof NotificationSettings] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Expanded Section - Preferences */}
        {activeSection === 'preferences' && (
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">App Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-orange-500" />}
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-500">Switch to dark theme</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Language</p>
                    <p className="text-sm text-gray-500">Select app language</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Expanded Section - Bank */}
        {activeSection === 'bank' && (
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Payment Settings</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Bank Account</p>
                      <p className="text-sm text-gray-500">{profile.bankAccount}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">UPI ID</p>
                    <p className="text-sm text-gray-500">{profile.upiId}</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
                  Payouts are processed every Monday. Ensure your bank details are correct.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Logout Button */}
        <Card>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </Card>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 py-4">
          Drop Rider App v1.0.0
        </p>
      </div>
    </div>
  );
}
