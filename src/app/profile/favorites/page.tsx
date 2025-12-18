'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import VendorCard from '@/components/cards/VendorCard';
import ProductCard from '@/components/cards/ProductCard';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('stores');
  const [favoriteStores, setFavoriteStores] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [activeTab]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setLoading(false);
        return;
      }

      const endpoint = activeTab === 'stores' ? '/api/user/favorites/vendors' : '/api/user/favorites/products';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        if (activeTab === 'stores') {
          setFavoriteStores(data.data || []);
        } else {
          setFavoriteProducts(data.data || []);
        }
      } else {
        toast.error(data.error || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'stores', label: 'Stores' },
    { id: 'products', label: 'Products' },
  ];

  const removeStore = async (id: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch(`/api/user/favorites/vendors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Removed from favorites');
        fetchFavorites();
      } else {
        toast.error(data.error || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const removeProduct = async (id: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch(`/api/user/favorites/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Removed from favorites');
        fetchFavorites();
      } else {
        toast.error(data.error || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Favorites</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : activeTab === 'stores' && (
          <>
            {favoriteStores.length > 0 ? (
              <div className="space-y-3">
                {favoriteStores.map((vendor) => (
                  <div key={vendor.id} className="relative">
                    <VendorCard vendor={vendor} variant="horizontal" />
                    <button
                      onClick={() => removeStore(vendor.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No favorite stores yet</p>
                <p className="text-sm text-gray-400">
                  Tap the heart icon on any store to add it here
                </p>
                <Link href="/">
                  <Button className="mt-4">Explore Stores</Button>
                </Link>
              </div>
            )}
          </>
        )}

        {!loading && activeTab === 'products' && (
          <>
            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {favoriteProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 z-10"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No favorite products yet</p>
                <p className="text-sm text-gray-400">
                  Tap the heart icon on any product to add it here
                </p>
                <Link href="/search">
                  <Button className="mt-4">Explore Products</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
