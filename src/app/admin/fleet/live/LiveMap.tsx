'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LiveMapActiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  pickup: { name: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
}

export interface LiveMapRider {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  status: 'online' | 'busy' | 'offline';
  lat: number;
  lng: number;
  vehicle: string;
  vehicleNumber?: string;
  zone?: string | null;
  rating?: number;
  totalDeliveries?: number;
  activeOrder: LiveMapActiveOrder | null;
}

export interface LiveMapZone {
  id: string;
  name: string;
  polygon: unknown;
  deliveryFee: number;
}

export interface LiveMapUnassignedOrder {
  id: string;
  orderNumber: string;
  status: string;
  vendor: { name: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
}

export interface LiveMapProps {
  riders: LiveMapRider[];
  zones: LiveMapZone[];
  unassignedOrders: LiveMapUnassignedOrder[];
  onRiderClick: (rider: LiveMapRider) => void;
}

// Create custom marker icons
const createRiderIcon = (status: string) => {
  const color = status === 'online' ? '#22c55e' : status === 'busy' ? '#f97316' : '#9ca3af';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="15" cy="5" r="1"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const unassignedOrderIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #ef4444;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const pickupIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
      </svg>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const dropoffIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #10b981;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function LiveMap({ riders, zones, unassignedOrders, onRiderClick }: LiveMapProps): React.ReactElement {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesRef = useRef<L.LayerGroup | null>(null);
  const zonesRef = useRef<L.LayerGroup | null>(null);

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

    // Create layer groups
    markersRef.current = L.layerGroup().addTo(map);
    routesRef.current = L.layerGroup().addTo(map);
    zonesRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !routesRef.current) return;

    // Clear existing markers and routes
    markersRef.current.clearLayers();
    routesRef.current.clearLayers();

    // Add rider markers
    riders.forEach((rider) => {
      if (rider.lat && rider.lng) {
        const marker = L.marker([rider.lat, rider.lng], {
          icon: createRiderIcon(rider.status),
        });

        marker.bindPopup(`
          <div style="min-width: 150px;">
            <strong>${rider.name}</strong><br/>
            <span style="color: ${rider.status === 'online' ? 'green' : rider.status === 'busy' ? 'orange' : 'gray'};">
              ● ${rider.status.toUpperCase()}
            </span><br/>
            <small>${rider.vehicle}</small>
            ${rider.activeOrder ? `<br/><small style="color: orange;">Order #${rider.activeOrder.orderNumber}</small>` : ''}
          </div>
        `);

        marker.on('click', () => onRiderClick(rider));
        markersRef.current?.addLayer(marker);

        // If rider has active order, draw route
        if (rider.activeOrder && rider.activeOrder.pickup.lat && rider.activeOrder.dropoff.lat) {
          // Add pickup marker
          const pickupMarker = L.marker(
            [rider.activeOrder.pickup.lat, rider.activeOrder.pickup.lng],
            { icon: pickupIcon }
          );
          pickupMarker.bindPopup(`<strong>Pickup:</strong> ${rider.activeOrder.pickup.name}`);
          routesRef.current?.addLayer(pickupMarker);

          // Add dropoff marker
          const dropoffMarker = L.marker(
            [rider.activeOrder.dropoff.lat, rider.activeOrder.dropoff.lng],
            { icon: dropoffIcon }
          );
          dropoffMarker.bindPopup(`<strong>Dropoff:</strong> ${rider.activeOrder.dropoff.address}`);
          routesRef.current?.addLayer(dropoffMarker);

          // Draw route line
          const routeLine = L.polyline(
            [
              [rider.lat, rider.lng],
              [rider.activeOrder.pickup.lat, rider.activeOrder.pickup.lng],
              [rider.activeOrder.dropoff.lat, rider.activeOrder.dropoff.lng],
            ],
            {
              color: '#f97316',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10',
            }
          );
          routesRef.current?.addLayer(routeLine);
        }
      }
    });

    // Add unassigned order markers
    unassignedOrders.forEach((order) => {
      if (order.vendor.lat && order.vendor.lng) {
        const marker = L.marker([order.vendor.lat, order.vendor.lng], {
          icon: unassignedOrderIcon,
        });
        marker.bindPopup(`
          <div style="min-width: 150px;">
            <strong style="color: #ef4444;">Unassigned Order</strong><br/>
            <strong>#${order.orderNumber}</strong><br/>
            <small>${order.vendor.name}</small><br/>
            <small style="color: gray;">${order.status}</small>
          </div>
        `);
        markersRef.current?.addLayer(marker);
      }
    });

    // Fit bounds to show all markers if there are any
    const allPoints: [number, number][] = [];
    riders.forEach(r => {
      if (r.lat && r.lng) allPoints.push([r.lat, r.lng]);
    });
    unassignedOrders.forEach(o => {
      if (o.vendor.lat && o.vendor.lng) allPoints.push([o.vendor.lat, o.vendor.lng]);
    });

    if (allPoints.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(allPoints);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [riders, unassignedOrders, onRiderClick]);

  // Update zone overlays
  useEffect(() => {
    if (!mapRef.current || !zonesRef.current) return;

    zonesRef.current.clearLayers();

    zones.forEach((zone) => {
      try {
        const polygon = zone.polygon as { coordinates?: number[][][] };
        if (polygon && polygon.coordinates && polygon.coordinates[0]) {
          // Convert GeoJSON coordinates to Leaflet format
          const latLngs = polygon.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);

          if (latLngs.length > 2) {
            const zonePolygon = L.polygon(latLngs, {
              color: '#3b82f6',
              weight: 2,
              opacity: 0.6,
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
            });
            zonePolygon.bindPopup(`<strong>${zone.name}</strong><br/>Delivery Fee: ₹${zone.deliveryFee}`);
            zonesRef.current?.addLayer(zonePolygon);
          }
        }
      } catch (err) {
        console.error('Error rendering zone:', zone.name, err);
      }
    });
  }, [zones]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
