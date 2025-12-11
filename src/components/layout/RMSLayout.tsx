'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  CalendarDays,
  Users,
  Package,
  ChefHat,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Search,
  X,
  LogOut,
  Store,
  Grid3X3,
  Truck,
  Heart,
  Receipt,
  Clock,
  Menu as MenuIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface VendorAuth {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isAuthenticated: boolean;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  children?: { label: string; href: string }[];
}

const sidebarItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/vendor/rms' },
  { icon: Grid3X3, label: 'POS', href: '/vendor/rms/pos' },
  { icon: ChefHat, label: 'Kitchen (KDS)', href: '/vendor/rms/kds' },
  {
    icon: UtensilsCrossed,
    label: 'Tables',
    href: '/vendor/rms/tables',
    children: [
      { label: 'Floor Plan', href: '/vendor/rms/tables' },
      { label: 'Reservations', href: '/vendor/rms/reservations' },
      { label: 'Waitlist', href: '/vendor/rms/waitlist' },
    ]
  },
  {
    icon: ClipboardList,
    label: 'Orders',
    href: '/vendor/rms/orders',
    badge: 5
  },
  {
    icon: MenuIcon,
    label: 'Menu',
    href: '/vendor/rms/menu',
    children: [
      { label: 'Menu Items', href: '/vendor/rms/menu' },
      { label: 'Categories', href: '/vendor/rms/menu/categories' },
      { label: 'Modifiers', href: '/vendor/rms/menu/modifiers' },
      { label: 'Recipes', href: '/vendor/rms/menu/recipes' },
    ]
  },
  {
    icon: Package,
    label: 'Inventory',
    href: '/vendor/rms/inventory',
    children: [
      { label: 'Stock Levels', href: '/vendor/rms/inventory' },
      { label: 'Purchase Orders', href: '/vendor/rms/inventory/purchase-orders' },
      { label: 'Suppliers', href: '/vendor/rms/inventory/suppliers' },
      { label: 'Stock Counts', href: '/vendor/rms/inventory/counts' },
      { label: 'Waste Log', href: '/vendor/rms/inventory/waste' },
    ]
  },
  {
    icon: Users,
    label: 'Staff',
    href: '/vendor/rms/staff',
    children: [
      { label: 'Employees', href: '/vendor/rms/staff' },
      { label: 'Schedules', href: '/vendor/rms/staff/schedules' },
      { label: 'Time & Attendance', href: '/vendor/rms/staff/time' },
      { label: 'Tips', href: '/vendor/rms/staff/tips' },
    ]
  },
  {
    icon: Heart,
    label: 'Guests & CRM',
    href: '/vendor/rms/guests',
    children: [
      { label: 'Guest Profiles', href: '/vendor/rms/guests' },
      { label: 'Loyalty Program', href: '/vendor/rms/guests/loyalty' },
      { label: 'Gift Cards', href: '/vendor/rms/guests/gift-cards' },
      { label: 'Campaigns', href: '/vendor/rms/guests/campaigns' },
    ]
  },
  {
    icon: BarChart3,
    label: 'Reports',
    href: '/vendor/rms/reports',
    children: [
      { label: 'Sales', href: '/vendor/rms/reports' },
      { label: 'Items', href: '/vendor/rms/reports/items' },
      { label: 'Staff', href: '/vendor/rms/reports/staff' },
      { label: 'Inventory', href: '/vendor/rms/reports/inventory' },
    ]
  },
  { icon: Receipt, label: 'Shifts', href: '/vendor/rms/shifts' },
  { icon: Settings, label: 'Settings', href: '/vendor/rms/settings' },
];

interface RMSLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  fullWidth?: boolean;
}

export default function RMSLayout({
  children,
  title = 'Dashboard',
  subtitle,
  actions,
  fullWidth = false
}: RMSLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorAuth | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem('vendorAuth');
    if (authData) {
      setVendor(JSON.parse(authData));
    } else {
      router.push('/vendor/login');
    }
  }, [router]);

  // Expand parent item if child is active
  useEffect(() => {
    sidebarItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => pathname === child.href);
        if (isChildActive && !expandedItems.includes(item.label)) {
          setExpandedItems(prev => [...prev, item.label]);
        }
      }
    });
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorAuth');
    router.push('/vendor/login');
  };

  if (!vendor?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
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
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'}
          bg-gray-900 text-white transition-all duration-300 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/vendor/rms" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0">
              D
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold">Drop RMS</h1>
                <p className="text-xs text-gray-400">Restaurant Management</p>
              </div>
            )}
          </Link>
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
                <span className="text-sm">Restaurant Status</span>
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
              {isStoreOpen ? 'Open for Dine-In' : 'Restaurant Closed'}
            </p>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/vendor/rms' && pathname.startsWith(item.href));
              const isExpanded = expandedItems.includes(item.label);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </>
                        )}
                      </button>
                      {isSidebarOpen && isExpanded && (
                        <ul className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-1">
                          {item.children.map(child => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  pathname === child.href
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      title={!isSidebarOpen ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
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
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to Vendor Portal */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/vendor/dashboard"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Delivery Portal
            </Link>
          </div>
        )}

        {/* Toggle Button - Desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex p-4 border-t border-gray-800 text-gray-400 hover:text-white items-center justify-center"
        >
          <MenuIcon className="h-5 w-5" />
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
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
              <Badge variant={isStoreOpen ? 'success' : 'error'} className="hidden sm:inline-flex">
                {isStoreOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              {actions}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 pl-2 lg:pl-4 border-l">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                  {vendor?.name?.charAt(0) || 'V'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{vendor?.name || 'Restaurant'}</p>
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
        <main className={`flex-1 overflow-auto ${fullWidth ? '' : 'p-4 lg:p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
