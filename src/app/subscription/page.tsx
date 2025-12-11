'use client';

import { useState } from 'react';
import { ArrowLeft, Crown, Check, Zap, Truck, Gift, Percent, Star, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 149,
    duration: '1 month',
    savings: null,
    popular: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 399,
    originalPrice: 447,
    duration: '3 months',
    savings: '10%',
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Annual',
    price: 1199,
    originalPrice: 1788,
    duration: '12 months',
    savings: '33%',
    popular: false,
  },
];

const benefits = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Unlimited free deliveries on all orders above ₹99',
  },
  {
    icon: Percent,
    title: 'Extra Discounts',
    description: 'Get additional 10% off on all orders',
  },
  {
    icon: Zap,
    title: 'Priority Delivery',
    description: 'Your orders get delivered first',
  },
  {
    icon: Gift,
    title: 'Exclusive Offers',
    description: 'Access to member-only deals and flash sales',
  },
  {
    icon: Star,
    title: 'Double Loyalty Points',
    description: 'Earn 2x loyalty points on every order',
  },
  {
    icon: Shield,
    title: 'No Surge Pricing',
    description: 'Never pay surge charges during peak hours',
  },
];

const faqs = [
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your profile settings. Your benefits will continue until the end of your billing period.',
  },
  {
    question: 'Can I share my Prime membership?',
    answer: 'Prime benefits are linked to your account and cannot be shared. However, you can add family members at a discounted rate.',
  },
  {
    question: 'What happens to my unused benefits?',
    answer: 'Unused benefits do not carry over to the next billing cycle. Make sure to use all your benefits before they expire.',
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Welcome to Drop Prime!');
    router.push('/profile');
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/profile">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">Drop Prime</h1>
        </div>

        <div className="px-4 py-8 text-center">
          <Crown className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upgrade to Prime</h2>
          <p className="text-white/80">
            Unlock exclusive benefits and save more on every order
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Plans */}
        <div className="space-y-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${
                selectedPlan === plan.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <Badge
                  variant="warning"
                  className="absolute -top-2 right-4"
                >
                  Most Popular
                </Badge>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.duration}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₹{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  {plan.savings && (
                    <Badge variant="success" size="sm">Save {plan.savings}</Badge>
                  )}
                </div>
              </div>
              {selectedPlan === plan.id && (
                <div className="absolute top-4 left-4 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Prime Benefits</h3>
          <Card padding="none">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 ${
                  index !== benefits.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-500">{benefit.description}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Savings Calculator */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="font-semibold text-gray-900 mb-2">Your Estimated Savings</h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on average Prime member usage
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">₹1,200</p>
              <p className="text-xs text-gray-500">Delivery savings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">₹800</p>
              <p className="text-xs text-gray-500">Extra discounts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">₹2,000+</p>
              <p className="text-xs text-gray-500">Total savings/year</p>
            </div>
          </div>
        </Card>

        {/* FAQs */}
        <div>
          <h3 className="text-lg font-semibold mb-4">FAQs</h3>
          <Card padding="none">
            {faqs.map((faq, index) => (
              <button
                key={index}
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className={`w-full text-left p-4 ${
                  index !== faqs.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <span className="text-gray-400">
                    {expandedFaq === index ? '−' : '+'}
                  </span>
                </div>
                {expandedFaq === index && (
                  <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                )}
              </button>
            ))}
          </Card>
        </div>
      </div>

      {/* Subscribe Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button fullWidth size="lg" onClick={handleSubscribe} loading={loading}>
          <Crown className="h-5 w-5" />
          Subscribe for ₹{selectedPlanData?.price}/{selectedPlanData?.duration}
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
