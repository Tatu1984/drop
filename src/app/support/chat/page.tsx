'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Paperclip, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

const quickReplies = [
  'Track my order',
  'Request refund',
  'Change address',
  'Cancel order',
];

const botResponses: Record<string, string> = {
  'track my order': 'I can help you track your order! Please share your order ID or I can show you your recent orders.',
  'request refund': 'I understand you want a refund. Could you tell me the issue with your order? Common reasons include: missing items, wrong order, or quality issues.',
  'change address': 'To change your delivery address, go to Profile > Saved Addresses. If an order is already placed, you can only change the address if it hasn\'t been picked up yet.',
  'cancel order': 'You can cancel an order before it\'s picked up by the restaurant. Go to Orders > Select Order > Cancel. A full refund will be processed within 3-5 business days.',
  'default': 'Thanks for your message! A support agent will be with you shortly. In the meantime, you can browse our FAQs or try our quick replies below.',
};

export default function ChatSupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your Drop support assistant. How can I help you today?',
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const responseKey = Object.keys(botResponses).find(key => lowerText.includes(key)) || 'default';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[responseKey],
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/support">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="font-semibold">Drop Support</h1>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              className="px-4 py-2 bg-white border border-orange-200 rounded-full text-sm text-orange-600 whitespace-nowrap hover:bg-orange-50 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Paperclip className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ImageIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="p-3 bg-orange-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
