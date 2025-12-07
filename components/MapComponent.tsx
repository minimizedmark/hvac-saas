'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Edmonton coordinates for realistic truck movement
const edmontonRoutes = [
  { lat: 53.5444, lng: -113.4909, label: 'Downtown Unit D1 — Edmonton Tower' },
  { lat: 53.5461, lng: -113.4938, label: 'Unit D2 — Jasper Ave Service Call' },
  { lat: 53.5320, lng: -113.5000, label: 'Unit S1 — Southside Install' },
  { lat: 53.5710, lng: -113.4950, label: 'Unit N1 — Northside Repair' },
];

const truckIcon = L.icon({
  iconUrl: '/truck.png',
  iconSize: [40, 40],
  iconAnchor: [20, 35],
  popupAnchor: [0, -30],
});

// Fallback icon if truck.png not found
const defaultIcon = L.divIcon({
  html: '🚛',
  iconSize: [30, 30],
  className: 'truck-emoji-icon'
});

function AnimatedTrucks() {
  const [positions, setPositions] = useState(edmontonRoutes);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map((pos, idx) => {
        // Simulate truck movement - small random changes
        const latChange = (Math.random() - 0.5) * 0.002;
        const lngChange = (Math.random() - 0.5) * 0.002;
        return {
          ...pos,
          lat: pos.lat + latChange,
          lng: pos.lng + lngChange,
        };
      }));
    }, 3000); // Update every 3 seconds as advertised

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {positions.map((pos, idx) => (
        <Marker 
          key={idx} 
          position={[pos.lat, pos.lng]} 
          icon={truckIcon}
        >
          <Popup>{pos.label}</Popup>
        </Marker>
      ))}
    </>
  );
}

export default function MapComponent({ height = '100%', width = '100%' }) {
  return (
    <div style={{ height, width }}>
      <MapContainer
        center={[53.5444, -113.4909]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <AnimatedTrucks />
      </MapContainer>
    </div>
  );
}

