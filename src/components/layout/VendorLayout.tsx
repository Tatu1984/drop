'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Menu as MenuIcon,
  BarChart3,
  Settings,
  Bell,
  Search,
  X,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Store,
  DollarSign,
  Star,
  Clock,
  UtensilsCrossed,
  Utensils,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface VendorAuth {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isAuthenticated: boolean;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/vendor/dashboard' },
  { icon: Package, label: 'Orders', href: '/vendor/orders', badge: 5 },
  { icon: Utensils, label: 'Menu Management', href: '/vendor/menu' },
  { icon: BarChart3, label: 'Analytics', href: '/vendor/analytics' },
  { icon: DollarSign, label: 'Earnings', href: '/vendor/earnings' },
  { icon: Star, label: 'Reviews', href: '/vendor/reviews' },
  { icon: Settings, label: 'Settings', href: '/vendor/settings' },
  { icon: UtensilsCrossed, label: 'Dine-In (RMS)', href: '/vendor/rms', highlight: true },
];

interface VendorLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function VendorLayout({ children, title = 'Dashboard' }: VendorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorAuth | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem('vendorAuth');
    if (authData) {
      setVendor(JSON.parse(authData));
    } else {
      router.push('/vendor/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vendorAuth');
    router.push('/vendor/login');
  };

  if (!vendor?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gray-900 text-white transition-all duration-300 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0">
              D
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold">Drop Partner</h1>
                <p className="text-xs text-gray-400">Vendor Portal</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-800 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Store Status */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Store Status</span>
              </div>
              <button
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isStoreOpen ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isStoreOpen ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className={`text-xs mt-1 ${isStoreOpen ? 'text-green-400' : 'text-gray-500'}`}>
              {isStoreOpen ? 'Accepting Orders' : 'Store Closed'}
            </p>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map((item: any) => {
              const isActive = pathname === item.href ||
                (item.href !== '/vendor/dashboard' && pathname.startsWith(item.href));

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-500 text-white'
                        : item.highlight
                        ? 'text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 border border-orange-500/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${item.highlight && !isActive ? 'text-orange-400' : ''}`} />
                    {isSidebarOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button - Desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex p-4 border-t border-gray-800 text-gray-400 hover:text-white items-center justify-center gap-2"
        >
          {isSidebarOpen ? (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b px-4 lg:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
              <Badge variant={isStoreOpen ? 'success' : 'error'} className="hidden sm:inline-flex">
                {isStoreOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 pl-2 lg:pl-4 border-l">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                  {vendor?.name?.charAt(0) || 'V'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{vendor?.name || 'Vendor'}</p>
                  <p className="text-xs text-gray-500">{vendor?.email || vendor?.phone}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
