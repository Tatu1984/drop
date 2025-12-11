'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, CreditCard, Smartphone, Building2, Trash2, Check } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  name: string;
  details: string;
  isDefault: boolean;
  icon?: string;
}

const initialPayments: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'HDFC Credit Card',
    details: '**** **** **** 4532',
    isDefault: true,
  },
  {
    id: '2',
    type: 'upi',
    name: 'Google Pay',
    details: 'user@okicici',
    isDefault: false,
  },
  {
    id: '3',
    type: 'netbanking',
    name: 'ICICI Bank',
    details: 'Net Banking',
    isDefault: false,
  },
];

const banks = [
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentMethod[]>(initialPayments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
    bankId: '',
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'upi':
        return <Smartphone className="h-5 w-5" />;
      case 'netbanking':
        return <Building2 className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const handleSave = () => {
    let newPayment: PaymentMethod;

    if (addType === 'card') {
      if (!formData.cardNumber || !formData.cardName) {
        toast.error('Please fill all card details');
        return;
      }
      newPayment = {
        id: Date.now().toString(),
        type: 'card',
        name: formData.cardName,
        details: `**** **** **** ${formData.cardNumber.slice(-4)}`,
        isDefault: payments.length === 0,
      };
    } else if (addType === 'upi') {
      if (!formData.upiId) {
        toast.error('Please enter UPI ID');
        return;
      }
      newPayment = {
        id: Date.now().toString(),
        type: 'upi',
        name: 'UPI',
        details: formData.upiId,
        isDefault: payments.length === 0,
      };
    } else {
      if (!formData.bankId) {
        toast.error('Please select a bank');
        return;
      }
      const bank = banks.find(b => b.id === formData.bankId);
      newPayment = {
        id: Date.now().toString(),
        type: 'netbanking',
        name: bank?.name || 'Bank',
        details: 'Net Banking',
        isDefault: payments.length === 0,
      };
    }

    setPayments([...payments, newPayment]);
    toast.success('Payment method added');
    setShowAddModal(false);
    setFormData({ cardNumber: '', cardName: '', expiry: '', cvv: '', upiId: '', bankId: '' });
  };

  const handleDelete = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
    toast.success('Payment method removed');
  };

  const handleSetDefault = (id: string) => {
    setPayments(payments.map(p => ({
      ...p,
      isDefault: p.id === id,
    })));
    toast.success('Default payment method updated');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold flex-1">Payment Methods</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-orange-500 font-medium"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="p-4 space-y-3">
        {payments.map((payment) => (
          <Card key={payment.id} padding="none">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  {getIcon(payment.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{payment.name}</h3>
                    {payment.isDefault && (
                      <Badge variant="success" size="sm">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{payment.details}</p>
                </div>
                <button
                  onClick={() => handleDelete(payment.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {!payment.isDefault && (
                <button
                  onClick={() => handleSetDefault(payment.id)}
                  className="mt-3 text-sm text-orange-500 font-medium"
                >
                  Set as default
                </button>
              )}
            </div>
          </Card>
        ))}

        {payments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payment methods saved</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Payment Method"
      >
        <div className="space-y-4">
          {/* Type Selector */}
          <div className="flex gap-2">
            {([
              { type: 'card', label: 'Card', icon: CreditCard },
              { type: 'upi', label: 'UPI', icon: Smartphone },
              { type: 'netbanking', label: 'Bank', icon: Building2 },
            ] as const).map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setAddType(type)}
                className={`flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                  addType === type
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Card Form */}
          {addType === 'card' && (
            <>
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              />
              <Input
                label="Cardholder Name"
                placeholder="Name on card"
                value={formData.cardName}
                onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                />
                <Input
                  label="CVV"
                  placeholder="***"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                />
              </div>
            </>
          )}

          {/* UPI Form */}
          {addType === 'upi' && (
            <Input
              label="UPI ID"
              placeholder="yourname@upi"
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            />
          )}

          {/* Net Banking Form */}
          {addType === 'netbanking' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bank
              </label>
              <div className="space-y-2">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setFormData({ ...formData, bankId: bank.id })}
                    className={`w-full p-3 rounded-lg border flex items-center justify-between transition-colors ${
                      formData.bankId === bank.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span>{bank.name}</span>
                    {formData.bankId === bank.id && (
                      <Check className="h-5 w-5 text-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button fullWidth onClick={handleSave}>
            Add Payment Method
          </Button>
        </div>
      </Modal>
    </div>
  );
}
