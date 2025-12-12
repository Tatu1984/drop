'use client';

import { useState } from 'react';
import {
  Settings,
  Store,
  Clock,
  CreditCard,
  Printer,
  Bell,
  Users,
  Shield,
  Palette,
  Globe,
  Receipt,
  Percent,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Save,
  ChevronRight,
  Wifi,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sections: SettingSection[] = [
  { id: 'general', title: 'General', description: 'Restaurant info, hours, contact', icon: <Store className="h-5 w-5" /> },
  { id: 'operations', title: 'Operations', description: 'Service modes, table settings', icon: <Clock className="h-5 w-5" /> },
  { id: 'payment', title: 'Payment', description: 'Payment methods, tips, taxes', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'printing', title: 'Printing', description: 'Receipt & KOT printers', icon: <Printer className="h-5 w-5" /> },
  { id: 'notifications', title: 'Notifications', description: 'Alerts, sounds, messages', icon: <Bell className="h-5 w-5" /> },
  { id: 'users', title: 'Users & Roles', description: 'Staff access, permissions', icon: <Users className="h-5 w-5" /> },
  { id: 'integrations', title: 'Integrations', description: 'POS, delivery, accounting', icon: <Wifi className="h-5 w-5" /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General
    restaurantName: 'Spice Garden Restaurant',
    tagline: 'Authentic Indian Cuisine',
    address: '123 Main Street, Sector 45, Gurgaon',
    phone: '+91 98765 43210',
    email: 'contact@spicegarden.com',
    gstin: '07AAACG1234F1ZQ',
    fssaiLicense: '12345678901234',
    // Hours
    openTime: '11:00',
    closeTime: '23:00',
    lastOrder: '22:30',
    // Operations
    enableDineIn: true,
    enableTakeaway: true,
    enableDelivery: true,
    autoAcceptOrders: false,
    defaultServiceCharge: 10,
    requireTableSelection: true,
    enableCourseManagement: true,
    // Payment
    acceptCash: true,
    acceptCard: true,
    acceptUpi: true,
    enableTips: true,
    tipSuggestions: [10, 15, 20],
    cgstRate: 2.5,
    sgstRate: 2.5,
    roundOff: true,
    // Printing
    autoPrintKOT: true,
    autoPrintBill: false,
    printLogo: true,
    footerMessage: 'Thank you for dining with us!',
    // Notifications
    newOrderSound: true,
    kdsAlerts: true,
    lowStockAlerts: true,
    reservationReminders: true,
    smsNotifications: true,
  });

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-orange-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your restaurant management system</p>
        </div>
        <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-orange-100 text-orange-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className={activeSection === section.id ? 'text-orange-600' : 'text-gray-500'}>
                {section.icon}
              </span>
              <div className="flex-1">
                <p className="font-medium">{section.title}</p>
                <p className="text-xs text-gray-500">{section.description}</p>
              </div>
              <ChevronRight className={`h-4 w-4 ${activeSection === section.id ? 'text-orange-600' : 'text-gray-400'}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">General Settings</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={settings.restaurantName}
                    onChange={(e) => handleChange('restaurantName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FSSAI License</label>
                  <input
                    type="text"
                    value={settings.fssaiLicense}
                    onChange={(e) => handleChange('fssaiLicense', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <h3 className="text-md font-bold text-gray-900 pt-4 border-t">Operating Hours</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={settings.openTime}
                    onChange={(e) => handleChange('openTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={settings.closeTime}
                    onChange={(e) => handleChange('closeTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Order</label>
                  <input
                    type="time"
                    value={settings.lastOrder}
                    onChange={(e) => handleChange('lastOrder', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Operations Settings */}
          {activeSection === 'operations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Operations Settings</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">Service Modes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Dine-In Service</p>
                      <p className="text-sm text-gray-500">Enable in-restaurant dining</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.enableDineIn}
                      onChange={(v) => handleChange('enableDineIn', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Takeaway Orders</p>
                      <p className="text-sm text-gray-500">Allow pickup orders</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.enableTakeaway}
                      onChange={(v) => handleChange('enableTakeaway', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Delivery Orders</p>
                      <p className="text-sm text-gray-500">Enable delivery service</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.enableDelivery}
                      onChange={(v) => handleChange('enableDelivery', v)}
                    />
                  </div>
                </div>

                <h3 className="text-md font-medium text-gray-700 pt-4">Order Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Auto-Accept Orders</p>
                      <p className="text-sm text-gray-500">Automatically confirm new orders</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.autoAcceptOrders}
                      onChange={(v) => handleChange('autoAcceptOrders', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Table Selection</p>
                      <p className="text-sm text-gray-500">Require table before ordering</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.requireTableSelection}
                      onChange={(v) => handleChange('requireTableSelection', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Course Management</p>
                      <p className="text-sm text-gray-500">Enable multi-course ordering</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.enableCourseManagement}
                      onChange={(v) => handleChange('enableCourseManagement', v)}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Service Charge (%)</label>
                  <input
                    type="number"
                    value={settings.defaultServiceCharge}
                    onChange={(e) => handleChange('defaultServiceCharge', parseFloat(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeSection === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Payment Settings</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">Payment Methods</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border-2 cursor-pointer ${
                    settings.acceptCash ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`} onClick={() => handleChange('acceptCash', !settings.acceptCash)}>
                    <DollarSign className="h-6 w-6 mb-2 text-gray-600" />
                    <p className="font-medium">Cash</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 cursor-pointer ${
                    settings.acceptCard ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`} onClick={() => handleChange('acceptCard', !settings.acceptCard)}>
                    <CreditCard className="h-6 w-6 mb-2 text-gray-600" />
                    <p className="font-medium">Card</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 cursor-pointer ${
                    settings.acceptUpi ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`} onClick={() => handleChange('acceptUpi', !settings.acceptUpi)}>
                    <Globe className="h-6 w-6 mb-2 text-gray-600" />
                    <p className="font-medium">UPI</p>
                  </div>
                </div>

                <h3 className="text-md font-medium text-gray-700 pt-4">Tax Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.cgstRate}
                      onChange={(e) => handleChange('cgstRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.sgstRate}
                      onChange={(e) => handleChange('sgstRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <h3 className="text-md font-medium text-gray-700 pt-4">Tips</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Enable Tips</p>
                    <p className="text-sm text-gray-500">Show tip suggestions at checkout</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.enableTips}
                    onChange={(v) => handleChange('enableTips', v)}
                  />
                </div>
                {settings.enableTips && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tip Suggestions (%)</label>
                    <div className="flex gap-2">
                      {settings.tipSuggestions.map((tip, idx) => (
                        <input
                          key={idx}
                          type="number"
                          value={tip}
                          onChange={(e) => {
                            const newTips = [...settings.tipSuggestions];
                            newTips[idx] = parseInt(e.target.value);
                            handleChange('tipSuggestions', newTips);
                          }}
                          className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Round Off Total</p>
                    <p className="text-sm text-gray-500">Round to nearest rupee</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.roundOff}
                    onChange={(v) => handleChange('roundOff', v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Printing Settings */}
          {activeSection === 'printing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Printing Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-Print KOT</p>
                    <p className="text-sm text-gray-500">Print kitchen order ticket on new order</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.autoPrintKOT}
                    onChange={(v) => handleChange('autoPrintKOT', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-Print Bill</p>
                    <p className="text-sm text-gray-500">Print bill on payment completion</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.autoPrintBill}
                    onChange={(v) => handleChange('autoPrintBill', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Print Logo on Receipt</p>
                    <p className="text-sm text-gray-500">Include restaurant logo on receipts</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.printLogo}
                    onChange={(v) => handleChange('printLogo', v)}
                  />
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer Message</label>
                  <textarea
                    value={settings.footerMessage}
                    onChange={(e) => handleChange('footerMessage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={2}
                  />
                </div>

                <h3 className="text-md font-medium text-gray-700 pt-4">Configured Printers</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Main Receipt Printer', type: 'Thermal', status: 'Connected' },
                    { name: 'Kitchen KOT Printer', type: 'Thermal', status: 'Connected' },
                    { name: 'Bar Printer', type: 'Thermal', status: 'Offline' },
                  ].map((printer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Printer className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{printer.name}</p>
                          <p className="text-xs text-gray-500">{printer.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        printer.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {printer.status}
                      </span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Printer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">New Order Sound</p>
                    <p className="text-sm text-gray-500">Play sound for new orders</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.newOrderSound}
                    onChange={(v) => handleChange('newOrderSound', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">KDS Alerts</p>
                    <p className="text-sm text-gray-500">Alert for overdue tickets</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.kdsAlerts}
                    onChange={(v) => handleChange('kdsAlerts', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Notify when items are low</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.lowStockAlerts}
                    onChange={(v) => handleChange('lowStockAlerts', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Reservation Reminders</p>
                    <p className="text-sm text-gray-500">Remind guests before reservations</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.reservationReminders}
                    onChange={(v) => handleChange('reservationReminders', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Send SMS to guests</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.smsNotifications}
                    onChange={(v) => handleChange('smsNotifications', v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Users & Roles Settings */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Users & Roles</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">Roles</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Owner', permissions: 'Full access', users: 1 },
                    { name: 'Manager', permissions: 'Manage staff, reports, settings', users: 2 },
                    { name: 'Cashier', permissions: 'POS, payments, bills', users: 3 },
                    { name: 'Server', permissions: 'Take orders, view tables', users: 5 },
                    { name: 'Kitchen Staff', permissions: 'KDS only', users: 4 },
                  ].map((role, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-sm text-gray-500">{role.permissions}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{role.users} users</span>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </div>
          )}

          {/* Integrations Settings */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Integrations</h2>

              <div className="space-y-4">
                {[
                  { name: 'Swiggy', type: 'Delivery', status: 'Connected', icon: '🍽️' },
                  { name: 'Zomato', type: 'Delivery', status: 'Connected', icon: '🍴' },
                  { name: 'Tally', type: 'Accounting', status: 'Not Connected', icon: '📊' },
                  { name: 'Razorpay', type: 'Payments', status: 'Connected', icon: '💳' },
                  { name: 'MSG91', type: 'SMS', status: 'Connected', icon: '📱' },
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{integration.name}</p>
                        <p className="text-sm text-gray-500">{integration.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {integration.status}
                      </span>
                      <Button variant="outline" size="sm">
                        {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
