'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Zone {
  id: string;
  name: string;
  area: string;
  status: 'active' | 'inactive' | 'surge';
  riders: number;
  activeOrders: number;
  avgDeliveryTime: number;
  surgeMultiplier: number;
  coordinates: { lat: number; lng: number };
  radius: number;
}

interface ZoneMapProps {
  zones: Zone[];
  onZoneClick?: (zone: Zone) => void;
}

export default function ZoneMap({ zones, onZoneClick }: ZoneMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center: Bangalore
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: true,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Create layer group for zones
    zonesLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update zones when data changes
  useEffect(() => {
    if (!mapRef.current || !zonesLayerRef.current) return;

    // Clear existing zones
    zonesLayerRef.current.clearLayers();

    // Add zone circles
    zones.forEach((zone) => {
      if (zone.coordinates?.lat && zone.coordinates?.lng) {
        // Determine color based on status
        let color = '#22c55e'; // green for active
        let fillColor = '#22c55e';
        if (zone.status === 'inactive') {
          color = '#9ca3af';
          fillColor = '#9ca3af';
        } else if (zone.status === 'surge') {
          color = '#f97316';
          fillColor = '#f97316';
        }

        // Create circle for zone
        const circle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
          radius: (zone.radius || 3) * 1000, // Convert km to meters
          color: color,
          fillColor: fillColor,
          fillOpacity: 0.2,
          weight: 2,
        });

        // Create popup content
        const popupContent = `
          <div style="min-width: 180px;">
            <h4 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${zone.name}</h4>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${zone.area}</p>
            <div style="border-top: 1px solid #eee; margin: 8px 0; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: #666;">Status:</span>
                <span style="font-weight: 500; color: ${zone.status === 'active' ? '#22c55e' : zone.status === 'surge' ? '#f97316' : '#9ca3af'};">
                  ${zone.status.toUpperCase()}${zone.status === 'surge' ? ` (${zone.surgeMultiplier}x)` : ''}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: #666;">Riders:</span>
                <span style="font-weight: 500;">${zone.riders}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: #666;">Active Orders:</span>
                <span style="font-weight: 500;">${zone.activeOrders}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #666;">Avg Delivery:</span>
                <span style="font-weight: 500; color: ${zone.avgDeliveryTime > 30 ? '#ef4444' : '#22c55e'};">${zone.avgDeliveryTime} min</span>
              </div>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #999;">
              Radius: ${zone.radius} km
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);

        // Add click handler
        if (onZoneClick) {
          circle.on('click', () => onZoneClick(zone));
        }

        // Add zone name label
        const label = L.marker([zone.coordinates.lat, zone.coordinates.lng], {
          icon: L.divIcon({
            className: 'zone-label',
            html: `<div style="
              background: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              white-space: nowrap;
              border-left: 3px solid ${color};
            ">${zone.name}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        });

        zonesLayerRef.current?.addLayer(circle);
        zonesLayerRef.current?.addLayer(label);
      }
    });

    // Fit bounds to show all zones if there are any
    if (zones.length > 0) {
      const validZones = zones.filter(z => z.coordinates?.lat && z.coordinates?.lng);
      if (validZones.length > 0) {
        const bounds = L.latLngBounds(
          validZones.map(z => [z.coordinates.lat, z.coordinates.lng] as [number, number])
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [zones, onZoneClick]);

  return <div ref={mapContainerRef} className="h-full w-full rounded-lg" />;
}
