'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Bell, Search as SearchIcon, Mic, MicOff, X } from 'lucide-react';
import { useLocationStore, useNotificationStore, useUIStore, useSearchStore } from '@/store/useStore';
import Modal from '@/components/ui/Modal';
import LocationPicker from '@/components/map/LocationPicker';
import toast from 'react-hot-toast';

// Define SpeechRecognition types for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { selectedAddress, currentLocation } = useLocationStore();
  const { unreadCount } = useNotificationStore();
  const { toggleSearch } = useUIStore();
  const { setQuery: setSearchQuery } = useSearchStore();

  const { setCurrentLocation, setSelectedAddress, addAddress } = useLocationStore();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptText;
            } else {
              interim += transcriptText;
            }
          }

          if (final) {
            setTranscript(prev => prev + final);
          }
          setInterimTranscript(interim);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please enable it in your browser settings.');
          } else if (event.error === 'no-speech') {
            toast.error('No speech detected. Please try again.');
          }
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Don't show on rider or admin routes
  if (pathname.startsWith('/rider') || pathname.startsWith('/admin')) {
    return null;
  }

  const displayAddress = selectedAddress?.fullAddress ||
    (currentLocation ? 'Current Location' : 'Select Location');

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setShowVoiceModal(true);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleVoiceSearch = () => {
    const searchText = transcript.trim();
    if (searchText) {
      setSearchQuery(searchText);
      setShowVoiceModal(false);
      setTranscript('');
      setInterimTranscript('');
      router.push(`/search?q=${encodeURIComponent(searchText)}`);
      toast.success(`Searching for "${searchText}"`);
    } else {
      toast.error('Please say something to search');
    }
  };

  const closeVoiceModal = () => {
    stopListening();
    setShowVoiceModal(false);
    setTranscript('');
    setInterimTranscript('');
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    // Save location to store
    setCurrentLocation({ latitude: lat, longitude: lng, address });

    // Create and save a new address
    const newAddress = {
      id: `addr-${Date.now()}`,
      userId: 'current-user',
      label: 'Selected Location',
      fullAddress: address,
      latitude: lat,
      longitude: lng,
      isDefault: false,
    };
    addAddress(newAddress);
    setSelectedAddress(newAddress);
    setShowLocationPicker(false);
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-100 z-30">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Location */}
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-1 min-w-0 flex-1"
            >
              <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Deliver to</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayAddress}
                  </p>
                  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                </div>
              </div>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <SearchIcon className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={startListening}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Voice Search"
              >
                <Mic className="h-5 w-5 text-gray-600" />
              </button>

              <Link
                href="/notifications"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Location Picker Modal */}
      <Modal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        title="Choose delivery location"
        size="lg"
      >
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      </Modal>

      {/* Voice Search Modal */}
      <Modal
        isOpen={showVoiceModal}
        onClose={closeVoiceModal}
        title="Voice Search"
        size="md"
      >
        <div className="py-6 text-center">
          {/* Animated Microphone */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-orange-100 animate-ping' : 'bg-gray-100'}`} />
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
              isListening ? 'bg-orange-500' : 'bg-gray-200'
            }`}>
              {isListening ? (
                <Mic className="h-10 w-10 text-white" />
              ) : (
                <MicOff className="h-10 w-10 text-gray-400" />
              )}
            </div>
          </div>

          {/* Status Text */}
          <p className={`text-lg font-medium mb-2 ${isListening ? 'text-orange-600' : 'text-gray-600'}`}>
            {isListening ? 'Listening...' : 'Tap to speak'}
          </p>

          {/* Transcript Display */}
          <div className="min-h-[60px] bg-gray-50 rounded-lg p-4 mb-4 mx-4">
            {transcript || interimTranscript ? (
              <p className="text-gray-800">
                {transcript}
                <span className="text-gray-400">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-gray-400">
                {isListening ? 'Say something like "biryani" or "pizza near me"' : 'Your search will appear here'}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {isListening ? (
              <button
                onClick={stopListening}
                className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => {
                  setTranscript('');
                  setInterimTranscript('');
                  try {
                    recognitionRef.current?.start();
                  } catch (error) {
                    console.error('Error starting speech recognition:', error);
                  }
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
              >
                Start Speaking
              </button>
            )}
            {transcript && (
              <button
                onClick={handleVoiceSearch}
                className="px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
              >
                Search
              </button>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">Try saying:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Biryani', 'Pizza', 'Chinese food', 'Coffee'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowVoiceModal(false);
                    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                    toast.success(`Searching for "${suggestion}"`);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
