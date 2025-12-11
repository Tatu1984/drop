'use client';

import { useState } from 'react';
import { Check, Plus, Minus, AlertCircle, Leaf } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/useStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelect: number;
  minSelect: number;
  options: CustomizationOption[];
}

// Sample customization data - in real app this would come from product data
const getCustomizations = (product: Product): CustomizationGroup[] => {
  // Food customizations
  if (product.categoryId?.includes('food') || product.vendorId?.includes('restaurant')) {
    return [
      {
        id: 'size',
        name: 'Size',
        required: true,
        maxSelect: 1,
        minSelect: 1,
        options: [
          { id: 'regular', name: 'Regular', price: 0, isDefault: true },
          { id: 'large', name: 'Large', price: 49 },
          { id: 'family', name: 'Family Pack', price: 129 },
        ],
      },
      {
        id: 'spice',
        name: 'Spice Level',
        required: true,
        maxSelect: 1,
        minSelect: 1,
        options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0, isDefault: true },
          { id: 'hot', name: 'Hot', price: 0 },
          { id: 'extra-hot', name: 'Extra Hot', price: 0 },
        ],
      },
      {
        id: 'addons',
        name: 'Add-ons',
        required: false,
        maxSelect: 5,
        minSelect: 0,
        options: [
          { id: 'cheese', name: 'Extra Cheese', price: 30 },
          { id: 'onion', name: 'Extra Onion', price: 15 },
          { id: 'sauce', name: 'Extra Sauce', price: 20 },
          { id: 'egg', name: 'Add Egg', price: 25 },
          { id: 'paneer', name: 'Add Paneer', price: 40 },
        ],
      },
      {
        id: 'remove',
        name: 'Remove Ingredients',
        required: false,
        maxSelect: 5,
        minSelect: 0,
        options: [
          { id: 'no-onion', name: 'No Onion', price: 0 },
          { id: 'no-garlic', name: 'No Garlic', price: 0 },
          { id: 'no-tomato', name: 'No Tomato', price: 0 },
          { id: 'no-coriander', name: 'No Coriander', price: 0 },
        ],
      },
    ];
  }

  // Beverage customizations
  if (product.categoryId?.includes('beverage') || product.name?.toLowerCase().includes('coffee')) {
    return [
      {
        id: 'size',
        name: 'Size',
        required: true,
        maxSelect: 1,
        minSelect: 1,
        options: [
          { id: 'small', name: 'Small (250ml)', price: 0 },
          { id: 'medium', name: 'Medium (350ml)', price: 30, isDefault: true },
          { id: 'large', name: 'Large (500ml)', price: 60 },
        ],
      },
      {
        id: 'milk',
        name: 'Milk Type',
        required: false,
        maxSelect: 1,
        minSelect: 0,
        options: [
          { id: 'regular-milk', name: 'Regular Milk', price: 0, isDefault: true },
          { id: 'oat-milk', name: 'Oat Milk', price: 40 },
          { id: 'almond-milk', name: 'Almond Milk', price: 50 },
          { id: 'soy-milk', name: 'Soy Milk', price: 40 },
        ],
      },
      {
        id: 'sweetness',
        name: 'Sweetness',
        required: false,
        maxSelect: 1,
        minSelect: 0,
        options: [
          { id: 'no-sugar', name: 'No Sugar', price: 0 },
          { id: 'less-sugar', name: 'Less Sugar', price: 0 },
          { id: 'regular-sugar', name: 'Regular', price: 0, isDefault: true },
          { id: 'extra-sugar', name: 'Extra Sweet', price: 0 },
        ],
      },
    ];
  }

  // Default/Generic customizations
  return [
    {
      id: 'quantity-pack',
      name: 'Pack Size',
      required: true,
      maxSelect: 1,
      minSelect: 1,
      options: [
        { id: 'single', name: 'Single', price: 0, isDefault: true },
        { id: 'pack-2', name: 'Pack of 2', price: Math.round(product.price * 0.9) },
        { id: 'pack-4', name: 'Pack of 4', price: Math.round(product.price * 1.7) },
      ],
    },
  ];
};

