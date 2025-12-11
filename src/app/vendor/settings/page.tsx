'use client';

import { useState } from 'react';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Camera,
  Save,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Printer,
  Volume2,
  Moon,
  ChevronRight,
  User,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface StoreSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;
  prepTime: number;
  minOrder: number;
  deliveryRadius: number;
}

interface NotificationSettings {
  newOrders: boolean;
  orderUpdates: boolean;
  reviews: boolean;
  promotions: boolean;
  sound: boolean;
  email: boolean;
}

const initialStoreSettings: StoreSettings = {
  name: 'Spice Garden Restaurant',
  description: 'Authentic North Indian cuisine with a modern twist. We specialize in tandoor items and rich curries.',
  address: '123 MG Road, Koramangala, Bangalore - 560034',
  phone: '+91 98765 43210',
  email: 'contact@spicegarden.com',
  openTime: '11:00',
  closeTime: '23:00',
  prepTime: 20,
  minOrder: 199,
  deliveryRadius: 8,
};

const initialNotifications: NotificationSettings = {
  newOrders: true,
  orderUpdates: true,
  reviews: true,
  promotions: false,
  sound: true,
  email: true,
};

export default function VendorSettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialStoreSettings);
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleStoreChange = (field: keyof StoreSettings, value: string | number) => {
    setStoreSettings({ ...storeSettings, [field]: value });
    setHasChanges(true);
  };

  const handleNotificationChange = (field: keyof NotificationSettings) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <VendorLayout title="Settings">
      <div className="space-y-6">
        {/* Save Success Message */}
        {showSaveSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Settings saved successfully!
            <button onClick={() => setShowSaveSuccess(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Store Info Tab */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            {/* Store Image */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Store Image</h3>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Store className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Recommended: 800x600px, JPG or PNG
                  </p>
                </div>
              </div>
            </Card>

            {/* Basic Info */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => handleStoreChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={storeSettings.description}
                    onChange={(e) => handleStoreChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={storeSettings.address}
                      onChange={(e) => handleStoreChange('address', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={storeSettings.phone}
                        onChange={(e) => handleStoreChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) => handleStoreChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Operating Hours */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      value={storeSettings.openTime}
                      onChange={(e) => handleStoreChange('openTime', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      value={storeSettings.closeTime}
                      onChange={(e) => handleStoreChange('closeTime', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery Settings */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Delivery Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Prep Time (mins)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.prepTime}
                    onChange={(e) => handleStoreChange('prepTime', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.minOrder}
                    onChange={(e) => handleStoreChange('minOrder', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.deliveryRadius}
                    onChange={(e) => handleStoreChange('deliveryRadius', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'newOrders', label: 'New Orders', desc: 'Get notified when a new order is placed' },
                { key: 'orderUpdates', label: 'Order Updates', desc: 'Receive updates on order status changes' },
                { key: 'reviews', label: 'New Reviews', desc: 'Get notified when customers leave reviews' },
                { key: 'promotions', label: 'Promotions', desc: 'Receive promotional updates from Drop' },
                { key: 'sound', label: 'Sound Alerts', desc: 'Play sound for new notifications' },
                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key as keyof NotificationSettings)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof NotificationSettings] ? 'bg-green-500' : 'bg-gray-300'
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

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Bank Account</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">HDFC Bank</p>
                    <p className="text-sm text-gray-500">Account ending in •••• 4521</p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Payout Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Payout Frequency</p>
                    <p className="text-sm text-gray-500">How often you receive payouts</p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Minimum Payout</p>
                    <p className="text-sm text-gray-500">Minimum amount required for payout</p>
                  </div>
                  <p className="font-medium text-gray-900">₹500</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Tax Information</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">GST Number</p>
                  <p className="text-sm text-gray-500">29ABCDE1234F1Z5</p>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Password</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Key className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  Change
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">2FA Enabled</p>
                    <p className="text-sm text-gray-500">Your account is protected with 2FA</p>
                  </div>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Chrome on MacOS</p>
                    <p className="text-sm text-gray-500">Bangalore, India • Current session</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Safari on iPhone</p>
                    <p className="text-sm text-gray-500">Bangalore, India • 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Revoke
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your vendor account</p>
                  </div>
                </div>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-40">
            <Button onClick={handleSave} className="flex items-center gap-2 shadow-lg">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
