'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, CreditCard, Wallet, Tag, ChevronRight, Check, Plus, Users, Store, Download, FileText, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, useLocationStore, useWalletStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'wallet', name: 'Drop Wallet', icon: Wallet, balance: 1250 },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, details: '**** 4532' },
  { id: 'upi', name: 'UPI', icon: CreditCard, details: 'Pay via any UPI app' },
  { id: 'cod', name: 'Cash on Delivery', icon: CreditCard, details: 'Pay when delivered' },
];

const savedAddresses = [
  { id: '1', type: 'home', label: 'Home', address: '123 MG Road, Indiranagar, Bangalore 560038' },
  { id: '2', type: 'work', label: 'Office', address: '456 Koramangala 4th Block, Bangalore 560034' },
];

const deliverySlots = [
  { id: '1', label: 'Express', time: '15-20 min', price: 40 },
  { id: '2', label: 'Standard', time: '30-45 min', price: 20 },
  { id: '3', label: 'Scheduled', time: 'Choose time', price: 0 },
];

const coupons = [
  { code: 'FIRST50', discount: 50, minOrder: 200, description: '50% off up to ₹50' },
  { code: 'FREE20', discount: 20, minOrder: 100, description: 'Flat ₹20 off' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { selectedAddress: storeAddress } = useLocationStore();
  const { wallet } = useWalletStore();

  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0]);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [selectedSlot, setSelectedSlot] = useState(deliverySlots[0]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof coupons[0] | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState(0);
  const [isSelfPickup, setIsSelfPickup] = useState(false);
  const [splitBillMode, setSplitBillMode] = useState<'none' | 'equal' | 'custom'>('none');
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [splitContacts, setSplitContacts] = useState([
    { id: '1', name: 'Rahul S.', phone: '9876543210', share: 0 },
    { id: '2', name: 'Priya M.', phone: '9876543211', share: 0 },
  ]);
  const [needGSTInvoice, setNeedGSTInvoice] = useState(false);
  const [gstNumber, setGstNumber] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = isSelfPickup ? 0 : selectedSlot.price;
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal * 0.5) : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes + tip - discount;
  const yourShare = splitBillMode === 'equal' && splitWith.length > 0
    ? Math.ceil(total / (splitWith.length + 1))
    : total;

  const applyCoupon = () => {
    const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    if (coupon) {
      if (subtotal >= coupon.minOrder) {
        setAppliedCoupon(coupon);
        toast.success(`Coupon applied! You saved ₹${coupon.discount}`);
        setShowCouponModal(false);
      } else {
        toast.error(`Minimum order ₹${coupon.minOrder} required`);
      }
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearCart();
    toast.success('Order placed successfully!');
    router.push('/orders/ORD123/track');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/cart">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Checkout</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Delivery Address */}
        <Card padding="none">
          <button
            onClick={() => setShowAddressModal(true)}
            className="w-full p-4 flex items-start gap-3 text-left"
          >
            <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  Deliver to {selectedAddress.label}
                </span>
                <Badge variant="default" size="sm">{selectedAddress.type}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedAddress.address}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* Self Pickup Toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900">Self Pickup</p>
                <p className="text-xs text-gray-500">Pick up from restaurant & save delivery fee</p>
              </div>
            </div>
            <button
              onClick={() => setIsSelfPickup(!isSelfPickup)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isSelfPickup ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isSelfPickup ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Delivery Time - Only show if not self pickup */}
        {!isSelfPickup && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-gray-900">Delivery Time</span>
            </div>
            <div className="flex gap-2">
              {deliverySlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                    selectedSlot.id === slot.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium text-sm">{slot.label}</p>
                  <p className="text-xs text-gray-500">{slot.time}</p>
                  {slot.price > 0 && (
                    <p className="text-xs text-orange-500 mt-1">+₹{slot.price}</p>
                  )}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.product.name}
              </span>
              <span className="font-medium">{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}</span>
            </div>
          ))}
        </Card>

        {/* Coupon */}
        <Card padding="none">
          <button
            onClick={() => setShowCouponModal(true)}
            className="w-full p-4 flex items-center gap-3"
          >
            <Tag className="h-5 w-5 text-orange-500" />
            {appliedCoupon ? (
              <div className="flex-1 text-left">
                <span className="font-medium text-green-600">
                  {appliedCoupon.code} applied
                </span>
                <p className="text-xs text-gray-500">You saved ₹{discount}</p>
              </div>
            ) : (
              <span className="flex-1 text-left text-gray-600">Apply coupon code</span>
            )}
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* Tip */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Tip your delivery partner</h3>
          <div className="flex gap-2">
            {[0, 20, 30, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => setTip(amount)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tip === amount
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {amount === 0 ? 'No tip' : `₹${amount}`}
              </button>
            ))}
          </div>
        </Card>

        {/* Split Bill */}
        <Card padding="none">
          <button
            onClick={() => setShowSplitBillModal(true)}
            className="w-full p-4 flex items-center gap-3"
          >
            <Users className="h-5 w-5 text-orange-500" />
            <div className="flex-1 text-left">
              {splitBillMode === 'none' ? (
                <span className="text-gray-600">Split bill with friends</span>
              ) : (
                <div>
                  <span className="font-medium text-green-600">
                    Splitting with {splitWith.length} {splitWith.length === 1 ? 'person' : 'people'}
                  </span>
                  <p className="text-xs text-gray-500">Your share: {formatCurrency(yourShare)}</p>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* Payment Method */}
        <Card padding="none">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full p-4 flex items-center gap-3"
          >
            <CreditCard className="h-5 w-5 text-orange-500" />
            <div className="flex-1 text-left">
              <span className="font-medium text-gray-900">
                {paymentMethods.find(p => p.id === selectedPayment)?.name}
              </span>
              {selectedPayment === 'wallet' && (
                <p className="text-xs text-gray-500">Balance: ₹{wallet?.balance || 1250}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* GST Invoice */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900">GST Invoice</p>
                <p className="text-xs text-gray-500">Get GST compliant invoice</p>
              </div>
            </div>
            <button
              onClick={() => setNeedGSTInvoice(!needGSTInvoice)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                needGSTInvoice ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  needGSTInvoice ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {needGSTInvoice && (
            <div className="mt-4">
              <Input
                label="GST Number"
                placeholder="Enter your GSTIN"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              />
            </div>
          )}
        </Card>

        {/* Bill Details */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & Charges</span>
              <span>{formatCurrency(taxes)}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Tip</span>
                <span>{formatCurrency(tip)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Grand Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={loading}>
          Place Order • {formatCurrency(total)}
        </Button>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Select Delivery Address"
      >
        <div className="space-y-3">
          {savedAddresses.map((address) => (
            <button
              key={address.id}
              onClick={() => {
                setSelectedAddress(address);
                setShowAddressModal(false);
              }}
              className={`w-full p-4 rounded-lg border text-left transition-colors ${
                selectedAddress.id === address.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{address.label}</span>
                {selectedAddress.id === address.id && (
                  <Check className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{address.address}</p>
            </button>
          ))}
          <Link href="/profile/addresses">
            <Button variant="outline" fullWidth>
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </Link>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Select Payment Method"
      >
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                setSelectedPayment(method.id);
                setShowPaymentModal(false);
              }}
              className={`w-full p-4 rounded-lg border flex items-center gap-3 transition-colors ${
                selectedPayment === method.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <method.icon className="h-5 w-5 text-gray-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{method.name}</p>
                {method.balance && (
                  <p className="text-xs text-gray-500">Balance: ₹{method.balance}</p>
                )}
                {method.details && (
                  <p className="text-xs text-gray-500">{method.details}</p>
                )}
              </div>
              {selectedPayment === method.id && (
                <Check className="h-5 w-5 text-orange-500" />
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Coupon Modal */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="Apply Coupon"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={applyCoupon}>Apply</Button>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">Available Coupons</p>
            {coupons.map((coupon) => (
              <button
                key={coupon.code}
                onClick={() => {
                  setCouponCode(coupon.code);
                  applyCoupon();
                }}
                className="w-full p-3 rounded-lg border border-dashed border-orange-300 bg-orange-50 text-left"
              >
                <p className="font-bold text-orange-600">{coupon.code}</p>
                <p className="text-sm text-gray-600">{coupon.description}</p>
                <p className="text-xs text-gray-400 mt-1">Min. order ₹{coupon.minOrder}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Split Bill Modal */}
      <Modal
        isOpen={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        title="Split Bill"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {(['none', 'equal', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSplitBillMode(mode)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  splitBillMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                {mode === 'none' ? 'Pay Alone' : mode === 'equal' ? 'Split Equally' : 'Custom Split'}
              </button>
            ))}
          </div>

          {splitBillMode !== 'none' && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Select people to split with</p>
                <div className="space-y-2">
                  {splitContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        if (splitWith.includes(contact.id)) {
                          setSplitWith(splitWith.filter(id => id !== contact.id));
                        } else {
                          setSplitWith([...splitWith, contact.id]);
                        }
                      }}
                      className={`w-full p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        splitWith.includes(contact.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.phone}</p>
                        </div>
                      </div>
                      {splitWith.includes(contact.id) && (
                        <Check className="h-5 w-5 text-orange-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="outline" fullWidth>
                <Plus className="h-4 w-4" />
                Add from contacts
              </Button>

              {splitWith.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Split Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Split between</span>
                      <span className="font-medium">{splitWith.length + 1} people</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium text-gray-900">Your share</span>
                      <span className="font-bold text-orange-600">{formatCurrency(yourShare)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <Button
            fullWidth
            onClick={() => {
              if (splitBillMode !== 'none' && splitWith.length > 0) {
                toast.success('Split request sent to selected contacts!');
              }
              setShowSplitBillModal(false);
            }}
          >
            {splitBillMode === 'none' ? 'Pay Alone' : 'Confirm Split'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
