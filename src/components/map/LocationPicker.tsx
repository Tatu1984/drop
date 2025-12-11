'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLocationStore } from '@/store/useStore';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onClose?: () => void;
}

export default function LocationPicker({ onLocationSelect, onClose }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const { currentLocation, setCurrentLocation } = useLocationStore();

  const detectLocation = useCallback(() => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation([latitude, longitude]);
          setCurrentLocation({ latitude, longitude });

          // Reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            setAddress(data.display_name || 'Current Location');
          } catch {
            setAddress('Current Location');
          }
          setIsDetecting(false);
        },
        (error) => {
          console.error('Error detecting location:', error);
          setIsDetecting(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsDetecting(false);
    }
  }, [setCurrentLocation]);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);

    // Reverse geocode
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      setAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchQuery]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation[0], selectedLocation[1], address);
      onClose?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          leftIcon={<Search className="h-5 w-5" />}
          className="flex-1"
        />
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
      </div>

      {/* Detect Location Button */}
      <Button
        onClick={detectLocation}
        variant="outline"
        fullWidth
        loading={isDetecting}
        className="justify-start"
      >
        <Navigation className="h-5 w-5 mr-2" />
        Use my current location
      </Button>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border">
        <MapComponent
          center={selectedLocation || [12.9716, 77.5946]}
          zoom={selectedLocation ? 16 : 13}
          markers={
            selectedLocation
              ? [
                  {
                    position: selectedLocation,
                    type: 'destination',
                    popup: 'Selected Location',
                  },
                ]
              : []
          }
          onMapClick={handleMapClick}
          height="300px"
        />
      </div>

      {/* Selected Address */}
      {address && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{address}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={handleConfirm}
          disabled={!selectedLocation}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
