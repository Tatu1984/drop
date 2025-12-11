'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Truck,
  DollarSign,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  BarChart3,
  X,
  LogOut,
  Megaphone,
  MapPin,
  ShieldCheck,
  UtensilsCrossed,
  ShoppingCart,
  Wine,
  Send,
  Building2,
  Pill,
  Flower2,
  Drumstick,
  Milk,
  PawPrint,
  Utensils,
  Clock,
  FileText,
  Gift,
  CreditCard,
  Zap,
  Bike,
  Bot,
  Shield,
} from 'lucide-react';
import { useUIStore, useAuthStore } from '@/store/useStore';
import Badge from '@/components/ui/Badge';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

const sidebarItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Orders', href: '/admin/orders', badge: 12 },

  // Department-wise Vendor Management
  {
    icon: Store,
    label: 'Departments',
    children: [
      { icon: UtensilsCrossed, label: 'Restaurants', href: '/admin/departments/restaurants' },
      { icon: Utensils, label: 'Dine-In', href: '/admin/departments/dine-in' },
      { icon: ShoppingCart, label: 'Grocery Stores', href: '/admin/departments/grocery' },
      { icon: Wine, label: 'Wine & Liquor', href: '/admin/departments/wine' },
      { icon: Send, label: 'Genie/Porter', href: '/admin/departments/genie' },
      { icon: Building2, label: 'Hyperlocal', href: '/admin/departments/hyperlocal' },
    ],
  },

  // Hyperlocal Sub-categories
  {
    icon: Building2,
    label: 'Hyperlocal Stores',
    children: [
      { icon: Pill, label: 'Pharmacy', href: '/admin/hyperlocal/pharmacy' },
      { icon: Drumstick, label: 'Meat & Fish', href: '/admin/hyperlocal/meat' },
      { icon: Milk, label: 'Dairy & Milk', href: '/admin/hyperlocal/dairy' },
      { icon: PawPrint, label: 'Pet Supplies', href: '/admin/hyperlocal/pets' },
      { icon: Flower2, label: 'Flowers & Gifts', href: '/admin/hyperlocal/flowers' },
    ],
  },

  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Store, label: 'All Vendors', href: '/admin/vendors' },
  { icon: Truck, label: 'Riders', href: '/admin/riders' },

  // Fleet Management
  {
    icon: Bike,
    label: 'Fleet Management',
    children: [
      { icon: MapPin, label: 'Live Tracking', href: '/admin/fleet/live' },
      { icon: Bike, label: 'Bike Fleet', href: '/admin/fleet/bike' },
      { icon: Zap, label: 'EV Fleet', href: '/admin/fleet/ev' },
      { icon: Clock, label: 'Shift Scheduling', href: '/admin/fleet/shifts' },
      { icon: MapPin, label: 'Zone Assignment', href: '/admin/fleet/zones' },
    ],
  },

  // Finance
  {
    icon: DollarSign,
    label: 'Finance',
    children: [
      { icon: DollarSign, label: 'Overview', href: '/admin/finance' },
      { icon: CreditCard, label: 'Vendor Payouts', href: '/admin/finance/vendor-payouts' },
      { icon: CreditCard, label: 'Rider Payouts', href: '/admin/finance/rider-payouts' },
      { icon: FileText, label: 'Commissions', href: '/admin/finance/commissions' },
      { icon: FileText, label: 'GST & Invoices', href: '/admin/finance/invoices' },
    ],
  },

  // Marketing
  {
    icon: Megaphone,
    label: 'Marketing',
    children: [
      { icon: Megaphone, label: 'Campaigns', href: '/admin/marketing' },
      { icon: Gift, label: 'Coupons', href: '/admin/marketing/coupons' },
      { icon: Users, label: 'Referrals', href: '/admin/marketing/referrals' },
      { icon: Bell, label: 'Push Notifications', href: '/admin/marketing/notifications' },
      { icon: Users, label: 'User Segments', href: '/admin/marketing/segments' },
    ],
  },

  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: MapPin, label: 'Zones & Pricing', href: '/admin/zones' },

  // Compliance
  {
    icon: ShieldCheck,
    label: 'Compliance',
    children: [
      { icon: ShieldCheck, label: 'KYC Verification', href: '/admin/compliance' },
      { icon: Wine, label: 'Liquor Licenses', href: '/admin/compliance/liquor' },
      { icon: Shield, label: 'Age Verification', href: '/admin/compliance/age' },
      { icon: FileText, label: 'Audit Logs', href: '/admin/compliance/audit' },
    ],
  },

  // AI & Automation
  {
    icon: Bot,
    label: 'AI & Automation',
    children: [
      { icon: Bot, label: 'Demand Prediction', href: '/admin/ai/demand' },
      { icon: BarChart3, label: 'Fraud Detection', href: '/admin/ai/fraud' },
      { icon: Zap, label: 'Auto-Assignment', href: '/admin/ai/assignment' },
      { icon: Gift, label: 'Personalization', href: '/admin/ai/personalization' },
    ],
  },

  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminSidebarOpen, toggleAdminSidebar } = useUIStore();
  const { adminUser, logoutAdmin } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand parent items based on current path
  useEffect(() => {
    const expanded: string[] = [];
    sidebarItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child =>
          child.href && (pathname === child.href || pathname.startsWith(child.href + '/'))
        );
        if (isChildActive) {
          expanded.push(item.label);
        }
      }
    });
    setExpandedItems(expanded);
  }, [pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!adminUser?.isAuthenticated) {
      router.push('/admin/login');
    }
  }, [adminUser, router]);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // Show nothing while checking auth
  if (!adminUser?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.href && (
      pathname === item.href ||
      (item.href !== '/admin' && pathname.startsWith(item.href))
    );

    if (hasChildren) {
      return (
        <li key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isExpanded
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {isAdminSidebarOpen && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
          {isAdminSidebarOpen && isExpanded && (
            <ul className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-1">
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.label}>
        <Link
          href={item.href || '#'}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title={!isAdminSidebarOpen ? item.label : undefined}
        >
          <item.icon className={`${depth > 0 ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`} />
          {isAdminSidebarOpen && (
            <>
              <span className={`flex-1 ${depth > 0 ? 'text-sm' : ''}`}>{item.label}</span>
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
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {isAdminSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleAdminSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${isAdminSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
          bg-gray-900 text-white transition-all duration-300 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0">
              D
            </div>
            {isAdminSidebarOpen && (
              <div>
                <h1 className="font-bold">Drop Admin</h1>
                <p className="text-xs text-gray-400">Management Portal</p>
              </div>
            )}
          </div>
          {isAdminSidebarOpen && (
            <button
              onClick={toggleAdminSidebar}
              className="lg:hidden p-1 hover:bg-gray-800 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map(item => renderNavItem(item))}
          </ul>
        </nav>

        {/* Toggle Button - Desktop Only */}
        <button
          onClick={toggleAdminSidebar}
          className="hidden lg:block p-4 border-t border-gray-800 text-gray-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b px-4 lg:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleAdminSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
              <Badge variant="success" className="hidden sm:inline-flex">Live</Badge>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
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
                  {adminUser?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{adminUser?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 capitalize">{adminUser?.role || 'admin'}</p>
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
