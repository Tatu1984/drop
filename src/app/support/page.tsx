'use client';

import { useState } from 'react';
import { ArrowLeft, Search, MessageCircle, Phone, Mail, ChevronRight, Package, CreditCard, MapPin, User, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const categories = [
  { id: 'orders', icon: Package, label: 'Orders & Delivery', count: 12 },
  { id: 'payments', icon: CreditCard, label: 'Payments & Refunds', count: 8 },
  { id: 'account', icon: User, label: 'Account & Profile', count: 6 },
  { id: 'addresses', icon: MapPin, label: 'Address Issues', count: 4 },
];

const popularQuestions = [
  { id: '1', question: 'How do I track my order?', category: 'orders' },
  { id: '2', question: 'How to cancel an order?', category: 'orders' },
  { id: '3', question: 'Refund not received', category: 'payments' },
  { id: '4', question: 'How to change delivery address?', category: 'addresses' },
  { id: '5', question: 'How to update my phone number?', category: 'account' },
];

const recentOrders = [
  { id: 'ORD1234', restaurant: 'Burger King', status: 'Delivered', date: 'Today' },
  { id: 'ORD1233', restaurant: 'Dominos Pizza', status: 'Delivered', date: 'Yesterday' },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/profile">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">Help & Support</h1>
        </div>

        <div className="px-4 pb-6">
          <h2 className="text-xl font-bold mb-2">How can we help you?</h2>
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            className="bg-white"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/support/chat">
            <Card hoverable className="text-center py-4">
              <MessageCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Live Chat</p>
            </Card>
          </Link>
          <Link href="tel:+911800123456">
            <Card hoverable className="text-center py-4">
              <Phone className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Call Us</p>
            </Card>
          </Link>
          <Link href="mailto:support@drop.app">
            <Card hoverable className="text-center py-4">
              <Mail className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Email</p>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Need help with an order?</h3>
          <Card padding="none">
            {recentOrders.map((order, index) => (
              <Link
                key={order.id}
                href={`/support/order/${order.id}`}
                className={`flex items-center gap-3 p-4 ${
                  index !== recentOrders.length - 1 ? 'border-b' : ''
                }`}
              >
                <Package className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{order.restaurant}</p>
                  <p className="text-xs text-gray-500">
                    {order.id} • {order.status} • {order.date}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </Card>
        </div>

        {/* Help Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Browse by Category</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/support/${category.id}`}>
                <Card hoverable>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{category.label}</p>
                      <p className="text-xs text-gray-500">{category.count} articles</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Questions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Popular Questions</h3>
          <Card padding="none">
            {popularQuestions.map((q, index) => (
              <Link
                key={q.id}
                href={`/support/faq/${q.id}`}
                className={`flex items-center gap-3 p-4 ${
                  index !== popularQuestions.length - 1 ? 'border-b' : ''
                }`}
              >
                <HelpCircle className="h-5 w-5 text-gray-400" />
                <span className="flex-1 text-gray-700">{q.question}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </Card>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Legal</h3>
          <Card padding="none">
            <Link href="/terms" className="flex items-center gap-3 p-4 border-b">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="flex-1 text-gray-700">Terms & Conditions</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
            <Link href="/privacy" className="flex items-center gap-3 p-4">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="flex-1 text-gray-700">Privacy Policy</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
