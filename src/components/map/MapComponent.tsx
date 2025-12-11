'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const riderIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF5722" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#FF5722"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const storeIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const destinationIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196F3" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#2196F3"/>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapMarker {
  position: [number, number];
  type: 'rider' | 'store' | 'destination' | 'default';
  popup?: string;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: [number, number][];
  showUserLocation?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  height?: string;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onClick) return;
    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);
  return null;
}

function LocationMarker({ onLocationFound }: { onLocationFound?: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });

    map.on('locationfound', (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationFound?.(e.latlng.lat, e.latlng.lng);
    });

    map.on('locationerror', (e) => {
      console.error('Location error:', e.message);
    });
  }, [map, onLocationFound]);

  return position ? (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  ) : null;
}

export default function MapComponent({
  center = [12.9716, 77.5946], // Default to Bangalore
  zoom = 13,
  markers = [],
  route,
  showUserLocation = false,
  onMapClick,
  className = '',
  height = '400px',
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const getIcon = (type: MapMarker['type']) => {
    switch (type) {
      case 'rider':
        return riderIcon;
      case 'store':
        return storeIcon;
      case 'destination':
        return destinationIcon;
      default:
        return defaultIcon;
    }
  };

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onClick={onMapClick} />

        {showUserLocation && (
          <LocationMarker
            onLocationFound={(lat, lng) => setUserLocation([lat, lng])}
          />
        )}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={getIcon(marker.type)}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {route && route.length > 1 && (
          <Polyline
            positions={route}
            color="#FF5722"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}