interface ProductCustomizationProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductCustomization({ product, isOpen, onClose }: ProductCustomizationProps) {
  const { addItem } = useCartStore();
  const customizations = getCustomizations(product);

  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    // Initialize with default selections
    const defaults: Record<string, string[]> = {};
    customizations.forEach((group) => {
      const defaultOption = group.options.find((o) => o.isDefault);
      if (defaultOption) {
        defaults[group.id] = [defaultOption.id];
      } else {
        defaults[group.id] = [];
      }
    });
    return defaults;
  });

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const toggleOption = (groupId: string, optionId: string) => {
    const group = customizations.find((g) => g.id === groupId);
    if (!group) return;

    setSelections((prev) => {
      const current = prev[groupId] || [];

      if (group.maxSelect === 1) {
        // Single select - replace
        return { ...prev, [groupId]: [optionId] };
      } else {
        // Multi select
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        } else if (current.length < group.maxSelect) {
          return { ...prev, [groupId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = product.discountPrice || product.price;

    customizations.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      group.options.forEach((option) => {
        if (selectedIds.includes(option.id)) {
          total += option.price;
        }
      });
    });

    return total * quantity;
  };

  const isValid = () => {
    return customizations.every((group) => {
      const selectedCount = (selections[group.id] || []).length;
      return selectedCount >= group.minSelect;
    });
  };

  const handleAddToCart = () => {
    if (!isValid()) {
      toast.error('Please complete all required selections');
      return;
    }

    // Build customization string
    const customizationText = customizations
      .map((group) => {
        const selected = (selections[group.id] || [])
          .map((id) => group.options.find((o) => o.id === id)?.name)
          .filter(Boolean)
          .join(', ');
        return selected ? `${group.name}: ${selected}` : null;
      })
      .filter(Boolean)
      .join(' | ');

    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      price: calculateTotalPrice() / quantity,
      quantity,
      image: product.images[0],
      customization: customizationText,
      specialInstructions: specialInstructions || undefined,
    });

    toast.success(`Added ${quantity}x ${product.name} to cart`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Your Order" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Product Header */}
        <div className="flex gap-4 pb-4 border-b">
          <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            <img
              src={product.images[0] || '/placeholder-food.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              {product.isVeg && (
                <span className="w-4 h-4 border border-green-600 flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            <div className="mt-1 flex items-center gap-2">
              {product.discountPrice ? (
                <>
                  <span className="font-semibold text-orange-600">₹{product.discountPrice}</span>
                  <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                </>
              ) : (
                <span className="font-semibold text-gray-900">₹{product.price}</span>
              )}
            </div>
          </div>
        </div>

        {/* Customization Groups */}
        {customizations.map((group) => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <p className="text-xs text-gray-500">
                  {group.required ? 'Required' : 'Optional'}
                  {group.maxSelect > 1 && ` • Select up to ${group.maxSelect}`}
                </p>
              </div>
              {group.required && (selections[group.id] || []).length < group.minSelect && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Required
                </span>
              )}
            </div>

            <div className="space-y-2">
              {group.options.map((option) => {
                const isSelected = (selections[group.id] || []).includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(group.id, option.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-medium text-gray-900">{option.name}</span>
                    </div>
                    {option.price > 0 && (
                      <span className="text-sm text-orange-600">+₹{option.price}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Special Instructions */}
        <div className="space-y-2">
          <label className="font-medium text-gray-900">Special Instructions</label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests? (e.g., less oil, extra napkins)"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            rows={2}
          />
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between py-4 border-t">
          <span className="font-medium text-gray-900">Quantity</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-orange-500"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-orange-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t mt-4">
        <Button
          fullWidth
          onClick={handleAddToCart}
          disabled={!isValid()}
          className="py-4"
        >
          Add to Cart • ₹{calculateTotalPrice()}
        </Button>
      </div>
    </Modal>
  );
}
