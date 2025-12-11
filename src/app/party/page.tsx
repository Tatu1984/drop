'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  Clock,
  Share2,
  PartyPopper,
  Utensils,
  Wine,
  Package,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const partyCombos = [
  {
    id: 'combo-1',
    name: 'House Party Pack',
    description: 'Food + Drinks for 10 people',
    price: 4999,
    icon: PartyPopper,
    items: ['10 Pizzas', '20 Starters', '10 Soft Drinks', '2 Desserts'],
  },
  {
    id: 'combo-2',
    name: 'Game Night Special',
    description: 'Snacks & beverages for gaming sessions',
    price: 1999,
    icon: Utensils,
    items: ['5 Burgers', '10 Fries', '10 Cold Drinks', 'Chips & Dips'],
  },
  {
    id: 'combo-3',
    name: 'Wine & Dine',
    description: 'Premium wines with appetizers',
    price: 7999,
    icon: Wine,
    items: ['3 Premium Wines', '5 Cheese Platters', '5 Starters'],
  },
];

export default function PartyPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [partyDate, setPartyDate] = useState('');
  const [partyTime, setPartyTime] = useState('');

  const handleCreateParty = () => {
    if (!partyName || !partyDate || !partyTime) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success('Party created! Share the link with friends');
    setShowCreateModal(false);
    // Reset form
    setPartyName('');
    setPartyDate('');
    setPartyTime('');
  };

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my party on Drop!',
        text: 'Hey! Join my party order on Drop. We can add items together and split the bill.',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Invite link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 mb-4">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper className="h-7 w-7" />
          Party Mode
        </h1>
        <p className="text-white/80 mt-2">
          Order together, split bills, party harder!
        </p>
      </div>

      {/* Create Party */}
      <Card className="mx-4 -mt-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Create a Party</h3>
            <p className="text-sm text-gray-500 mt-1">
              Invite friends to add items together
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </Card>

      {/* How it works */}
      <div className="px-4 py-6">
        <h2 className="font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Invite Friends</p>
          </Card>
          <Card className="text-center p-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Plus className="h-5 w-5 text-pink-600" />
            </div>
            <p className="text-xs text-gray-600">Add Items Together</p>
          </Card>
          <Card className="text-center p-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xs text-gray-600">Split & Pay</p>
          </Card>
        </div>
      </div>

      {/* Party Combos */}
      <div className="px-4 py-2">
        <h2 className="font-semibold text-gray-900 mb-4">Party Combos</h2>
        <div className="space-y-3">
          {partyCombos.map((combo) => (
            <Card key={combo.id} hoverable>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <combo.icon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{combo.name}</h3>
                      <p className="text-sm text-gray-500">{combo.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {combo.items.map((item, idx) => (
                      <Badge key={idx} variant="outline" size="sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-orange-500 mt-2">
                    ₹{combo.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 py-6">
        <h2 className="font-semibold text-gray-900 mb-4">Party Features</h2>
        <div className="space-y-3">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Collaborative Cart</h4>
                <p className="text-sm text-gray-500">Everyone adds items to the same cart</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Synced Delivery</h4>
                <p className="text-sm text-gray-500">All items arrive together</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Easy Bill Split</h4>
                <p className="text-sm text-gray-500">Split equally or by items ordered</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Party Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a Party"
      >
        <div className="space-y-4">
          <Input
            label="Party Name"
            placeholder="e.g., Friday Night Dinner"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={partyDate}
              onChange={(e) => setPartyDate(e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              value={partyTime}
              onChange={(e) => setPartyTime(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button fullWidth onClick={handleCreateParty}>
              Create Party & Invite Friends
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
