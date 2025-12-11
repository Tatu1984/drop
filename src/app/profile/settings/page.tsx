'use client';

import { useState } from 'react';
import { ArrowLeft, Bell, Globe, Moon, Shield, Smartphone, Volume2, Vibrate } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    {
      id: 'push_notifications',
      label: 'Push Notifications',
      description: 'Get notified about orders, offers, and updates',
      enabled: true,
      icon: Bell,
    },
    {
      id: 'order_updates',
      label: 'Order Updates',
      description: 'Receive real-time updates about your orders',
      enabled: true,
      icon: Smartphone,
    },
    {
      id: 'promotional',
      label: 'Promotional Notifications',
      description: 'Get notified about deals and discounts',
      enabled: false,
      icon: Volume2,
    },
    {
      id: 'vibration',
      label: 'Vibration',
      description: 'Vibrate for notifications',
      enabled: true,
      icon: Vibrate,
    },
    {
      id: 'dark_mode',
      label: 'Dark Mode',
      description: 'Enable dark theme',
      enabled: false,
      icon: Moon,
    },
  ]);

  const [language, setLanguage] = useState('en');
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
  ];

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success('Setting updated');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Notifications */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Notifications
          </h2>
          <Card padding="none">
            {settings.slice(0, 4).map((setting, index) => (
              <div
                key={setting.id}
                className={`flex items-center gap-3 p-4 ${
                  index !== 3 ? 'border-b' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <setting.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    setting.enabled ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </Card>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Appearance
          </h2>
          <Card padding="none">
            {settings.slice(4).map((setting) => (
              <div
                key={setting.id}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <setting.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    setting.enabled ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </Card>
        </div>

        {/* Language */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Language
          </h2>
          <Card padding="none">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">App Language</p>
                  <p className="text-sm text-gray-500">Choose your preferred language</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      toast.success(`Language changed to ${lang.name}`);
                    }}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      language === lang.code
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Privacy */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Privacy & Security
          </h2>
          <Card padding="none">
            <Link
              href="/profile/settings/privacy"
              className="flex items-center gap-3 p-4 border-b"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Privacy Settings</p>
                <p className="text-sm text-gray-500">Manage your data and privacy</p>
              </div>
            </Link>
            <button
              onClick={() => toast.success('Cache cleared')}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Clear Cache</p>
                <p className="text-sm text-gray-500">Free up storage space</p>
              </div>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
