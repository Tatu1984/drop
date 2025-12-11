'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Download, Eye, RefreshCw, Calendar, Filter } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorGstin?: string;
  period: string;
  totalAmount: number;
  gstAmount: number;
  netAmount: number;
  status: 'generated' | 'sent' | 'paid' | 'overdue';
  generatedAt: string;
  dueDate: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this_month');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, dateRange]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/finance/invoices?status=${statusFilter}&range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data.invoices);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    invoice.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success" size="sm">Paid</Badge>;
      case 'sent': return <Badge variant="info" size="sm">Sent</Badge>;
      case 'generated': return <Badge variant="warning" size="sm">Generated</Badge>;
      case 'overdue': return <Badge variant="error" size="sm">Overdue</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
    totalGst: invoices.reduce((sum, i) => sum + i.gstAmount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <AdminLayout title="GST & Invoices">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-xl font-bold">{stats.totalInvoices}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total GST</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalGst)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold">{stats.overdue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export GST
            </Button>
            <Button>
              Generate Invoices
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText className="h-12 w-12 mb-2" />
            <p>No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST (18%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.vendorName}</p>
                        {invoice.vendorGstin && (
                          <p className="text-xs text-gray-500">GSTIN: {invoice.vendorGstin}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{invoice.period}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(invoice.netAmount)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(invoice.gstAmount)}</td>
                    <td className="px-4 py-3 text-sm font-bold">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-4 py-3 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
