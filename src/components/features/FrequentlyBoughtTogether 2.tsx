'use client';

import { useState } from 'react';
import { Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/useStore';
import toast from 'react-hot-toast';

interface FrequentlyBoughtTogetherProps {
  currentProduct?: Product;
  products: Product[];
  title?: string;
}

export default function FrequentlyBoughtTogether({
  currentProduct,
  products,
  title = 'Frequently Bought Together',
}: FrequentlyBoughtTogetherProps) {
  const { addItem, items } = useCartStore();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Filter out current product and limit to 3-4 recommendations
  const recommendations = products
    .filter((p) => p.id !== currentProduct?.id && p.inStock)
    .slice(0, 4);

  if (recommendations.length === 0) return null;

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addAllToCart = () => {
    const productsToAdd = recommendations.filter((p) =>
      selectedProducts.includes(p.id)
    );

    productsToAdd.forEach((product) => {
      addItem({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        vendorId: product.vendorId,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity: 1,
        image: product.images[0],
      });
    });

    toast.success(`Added ${productsToAdd.length} items to cart`);
    setSelectedProducts([]);
  };

  const totalPrice = recommendations
    .filter((p) => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + (p.discountPrice || p.price), 0);

  const isInCart = (productId: string) =>
    items.some((item) => item.productId === productId);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
              selectedProducts.includes(product.id)
                ? 'bg-orange-100 border-2 border-orange-400'
                : 'bg-white border-2 border-transparent hover:border-orange-200'
            }`}
            onClick={() => toggleProduct(product.id)}
          >
            {/* Checkbox */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedProducts.includes(product.id)
                  ? 'bg-orange-500 text-white'
                  : 'border-2 border-gray-300'
              }`}
            >
              {selectedProducts.includes(product.id) && (
                <Check className="h-3 w-3" />
              )}
            </div>

            {/* Product Image */}
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              <img
                src={product.images[0] || '/placeholder-food.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {product.name}
              </p>
              <div className="flex items-center gap-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-sm font-semibold text-orange-600">
                      ₹{product.discountPrice}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-700">
                    ₹{product.price}
                  </span>
                )}
              </div>
            </div>

            {/* Already in cart indicator */}
            {isInCart(product.id) && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                In Cart
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add to Cart Section */}
      {selectedProducts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {selectedProducts.length} item(s) selected
            </span>
            <span className="font-semibold text-orange-600">₹{totalPrice}</span>
          </div>
          <button
            onClick={addAllToCart}
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Add Selected to Cart
          </button>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Select items to add them to your cart together
        </p>
      )}
    </div>
  );
}
