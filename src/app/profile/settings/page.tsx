'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Globe, Moon, Shield, Smartphone, Volume2, Vibrate, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        if (data.data.notifications) {
          setSettings(prevSettings =>
            prevSettings.map(s => ({
              ...s,
              enabled: data.data.notifications[s.id] !== undefined
                ? data.data.notifications[s.id]
                : s.enabled,
            }))
          );
        }
        if (data.data.language) {
          setLanguage(data.data.language);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
  ];

  const toggleSetting = async (id: string) => {
    const updatedSettings = settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSettings(updatedSettings);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const notificationsObj: Record<string, boolean> = {};
      updatedSettings.forEach(s => {
        notificationsObj[s.id] = s.enabled;
      });

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: notificationsObj,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Setting updated');
      } else {
        toast.error(data.error || 'Failed to update setting');
        // Revert on error
        fetchSettings();
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
      // Revert on error
      fetchSettings();
    }
  };

  const updateLanguage = async (langCode: string) => {
    const previousLang = language;
    setLanguage(langCode);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please login to continue');
        setLanguage(previousLang);
        return;
      }

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: langCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const lang = languages.find(l => l.code === langCode);
        toast.success(`Language changed to ${lang?.name}`);
      } else {
        toast.error(data.error || 'Failed to update language');
        setLanguage(previousLang);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language');
      setLanguage(previousLang);
    }
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
                    onClick={() => updateLanguage(lang.code)}
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
