'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuthStore } from '@/store/useStore';
import { Home, Search, ShoppingBag, User, Heart, Clock, Tag, HelpCircle, LogOut, Settings, Truck, Store } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Determine if we should show the standard layout
  const isAdminRoute = pathname.startsWith('/admin');
  const isRiderRoute = pathname.startsWith('/rider');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isAuthRoute = pathname.startsWith('/auth');

  if (isAdminRoute || isRiderRoute || isVendorRoute || isAuthRoute) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const sidebarLinks = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/orders', icon: ShoppingBag, label: 'My Orders' },
    { href: '/profile/favorites', icon: Heart, label: 'Favorites' },
    { href: '/offers', icon: Tag, label: 'Offers' },
    { href: '/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen fixed left-0 top-0 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Drop</h1>
                <p className="text-xs text-gray-500">Delivery App</p>
              </div>
            </Link>
          </div>

          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.phone || user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b">
              <Link
                href="/auth"
                className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Login / Sign Up</span>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Partner Links */}
            <div className="mt-6 pt-6 border-t">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Partner With Us</p>
              <ul className="space-y-1">
                <li>
                  <Link href="/vendor/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Store className="h-5 w-5" />
                    <span className="font-medium">Vendor Portal</span>
                  </Link>
                </li>
                <li>
                  <Link href="/rider" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Truck className="h-5 w-5" />
                    <span className="font-medium">Become a Rider</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                © 2025 Drop. All rights reserved.
              </p>
            )}
          </div>
        </aside>

        {/* Desktop Main Content */}
        <div className="flex-1 ml-64">
          <Header />
          <main className="max-w-4xl mx-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Header />
        <main className="pb-20 max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
