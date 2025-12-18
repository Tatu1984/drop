'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, Gift, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useWalletStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { wallet } = useWalletStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setWalletBalance(data.data.balance || 0);
        setTransactions(data.data.transactions || []);
      } else {
        toast.error(data.error || 'Failed to fetch wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setAddingMoney(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please login to continue');
        setAddingMoney(false);
        return;
      }

      const response = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`₹${amount} added to wallet`);
        setShowAddModal(false);
        setAmount('');
        fetchWalletData();
      } else {
        toast.error(data.error || 'Failed to add money');
      }
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('Failed to add money');
    } finally {
      setAddingMoney(false);
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(walletBalance)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Money
          </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card hoverable className="text-center">
            <Gift className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Send Gift</p>
          </Card>
          <Card hoverable className="text-center">
            <ArrowUpRight className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Transfer</p>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Transaction History</h2>
        <Card padding="none">
          {transactions.map((txn, index) => (
            <div
              key={txn.id}
              className={`flex items-center gap-3 p-4 ${
                index !== transactions.length - 1 ? 'border-b' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {txn.type === 'credit' ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {txn.description}
                </p>
                <p className="text-xs text-gray-500">{txn.date}</p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </p>
                <Badge
                  variant={txn.status === 'completed' ? 'success' : 'warning'}
                  size="sm"
                >
                  {txn.status}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Add Money Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Money to Wallet"
      >
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<span className="text-gray-500">₹</span>}
          />

          <div className="flex gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  amount === amt.toString()
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-500'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <Button fullWidth onClick={handleAddMoney} loading={addingMoney}>
            Add {amount ? formatCurrency(parseFloat(amount)) : 'Money'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
