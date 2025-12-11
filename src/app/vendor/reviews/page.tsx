'use client';

import { useState } from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  ChevronDown,
  Flag,
  Reply,
  MoreVertical,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
  items: string[];
  reply?: string;
  helpful: number;
  reported: boolean;
}

const mockReviews: Review[] = [
  {
    id: '1',
    customerName: 'Rahul S.',
    rating: 5,
    comment: 'Amazing butter chicken! The gravy was rich and creamy. Best I\'ve had in a long time. Delivery was quick too.',
    date: '2024-01-15T14:30:00',
    orderId: '#1234',
    items: ['Butter Chicken', 'Garlic Naan', 'Dal Makhani'],
    helpful: 12,
    reported: false,
  },
  {
    id: '2',
    customerName: 'Priya M.',
    rating: 4,
    comment: 'Food was delicious but took a bit longer than expected. Would order again though!',
    date: '2024-01-15T12:15:00',
    orderId: '#1233',
    items: ['Paneer Tikka', 'Biryani'],
    reply: 'Thank you for your feedback! We\'re working on improving our delivery times.',
    helpful: 5,
    reported: false,
  },
  {
    id: '3',
    customerName: 'Amit K.',
    rating: 3,
    comment: 'Food was okay, but the portion size could be better for the price.',
    date: '2024-01-14T20:45:00',
    orderId: '#1230',
    items: ['Chicken Biryani'],
    helpful: 3,
    reported: false,
  },
  {
    id: '4',
    customerName: 'Sneha R.',
    rating: 5,
    comment: 'Perfect! The paneer was so soft and the spices were on point. My go-to place for North Indian food.',
    date: '2024-01-14T18:30:00',
    orderId: '#1228',
    items: ['Paneer Butter Masala', 'Roti', 'Raita'],
    helpful: 8,
    reported: false,
  },
  {
    id: '5',
    customerName: 'Vikram D.',
    rating: 2,
    comment: 'Order was missing one item. The food that did arrive was cold.',
    date: '2024-01-14T15:00:00',
    orderId: '#1225',
    items: ['Family Combo'],
    reply: 'We sincerely apologize for this experience. We\'ve issued a refund for the missing item.',
    helpful: 2,
    reported: false,
  },
  {
    id: '6',
    customerName: 'Neha G.',
    rating: 5,
    comment: 'Best dal makhani in the city! Will definitely order again.',
    date: '2024-01-13T21:00:00',
    orderId: '#1220',
    items: ['Dal Makhani', 'Jeera Rice'],
    helpful: 15,
    reported: false,
  },
];

const ratingDistribution = [
  { stars: 5, count: 156, percentage: 62 },
  { stars: 4, count: 58, percentage: 23 },
  { stars: 3, count: 22, percentage: 9 },
  { stars: 2, count: 10, percentage: 4 },
  { stars: 1, count: 5, percentage: 2 },
];

export default function VendorReviewsPage() {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredReviews = mockReviews.filter(review => {
    const matchesRating = filterRating === null || review.rating === filterRating;
    const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const averageRating = 4.6;
  const totalReviews = 251;

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleReply = (reviewId: string) => {
    if (replyText.trim()) {
      console.log('Replying to review:', reviewId, 'with:', replyText);
      setReplyingTo(null);
      setReplyText('');
    }
  };

  return (
    <VendorLayout title="Reviews">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {renderStars(Math.round(averageRating), 'lg')}
              </div>
              <p className="text-4xl font-bold text-gray-900">{averageRating}</p>
              <p className="text-sm text-gray-500 mt-1">Based on {totalReviews} reviews</p>
              <div className="flex items-center justify-center gap-1 text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                +0.2 from last month
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-medium text-gray-900 mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-3">{item.stars}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="font-medium text-gray-900">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-medium text-gray-900">2.5 hrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Positive Reviews</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews This Week</span>
                <span className="font-medium text-gray-900">24</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Reviews List */}
        <Card padding="none">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filter:</span>
                {[null, 5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating ?? 'all'}
                    onClick={() => setFilterRating(rating)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterRating === rating
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating === null ? 'All' : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium">
                      {review.customerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{review.customerName}</span>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Order {review.orderId} • {new Date(review.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Items: {review.items.join(', ')}
                      </p>
                      <p className="text-gray-700 mt-2">{review.comment}</p>

                      {/* Reply */}
                      {review.reply && (
                        <div className="mt-3 pl-4 border-l-2 border-green-500 bg-green-50 p-3 rounded-r-lg">
                          <p className="text-sm font-medium text-green-700">Your Reply</p>
                          <p className="text-sm text-gray-700 mt-1">{review.reply}</p>
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === review.id && (
                        <div className="mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={() => handleReply(review.id)}>
                              Send Reply
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {!review.reply && replyingTo !== review.id && (
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600"
                          >
                            <Reply className="h-4 w-4" />
                            Reply
                          </button>
                        )}
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                          <ThumbsUp className="h-4 w-4" />
                          Helpful ({review.helpful})
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
                          <Flag className="h-4 w-4" />
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No reviews found</p>
            </div>
          )}
        </Card>
      </div>
    </VendorLayout>
  );
}
