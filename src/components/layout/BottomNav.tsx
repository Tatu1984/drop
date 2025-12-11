'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useStore';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/orders', icon: Clock, label: 'Orders' },
  { href: '/cart', icon: ShoppingBag, label: 'Cart', showBadge: true },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  // Don't show on rider or admin routes
  if (pathname.startsWith('/rider') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label, showBadge }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative',
                'transition-colors duration-200',
                isActive ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {showBadge && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
