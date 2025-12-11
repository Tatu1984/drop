'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Tag,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useCartStore, useLocationStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    vendor,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
  } = useCartStore();
  const { selectedAddress } = useLocationStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [tip, setTip] = useState(0);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 199 ? 0 : 30;
  const platformFee = 5;
  const discount = appliedCoupon ? Math.min(subtotal * 0.2, 100) : 0;
  const total = subtotal + deliveryFee + platformFee + tip - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME50') {
      setAppliedCoupon(couponCode.toUpperCase());
      toast.success('Coupon applied successfully!');
      setShowCouponModal(false);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b flex items-center gap-4">
          <Link href="/">
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold">Cart</h1>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-6xl">🛒</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Looks like you haven&apos;t added anything to your cart yet
          </p>
          <Link href="/">
            <Button>Browse Restaurants</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b flex items-center gap-4 sticky top-0 z-20">
        <Link href="/">
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Cart</h1>
          {vendor && (
            <p className="text-sm text-gray-500">{vendor.name}</p>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm('Clear all items from cart?')) {
              clearCart();
              toast.success('Cart cleared');
            }
          }}
          className="text-red-500 text-sm font-medium"
        >
          Clear
        </button>
      </div>

      {/* Delivery Address */}
      <Link href="/addresses">
        <Card className="mx-4 mt-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-orange-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Deliver to</p>
              <p className="font-medium text-gray-900 truncate">
                {selectedAddress?.fullAddress || 'Select delivery address'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>
      </Link>

      {/* Cart Items */}
      <Card className="mx-4 mt-4" padding="none">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 flex gap-3 ${
              index !== items.length - 1 ? 'border-b' : ''
            }`}
          >
            {/* Image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.product.images[0] || '/placeholder-food.jpg'}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    {item.product.isVeg ? (
                      <span className="h-4 w-4 border border-green-600 flex items-center justify-center">
                        <span className="h-2 w-2 bg-green-600 rounded-full" />
                      </span>
                    ) : (
                      <span className="h-4 w-4 border border-red-600 flex items-center justify-center">
                        <span className="h-2 w-2 bg-red-600 rounded-full" />
                      </span>
                    )}
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                      {item.product.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(item.product.discountPrice || item.product.price)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 border rounded-lg">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(0, item.quantity - 1))
                    }
                    className="p-2 text-orange-500 hover:bg-orange-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-orange-500 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(
                    (item.product.discountPrice || item.product.price) *
                      item.quantity
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Delivery Instructions */}
      <Card className="mx-4 mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Delivery Instructions (Optional)
        </p>
        <Input
          placeholder="Add delivery instructions..."
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
        />
      </Card>

      {/* Coupon */}
      <Card className="mx-4 mt-4">
        <button
          onClick={() => setShowCouponModal(true)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-orange-500" />
            <span className="font-medium">
              {appliedCoupon || 'Apply Coupon'}
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
        {appliedCoupon && (
          <p className="text-green-600 text-sm mt-2">
            You&apos;re saving {formatCurrency(discount)}!
          </p>
        )}
      </Card>

      {/* Tip */}
      <Card className="mx-4 mt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Tip your delivery partner
        </p>
        <div className="flex gap-2">
          {[0, 10, 20, 30, 50].map((amount) => (
            <button
              key={amount}
              onClick={() => setTip(amount)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tip === amount
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {amount === 0 ? 'No tip' : `₹${amount}`}
            </button>
          ))}
        </div>
      </Card>

      {/* Bill Details */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Bill Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Item Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {tip > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tip</span>
              <span>{formatCurrency(tip)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
            <span>To Pay</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>30-35 min</span>
          </div>
        </div>
        <Button fullWidth onClick={handleCheckout}>
          Proceed to Checkout
        </Button>
      </div>

      {/* Coupon Modal */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="Apply Coupon"
      >
        <div className="space-y-4">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <Button fullWidth onClick={handleApplyCoupon}>
            Apply
          </Button>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Available Coupons
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setCouponCode('WELCOME50');
                  handleApplyCoupon();
                }}
                className="w-full text-left p-3 border border-dashed border-orange-300 rounded-lg bg-orange-50"
              >
                <p className="font-semibold text-orange-600">WELCOME50</p>
                <p className="text-sm text-gray-600 mt-1">
                  Get 50% off up to ₹100 on your first order
                </p>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
