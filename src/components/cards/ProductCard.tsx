'use client';

import Image from 'next/image';
import { Plus, Minus, Star } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import { useCartStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  showVendor?: boolean;
  onClick?: () => void;
}

export default function ProductCard({
  product,
  variant = 'default',
  showVendor = false,
  onClick,
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const cartItem = items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, quantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      if (quantity === 1) {
        removeItem(cartItem.id);
      } else {
        updateQuantity(cartItem.id, quantity - 1);
      }
    }
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (variant === 'horizontal') {
    return (
      <Card
        hoverable
        padding="none"
        className="flex overflow-hidden"
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={product.images[0] || '/placeholder-food.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {product.isVeg ? (
                  <span className="h-4 w-4 border border-green-600 flex items-center justify-center">
                    <span className="h-2 w-2 bg-green-600 rounded-full" />
                  </span>
                ) : (
                  <span className="h-4 w-4 border border-red-600 flex items-center justify-center">
                    <span className="h-2 w-2 bg-red-600 rounded-full" />
                  </span>
                )}
              </div>
            </div>
            {product.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-gray-900">
                {formatCurrency(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Add Button */}
            {product.inStock && (
              quantity === 0 ? (
                <button
                  onClick={handleAdd}
                  className="px-3 py-1 bg-white border border-orange-500 text-orange-500 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-orange-500 rounded-lg">
                  <button
                    onClick={handleDecrease}
                    className="p-1 text-white hover:bg-orange-600 rounded-l-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-white font-medium text-sm w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="p-1 text-white hover:bg-orange-600 rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        hoverable
        padding="sm"
        className="relative"
        onClick={onClick}
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <Badge variant="error" size="sm" className="absolute top-2 left-2 z-10">
            {discountPercent}% OFF
          </Badge>
        )}

        {/* Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
          <Image
            src={product.images[0] || '/placeholder-food.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-gray-900 text-sm">
            {formatCurrency(product.discountPrice || product.price)}
          </span>
          {product.inStock && quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="p-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : product.inStock ? (
            <span className="text-xs text-orange-500 font-medium">{quantity} added</span>
          ) : null}
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      hoverable
      padding="none"
      className="relative overflow-hidden"
      onClick={onClick}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <Badge variant="error" size="sm" className="absolute top-2 left-2 z-10">
          {discountPercent}% OFF
        </Badge>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.images[0] || '/placeholder-food.jpg'}
          alt={product.name}
          fill
          className="object-cover"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {product.isVeg ? (
              <span className="h-5 w-5 border border-green-600 flex items-center justify-center">
                <span className="h-2.5 w-2.5 bg-green-600 rounded-full" />
              </span>
            ) : (
              <span className="h-5 w-5 border border-red-600 flex items-center justify-center">
                <span className="h-2.5 w-2.5 bg-red-600 rounded-full" />
              </span>
            )}
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{product.rating}</span>
              </div>
            )}
          </div>
        </div>

        {showVendor && product.vendor && (
          <p className="text-xs text-gray-400 mt-1">{product.vendor.name}</p>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-gray-900">
              {formatCurrency(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Add Button */}
          {product.inStock && (
            quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 bg-white border-2 border-orange-500 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                ADD
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-orange-500 rounded-lg px-2 py-1">
                <button
                  onClick={handleDecrease}
                  className="p-0.5 text-white hover:bg-orange-600 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-white font-semibold text-sm w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="p-0.5 text-white hover:bg-orange-600 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  );
}
