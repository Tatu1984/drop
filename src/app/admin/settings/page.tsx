'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Bell, Shield, CreditCard, Truck, Store, Users, Globe, Mail, Smartphone, Clock, Percent, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface SettingsData {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
    language: string;
    timezone: string;
    openingTime: string;
    closingTime: string;
    allow24x7: boolean;
  };
  delivery: {
    baseDeliveryFee: number;
    freeDeliveryAbove: number;
    perKmCharge: number;
    maxDistance: number;
    avgSpeed: number;
    prepBuffer: number;
    expressEnabled: boolean;
    expressFee: number;
    standardEnabled: boolean;
    scheduledEnabled: boolean;
    surgeEnabled: boolean;
    minSurge: number;
    maxSurge: number;
  };
  payments: {
    upiEnabled: boolean;
    cardsEnabled: boolean;
    netBankingEnabled: boolean;
    walletEnabled: boolean;
    codEnabled: boolean;
    gateway: string;
    gatewayMode: string;
    maxCodAmount: number;
    codFee: number;
    codDisabledNewUsers: boolean;
    codDisabledWine: boolean;
  };
  notifications: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    smsProvider: string;
    smsApiKey: string;
    smsSenderId: string;
  };
  commissions: {
    food: number;
    grocery: number;
    wine: number;
    pharmacy: number;
    meat: number;
    genie: number;
    riderBasePay: number;
    riderPerKm: number;
    riderWaiting: number;
    peakBonus: number;
    rainBonus: number;
    lateNightBonus: number;
    vendorPayoutCycle: string;
    riderPayoutCycle: string;
    minPayout: number;
    tdsThreshold: number;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: string;
    ipWhitelist: boolean;
    gdprEnabled: boolean;
    dataRetention: string;
  };
  adminRoles: Array<{
    role: string;
    users: number;
    permissions: string;
  }>;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'payments', label: 'Payments' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'commissions', label: 'Commissions' },
    { id: 'security', label: 'Security' },
  ];

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        toast.error(result.error || 'Failed to load settings');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section: activeTab, settings }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SettingsData, key: string, value: unknown) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...(settings[section] as Record<string, unknown>),
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </AdminLayout>
    );
  }

  const general = settings?.general || {
    platformName: 'Drop',
    supportEmail: 'support@drop.com',
    supportPhone: '+91 1800-123-4567',
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    openingTime: '08:00',
    closingTime: '23:00',
    allow24x7: true,
  };

  const delivery = settings?.delivery || {
    baseDeliveryFee: 30,
    freeDeliveryAbove: 500,
    perKmCharge: 5,
    maxDistance: 15,
    avgSpeed: 20,
    prepBuffer: 10,
    expressEnabled: true,
    expressFee: 20,
    standardEnabled: true,
    scheduledEnabled: true,
    surgeEnabled: true,
    minSurge: 1.2,
    maxSurge: 2.5,
  };

  const payments = settings?.payments || {
    upiEnabled: true,
    cardsEnabled: true,
    netBankingEnabled: true,
    walletEnabled: true,
    codEnabled: true,
    gateway: 'Razorpay',
    gatewayMode: 'Live',
    maxCodAmount: 5000,
    codFee: 20,
    codDisabledNewUsers: true,
    codDisabledWine: false,
  };

  const notifications = settings?.notifications || {
    pushEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    whatsappEnabled: false,
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUsername: 'apikey',
    smtpPassword: '',
    fromEmail: 'noreply@drop.com',
    fromName: 'Drop Delivery',
    smsProvider: 'MSG91',
    smsApiKey: '',
    smsSenderId: 'DROPAP',
  };

  const commissions = settings?.commissions || {
    food: 20,
    grocery: 15,
    wine: 25,
    pharmacy: 10,
    meat: 18,
    genie: 30,
    riderBasePay: 25,
    riderPerKm: 8,
    riderWaiting: 2,
    peakBonus: 20,
    rainBonus: 15,
    lateNightBonus: 25,
    vendorPayoutCycle: 'Weekly',
    riderPayoutCycle: 'Daily',
    minPayout: 500,
    tdsThreshold: 50000,
  };

  const security = settings?.security || {
    twoFactorRequired: true,
    sessionTimeout: '30 minutes',
    ipWhitelist: false,
    gdprEnabled: true,
    dataRetention: '2 years',
  };

  const adminRoles = settings?.adminRoles || [
    { role: 'Super Admin', users: 2, permissions: 'Full Access' },
    { role: 'Admin', users: 5, permissions: 'Manage Orders, Users, Vendors' },
    { role: 'Manager', users: 8, permissions: 'View Reports, Manage Orders' },
    { role: 'Support', users: 12, permissions: 'View Orders, Handle Tickets' },
  ];

  return (
    <AdminLayout title="Settings">
      <div className="bg-white rounded-xl border">
        <div className="border-b px-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gray-500" />
                  Platform Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Platform Name"
                    value={general.platformName}
                    onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                  />
                  <Input
                    label="Support Email"
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                  />
                  <Input
                    label="Support Phone"
                    value={general.supportPhone}
                    onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={general.currency}
                      onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={general.language}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="kn">Kannada</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-gray-500" />
                  Business Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                    <Input
                      type="time"
                      value={general.openingTime}
                      onChange={(e) => updateSetting('general', 'openingTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                    <Input
                      type="time"
                      value={general.closingTime}
                      onChange={(e) => updateSetting('general', 'closingTime', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={general.allow24x7}
                      onChange={(e) => updateSetting('general', 'allow24x7', e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Allow orders 24/7 for select vendors</span>
                  </label>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-500" />
                  Delivery Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Base Delivery Fee (₹)"
                    type="number"
                    value={delivery.baseDeliveryFee}
                    onChange={(e) => updateSetting('delivery', 'baseDeliveryFee', Number(e.target.value))}
                  />
                  <Input
                    label="Free Delivery Above (₹)"
                    type="number"
                    value={delivery.freeDeliveryAbove}
                    onChange={(e) => updateSetting('delivery', 'freeDeliveryAbove', Number(e.target.value))}
                  />
                  <Input
                    label="Per KM Charge (₹)"
                    type="number"
                    value={delivery.perKmCharge}
                    onChange={(e) => updateSetting('delivery', 'perKmCharge', Number(e.target.value))}
                  />
                  <Input
                    label="Maximum Delivery Distance (km)"
                    type="number"
                    value={delivery.maxDistance}
                    onChange={(e) => updateSetting('delivery', 'maxDistance', Number(e.target.value))}
                  />
                  <Input
                    label="Average Speed (km/h)"
                    type="number"
                    value={delivery.avgSpeed}
                    onChange={(e) => updateSetting('delivery', 'avgSpeed', Number(e.target.value))}
                  />
                  <Input
                    label="Preparation Buffer (min)"
                    type="number"
                    value={delivery.prepBuffer}
                    onChange={(e) => updateSetting('delivery', 'prepBuffer', Number(e.target.value))}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  Delivery Slots
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Express</p>
                      <p className="text-sm text-gray-500">15-20 min</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={delivery.expressFee}
                        onChange={(e) => updateSetting('delivery', 'expressFee', Number(e.target.value))}
                        className="w-24"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={delivery.expressEnabled}
                          onChange={(e) => updateSetting('delivery', 'expressEnabled', e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Standard</p>
                      <p className="text-sm text-gray-500">30-45 min</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input type="number" value={0} className="w-24" disabled />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={delivery.standardEnabled}
                          onChange={(e) => updateSetting('delivery', 'standardEnabled', e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Scheduled</p>
                      <p className="text-sm text-gray-500">Choose time</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input type="number" value={0} className="w-24" disabled />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={delivery.scheduledEnabled}
                          onChange={(e) => updateSetting('delivery', 'scheduledEnabled', e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Surge Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={delivery.surgeEnabled}
                        onChange={(e) => updateSetting('delivery', 'surgeEnabled', e.target.checked)}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm font-medium">Enable Surge Pricing</span>
                    </label>
                  </div>
                  <Input
                    label="Min Multiplier"
                    type="number"
                    step="0.1"
                    value={delivery.minSurge}
                    onChange={(e) => updateSetting('delivery', 'minSurge', Number(e.target.value))}
                  />
                  <Input
                    label="Max Multiplier"
                    type="number"
                    step="0.1"
                    value={delivery.maxSurge}
                    onChange={(e) => updateSetting('delivery', 'maxSurge', Number(e.target.value))}
                  />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  Payment Methods
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'upiEnabled', name: 'UPI', icon: '📱' },
                    { key: 'cardsEnabled', name: 'Credit/Debit Cards', icon: '💳' },
                    { key: 'netBankingEnabled', name: 'Net Banking', icon: '🏦' },
                    { key: 'walletEnabled', name: 'Wallet', icon: '👛' },
                    { key: 'codEnabled', name: 'Cash on Delivery', icon: '💵' },
                  ].map((method) => {
                    const isActive = payments[method.key as keyof typeof payments] as boolean;
                    return (
                      <div key={method.key} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <span className="font-medium">{method.name}</span>
                            {isActive && (
                              <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                            )}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => updateSetting('payments', method.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Payment Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gateway Provider</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={payments.gateway}
                      onChange={(e) => updateSetting('payments', 'gateway', e.target.value)}
                    >
                      <option>Razorpay</option>
                      <option>PayU</option>
                      <option>Cashfree</option>
                      <option>Stripe</option>
                    </select>
                  </div>
                  <Input label="API Key" type="password" defaultValue="rzp_live_xxxxx" />
                  <Input label="Secret Key" type="password" defaultValue="xxxxx" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={payments.gatewayMode}
                      onChange={(e) => updateSetting('payments', 'gatewayMode', e.target.value)}
                    >
                      <option>Live</option>
                      <option>Test</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">COD Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Maximum COD Amount (₹)"
                    type="number"
                    value={payments.maxCodAmount}
                    onChange={(e) => updateSetting('payments', 'maxCodAmount', Number(e.target.value))}
                  />
                  <Input
                    label="COD Fee (₹)"
                    type="number"
                    value={payments.codFee}
                    onChange={(e) => updateSetting('payments', 'codFee', Number(e.target.value))}
                  />
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={payments.codDisabledNewUsers}
                        onChange={(e) => updateSetting('payments', 'codDisabledNewUsers', e.target.checked)}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm">Disable COD for new users</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={payments.codDisabledWine}
                        onChange={(e) => updateSetting('payments', 'codDisabledWine', e.target.checked)}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm">Disable COD for Wine orders</span>
                    </label>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gray-500" />
                  Notification Channels
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'pushEnabled', name: 'Push Notifications', description: 'Mobile app push notifications' },
                    { key: 'smsEnabled', name: 'SMS', description: 'Order updates via SMS' },
                    { key: 'emailEnabled', name: 'Email', description: 'Order confirmations and receipts' },
                    { key: 'whatsappEnabled', name: 'WhatsApp', description: 'Order tracking via WhatsApp' },
                  ].map((channel) => (
                    <div key={channel.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-gray-500">{channel.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[channel.key as keyof typeof notifications] as boolean}
                          onChange={(e) => updateSetting('notifications', channel.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  Email Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="SMTP Host"
                    value={notifications.smtpHost}
                    onChange={(e) => updateSetting('notifications', 'smtpHost', e.target.value)}
                  />
                  <Input
                    label="SMTP Port"
                    value={notifications.smtpPort}
                    onChange={(e) => updateSetting('notifications', 'smtpPort', e.target.value)}
                  />
                  <Input
                    label="SMTP Username"
                    value={notifications.smtpUsername}
                    onChange={(e) => updateSetting('notifications', 'smtpUsername', e.target.value)}
                  />
                  <Input
                    label="SMTP Password"
                    type="password"
                    value={notifications.smtpPassword}
                    onChange={(e) => updateSetting('notifications', 'smtpPassword', e.target.value)}
                  />
                  <Input
                    label="From Email"
                    value={notifications.fromEmail}
                    onChange={(e) => updateSetting('notifications', 'fromEmail', e.target.value)}
                  />
                  <Input
                    label="From Name"
                    value={notifications.fromName}
                    onChange={(e) => updateSetting('notifications', 'fromName', e.target.value)}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-gray-500" />
                  SMS Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={notifications.smsProvider}
                      onChange={(e) => updateSetting('notifications', 'smsProvider', e.target.value)}
                    >
                      <option>MSG91</option>
                      <option>Twilio</option>
                      <option>Textlocal</option>
                    </select>
                  </div>
                  <Input
                    label="API Key"
                    type="password"
                    value={notifications.smsApiKey}
                    onChange={(e) => updateSetting('notifications', 'smsApiKey', e.target.value)}
                  />
                  <Input
                    label="Sender ID"
                    value={notifications.smsSenderId}
                    onChange={(e) => updateSetting('notifications', 'smsSenderId', e.target.value)}
                  />
                  <Input label="DLT Template ID" defaultValue="xxxxx" />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5 text-gray-500" />
                  Category-wise Commission
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'food', category: 'Food Delivery', icon: '🍔' },
                    { key: 'grocery', category: 'Grocery', icon: '🛒' },
                    { key: 'wine', category: 'Wine & Alcohol', icon: '🍷' },
                    { key: 'pharmacy', category: 'Pharmacy', icon: '💊' },
                    { key: 'meat', category: 'Meat & Fish', icon: '🥩' },
                    { key: 'genie', category: 'Genie Services', icon: '📦' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={commissions[item.key as keyof typeof commissions] as number}
                          onChange={(e) => updateSetting('commissions', item.key, Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Rider Earnings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Base Pay per Order (₹)"
                    type="number"
                    value={commissions.riderBasePay}
                    onChange={(e) => updateSetting('commissions', 'riderBasePay', Number(e.target.value))}
                  />
                  <Input
                    label="Per KM Rate (₹)"
                    type="number"
                    value={commissions.riderPerKm}
                    onChange={(e) => updateSetting('commissions', 'riderPerKm', Number(e.target.value))}
                  />
                  <Input
                    label="Waiting Charge/min (₹)"
                    type="number"
                    value={commissions.riderWaiting}
                    onChange={(e) => updateSetting('commissions', 'riderWaiting', Number(e.target.value))}
                  />
                  <Input
                    label="Peak Hour Bonus (%)"
                    type="number"
                    value={commissions.peakBonus}
                    onChange={(e) => updateSetting('commissions', 'peakBonus', Number(e.target.value))}
                  />
                  <Input
                    label="Rain Bonus (₹)"
                    type="number"
                    value={commissions.rainBonus}
                    onChange={(e) => updateSetting('commissions', 'rainBonus', Number(e.target.value))}
                  />
                  <Input
                    label="Late Night Bonus (%)"
                    type="number"
                    value={commissions.lateNightBonus}
                    onChange={(e) => updateSetting('commissions', 'lateNightBonus', Number(e.target.value))}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Payout Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Payout Cycle</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={commissions.vendorPayoutCycle}
                      onChange={(e) => updateSetting('commissions', 'vendorPayoutCycle', e.target.value)}
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Bi-Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rider Payout Cycle</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={commissions.riderPayoutCycle}
                      onChange={(e) => updateSetting('commissions', 'riderPayoutCycle', e.target.value)}
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <Input
                    label="Minimum Payout (₹)"
                    type="number"
                    value={commissions.minPayout}
                    onChange={(e) => updateSetting('commissions', 'minPayout', Number(e.target.value))}
                  />
                  <Input
                    label="TDS Threshold (₹)"
                    type="number"
                    value={commissions.tdsThreshold}
                    onChange={(e) => updateSetting('commissions', 'tdsThreshold', Number(e.target.value))}
                  />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  Authentication Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorRequired}
                        onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                    </div>
                    <select
                      className="px-4 py-2 border rounded-lg"
                      value={security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
                    >
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">IP Whitelist</p>
                      <p className="text-sm text-gray-500">Restrict admin access to specific IPs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.ipWhitelist}
                        onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  Admin Roles
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Users</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Permissions</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adminRoles.map((role, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{role.role}</td>
                          <td className="px-4 py-3">
                            <Badge variant="default">{role.users} users</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{role.permissions}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="outline">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Data Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">GDPR Compliance Mode</p>
                      <p className="text-sm text-gray-500">Enable for EU users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.gdprEnabled}
                        onChange={(e) => updateSetting('security', 'gdprEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Data Retention Period</p>
                      <p className="text-sm text-gray-500">Auto-delete old data</p>
                    </div>
                    <select
                      className="px-4 py-2 border rounded-lg"
                      value={security.dataRetention}
                      onChange={(e) => updateSetting('security', 'dataRetention', e.target.value)}
                    >
                      <option>1 year</option>
                      <option>2 years</option>
                      <option>3 years</option>
                      <option>5 years</option>
                    </select>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
