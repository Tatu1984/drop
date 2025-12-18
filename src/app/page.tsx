'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Sparkles, PartyPopper, Package, Loader2, Shield } from 'lucide-react';
import { mainCategories, banners } from '@/data/mockData';
import VendorCard from '@/components/cards/VendorCard';
import ProductCard from '@/components/cards/ProductCard';
import CategoryCard from '@/components/cards/CategoryCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Vendor {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: string;
  rating: number;
  totalRatings: number;
  address: string;
  avgDeliveryTime: number;
  minimumOrder: number;
  isVerified: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  rating: number;
  isVeg: boolean;
  vendor?: { id: string; name: string };
}

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vendors and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorsRes, productsRes] = await Promise.all([
          fetch('/api/vendors?limit=10&sortBy=rating'),
          fetch('/api/products?limit=8&sortBy=rating'),
        ]);

        if (vendorsRes.ok) {
          const vendorData = await vendorsRes.json();
          setVendors(vendorData.data?.data || []);
        }

        if (productsRes.ok) {
          const productData = await productsRes.json();
          setProducts(productData.data?.data || []);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pb-4 relative">
      {/* Admin Link - Top Right */}
      <div className="fixed top-2 right-2 z-50">
        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/80 text-white text-xs font-medium rounded-full hover:bg-gray-900 transition-colors"
        >
          <Shield className="h-3.5 w-3.5" />
          Admin
        </Link>
      </div>

      {/* Banner Carousel */}
      <div className="relative h-40 overflow-hidden">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full bg-gradient-to-r ${banner.bgColor} relative`}>
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover mix-blend-overlay opacity-50"
              />
              <div className="absolute inset-0 flex flex-col justify-center px-6">
                <h2 className="text-2xl font-bold text-white">{banner.title}</h2>
                <p className="text-white/90 mt-1">{banner.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}

        {/* Banner Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBanner
                  ? 'w-6 bg-white'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <Link href="/party">
          <Card hoverable className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-center py-4">
            <PartyPopper className="h-6 w-6 mx-auto mb-1" />
            <span className="text-sm font-medium">Party Mode</span>
          </Card>
        </Link>
        <Link href="/genie">
          <Card hoverable className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-center py-4">
            <Package className="h-6 w-6 mx-auto mb-1" />
            <span className="text-sm font-medium">Genie</span>
          </Card>
        </Link>
        <Link href="/offers">
          <Card hoverable className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-center py-4">
            <Sparkles className="h-6 w-6 mx-auto mb-1" />
            <span className="text-sm font-medium">Offers</span>
          </Card>
        </Link>
      </div>

      {/* Categories */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">What are you looking for?</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {mainCategories.slice(0, 8).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              variant="icon"
              href={`/category/${category.id}`}
            />
          ))}
        </div>
      </section>

      {/* Trending Restaurants */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Trending Near You</h2>
          <Link
            href="/restaurants"
            className="text-orange-500 text-sm font-medium flex items-center gap-1"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : vendors.length > 0 ? (
          <div className="space-y-3">
            {vendors.slice(0, 3).map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No restaurants available</p>
        )}
      </section>

      {/* AI Recommendations */}
      <section className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="compact"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recommendations yet</p>
        )}
      </section>

      {/* Subscription Banner */}
      <section className="px-4 py-4">
        <Link href="/subscription">
          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <Badge variant="default" className="bg-white/20 text-white mb-2">
                  PRIME
                </Badge>
                <h3 className="font-bold text-lg">Get Free Delivery</h3>
                <p className="text-white/90 text-sm mt-1">
                  Subscribe to Drop Prime for unlimited free deliveries
                </p>
              </div>
              <ChevronRight className="h-8 w-8 text-white/70" />
            </div>
          </Card>
        </Link>
      </section>

      {/* More Restaurants */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">All Restaurants</h2>
          <Link
            href="/restaurants"
            className="text-orange-500 text-sm font-medium flex items-center gap-1"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : vendors.length > 0 ? (
          <div className="space-y-3">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                variant="horizontal"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No restaurants found</p>
        )}
      </section>

      {/* Portal Links */}
      <section className="px-4 py-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center mb-3">Business & Partner Portals</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/admin/login"
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            Admin Portal
          </Link>
          <Link
            href="/vendor/login"
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            Vendor Portal
          </Link>
          <Link
            href="/rider/login"
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            Rider Portal
          </Link>
        </div>
      </section>
    </div>
  );
}
