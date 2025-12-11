'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Sparkles, PartyPopper, Package } from 'lucide-react';
import {
  mainCategories,
  restaurants,
  trendingProducts,
  banners,
} from '@/data/mockData';
import VendorCard from '@/components/cards/VendorCard';
import ProductCard from '@/components/cards/ProductCard';
import CategoryCard from '@/components/cards/CategoryCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pb-4">
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
        <div className="space-y-3">
          {restaurants.slice(0, 3).map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trendingProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
            />
          ))}
        </div>
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
        <div className="space-y-3">
          {restaurants.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              variant="horizontal"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
