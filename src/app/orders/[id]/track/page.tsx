'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Star,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Send,
  X,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { sampleOrder } from '@/data/mockData';
import { formatCurrency, getStatusText } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

const statusSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: CheckCircle2 },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Preparing', icon: CheckCircle2 },
  { status: 'PICKED_UP', label: 'Picked Up', icon: CheckCircle2 },
  { status: 'OUT_FOR_DELIVERY', label: 'On the way', icon: Navigation },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'rider';
  text: string;
  time: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // For demo, use sample order
  const order = sampleOrder;
  const [riderLocation, setRiderLocation] = useState<[number, number]>([
    order.currentLat || 12.96,
    order.currentLng || 77.59,
  ]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'rider', text: 'Hi! I am on my way with your order.', time: '2:30 PM' },
    { id: '2', sender: 'user', text: 'Great, thanks!', time: '2:31 PM' },
  ]);

  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setShowCallModal(true);
    setTimeout(() => {
      setIsCallActive(true);
      toast.success('Connected to rider');
    }, 2000);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setShowCallModal(false);
    toast('Call ended');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setChatMessage('');

    // Simulate rider response
    setTimeout(() => {
      const riderResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'rider',
        text: 'Got it! Will be there soon.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, riderResponse]);
    }, 2000);
  };

  // Simulate rider movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRiderLocation((prev) => [
        prev[0] + (Math.random() - 0.5) * 0.001,
        prev[1] + (Math.random() - 0.5) * 0.001,
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.status === order.status
  );

  // Calculate route from restaurant to rider to destination
  const restaurantLocation: [number, number] = [
    order.vendor?.latitude || 12.9716,
    order.vendor?.longitude || 77.5946,
  ];
  const destinationLocation: [number, number] = [
    order.address?.latitude || 12.98,
    order.address?.longitude || 77.60,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Map */}
      <div className="relative h-72">
        <MapComponent
          center={riderLocation}
          zoom={15}
          markers={[
            {
              position: restaurantLocation,
              type: 'store',
              popup: order.vendor?.name || 'Restaurant',
            },
            {
              position: riderLocation,
              type: 'rider',
              popup: `${order.rider?.name || 'Rider'} - On the way`,
            },
            {
              position: destinationLocation,
              type: 'destination',
              popup: 'Delivery Location',
            },
          ]}
          route={[restaurantLocation, riderLocation, destinationLocation]}
          height="100%"
        />

        {/* Back Button */}
        <Link
          href="/orders"
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg z-10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>

        {/* ETA Card */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Arriving in</p>
                <p className="text-2xl font-bold text-gray-900">15 mins</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order #{order.orderNumber.slice(-6)}</p>
                <p className="text-sm font-medium text-orange-500">
                  {getStatusText(order.status)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
        <div className="relative">
          {statusSteps.slice(0, 5).map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex gap-3 pb-4 last:pb-0">
                {/* Line */}
                {index < 4 && (
                  <div
                    className={`absolute left-3 w-0.5 h-8 ${
                      index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ top: `${index * 48 + 24}px` }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.statusHistory?.find((h) => h.status === step.status)
                        ? 'Just now'
                        : 'In progress...'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Rider Info */}
      {order.rider && (
        <Card className="mx-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden">
              <Image
                src={order.rider.avatar || '/placeholder-avatar.jpg'}
                alt={order.rider.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{order.rider.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{order.rider.rating}</span>
                </div>
                <span>•</span>
                <span>{order.rider.vehicleNumber}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChatModal(true)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleStartCall}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200"
              >
                <Phone className="h-5 w-5 text-green-600" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Order Summary */}
      <Card className="mx-4 mt-4 mb-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
            <Image
              src={order.vendor?.logo || '/placeholder-store.jpg'}
              alt={order.vendor?.name || 'Restaurant'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{order.vendor?.name}</h3>
            <p className="text-sm text-gray-500">
              {order.items.length} items • {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">
                {item.quantity}x {item.product?.name || 'Item'}
              </span>
              <span className="text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Help Button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto">
        <Button variant="outline" fullWidth>
          <AlertCircle className="h-5 w-5" />
          Need Help?
        </Button>
      </div>

      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title=""
        size="lg"
      >
        <div className="flex flex-col h-[60vh]">
          {/* Chat Header */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={order.rider?.avatar || '/placeholder-avatar.jpg'}
                alt={order.rider?.name || 'Rider'}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{order.rider?.name}</h3>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <button onClick={handleStartCall} className="p-2 bg-green-100 rounded-full">
              <Phone className="h-5 w-5 text-green-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-orange-100' : 'text-gray-400'
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="flex gap-2 pb-3 overflow-x-auto">
            {['Where are you?', 'How long?', 'Thanks!'].map((reply) => (
              <button
                key={reply}
                onClick={() => setChatMessage(reply)}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-3 border-t">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="p-3 bg-orange-500 text-white rounded-full disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Call Modal */}
      <Modal
        isOpen={showCallModal}
        onClose={handleEndCall}
        title=""
        size="md"
      >
        <div className="text-center py-8">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
            <Image
              src={order.rider?.avatar || '/placeholder-avatar.jpg'}
              alt={order.rider?.name || 'Rider'}
              fill
              className="object-cover"
            />
            {isCallActive && (
              <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
            )}
          </div>
          <h3 className="text-xl font-semibold">{order.rider?.name}</h3>
          <p className="text-gray-500 mt-1">
            {isCallActive ? formatCallDuration(callDuration) : 'Connecting...'}
          </p>

          {isCallActive && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <button className="p-4 rounded-full bg-gray-100 text-gray-600">
                <Volume2 className="h-6 w-6" />
              </button>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleEndCall}
              className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
