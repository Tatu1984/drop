'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ShoppingBag,
  Truck,
  CreditCard,
  User,
  Shield,
  Gift,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: any;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    title: 'Orders & Delivery',
    icon: ShoppingBag,
    faqs: [
      {
        question: 'How do I track my order?',
        answer: 'You can track your order by going to "My Orders" section in your profile. Click on the active order to see real-time tracking with rider location on the map.',
      },
      {
        question: 'Can I cancel my order?',
        answer: 'You can cancel your order before it is picked up by the rider. Go to "My Orders", select the order, and tap "Cancel Order". Refund will be processed within 24-48 hours.',
      },
      {
        question: 'What if my order is delayed?',
        answer: 'If your order is delayed beyond the estimated time, you\'ll receive automatic updates. You can also contact support or the rider directly through the app.',
      },
      {
        question: 'How do I report a missing item?',
        answer: 'Go to "My Orders", select the delivered order, and tap "Report Issue". Select "Missing Item" and provide details. We\'ll process a refund or redeliver the item.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Refunds',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept UPI, Credit/Debit Cards, Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery for eligible orders.',
      },
      {
        question: 'How long does a refund take?',
        answer: 'Refunds are processed within 24-48 hours. The amount will be credited to your original payment method within 5-7 business days depending on your bank.',
      },
      {
        question: 'Why was my payment declined?',
        answer: 'Payments can be declined due to insufficient balance, incorrect card details, or bank security checks. Try a different payment method or contact your bank.',
      },
      {
        question: 'How do I add money to my wallet?',
        answer: 'Go to Profile > Wallet > Add Money. You can add money using UPI, cards, or net banking. Wallet balance can be used for faster checkout.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: User,
    faqs: [
      {
        question: 'How do I update my phone number?',
        answer: 'Go to Profile > Edit Profile > Phone Number. You\'ll need to verify the new number with an OTP. Your order history will be retained.',
      },
      {
        question: 'How do I add or edit addresses?',
        answer: 'Go to Profile > Addresses. You can add new addresses, edit existing ones, or set a default delivery address.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Profile > Settings > Delete Account. Note that this action is irreversible and all your data including order history will be permanently deleted.',
      },
    ],
  },
  {
    id: 'promotions',
    title: 'Offers & Promotions',
    icon: Gift,
    faqs: [
      {
        question: 'How do I apply a coupon code?',
        answer: 'During checkout, tap on "Apply Coupon" and enter your code. Valid coupons will be automatically applied to eligible items.',
      },
      {
        question: 'Why is my coupon not working?',
        answer: 'Coupons may have minimum order requirements, specific vendor restrictions, or expiry dates. Check the coupon terms or try a different code.',
      },
      {
        question: 'How does the referral program work?',
        answer: 'Share your referral code with friends. When they complete their first order, both you and your friend get rewards. Check Profile > Referral for your code.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Privacy',
    icon: Shield,
    faqs: [
      {
        question: 'How is my data protected?',
        answer: 'We use industry-standard encryption to protect your personal and payment information. We never share your data with third parties without consent.',
      },
      {
        question: 'How do I report a safety concern?',
        answer: 'If you have safety concerns during delivery, use the SOS button in the order tracking screen or contact our 24/7 support immediately.',
      },
      {
        question: 'Is age verification required for alcohol?',
        answer: 'Yes, you must be 21+ to order alcohol. Age verification is done at the time of delivery. Please keep a valid ID ready.',
      },
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('orders');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => searchQuery === '' || category.faqs.length > 0);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Help & Support</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Quick Actions */}
          <Card>
            <h2 className="font-bold text-gray-900 mb-3">Need Immediate Help?</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => router.push('/support/chat')}
                className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-green-700">Live Chat</span>
              </button>
              <a
                href="tel:+911800123456"
                className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Call Us</span>
              </a>
              <a
                href="mailto:support@drop.com"
                className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Mail className="h-6 w-6 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Email</span>
              </a>
            </div>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">Frequently Asked Questions</h2>
            {filteredCategories.map((category) => (
              <Card key={category.id} padding="none">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <category.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">{category.title}</span>
                    {searchQuery && (
                      <span className="text-xs text-gray-500">({category.faqs.length} results)</span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedCategory === category.id && (
                  <div className="border-t border-gray-100">
                    {category.faqs.map((faq, idx) => (
                      <div key={idx} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === `${category.id}-${idx}` ? null : `${category.id}-${idx}`)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                        >
                          <span className="text-sm font-medium text-gray-900 pr-4">{faq.question}</span>
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                              expandedFaq === `${category.id}-${idx}` ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {expandedFaq === `${category.id}-${idx}` && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Additional Resources */}
          <Card>
            <h2 className="font-bold text-gray-900 mb-3">Additional Resources</h2>
            <div className="space-y-2">
              <a
                href="/terms"
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Terms of Service</span>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              <a
                href="/privacy"
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Privacy Policy</span>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <div className="text-center">
              <HelpCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <Button onClick={() => router.push('/support/chat')} className="w-full">
                Contact Support
              </Button>
            </div>
          </Card>

          <p className="text-center text-xs text-gray-400 py-4">
            Support available 24/7
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
