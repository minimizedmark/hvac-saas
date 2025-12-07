'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fixed truck locations
const staticTrucks = [
  { lat: 53.5461, lng: -113.4938, label: 'Unit D2 — Jasper Ave Service Call' },
  { lat: 53.5320, lng: -113.5000, label: 'Unit S1 — Southside Install' },
  { lat: 53.5710, lng: -113.4950, label: 'Unit N1 — Northside Repair' },
];

// Predefined route for moving truck
const routePoints = [
  { lat: 53.5444, lng: -113.4909 },
  { lat: 53.5450, lng: -113.4920 },
  { lat: 53.5455, lng: -113.4930 },
  { lat: 53.5461, lng: -113.4938 },
  { lat: 53.5465, lng: -113.4945 },
  { lat: 53.5470, lng: -113.4955 },
  { lat: 53.5475, lng: -113.4965 },
  { lat: 53.5480, lng: -113.4975 },
];

const truckIcon = L.icon({
  iconUrl: '/truck.png',
  iconSize: [40, 40],
  iconAnchor: [20, 35],
  popupAnchor: [0, -30],
});

function AnimatedTruck() {
  const [routeIndex, setRouteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex(prev => (prev + 1) % routePoints.length);
    }, 3000); // Move to next point every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentPosition = routePoints[routeIndex];

  return (
    <>
      {/* Draw the route line */}
      <Polyline 
        positions={routePoints.map(p => [p.lat, p.lng])} 
        color="#00d4ff" 
        weight={3}
        opacity={0.6}
      />
      {/* Moving truck */}
      <Marker 
        position={[currentPosition.lat, currentPosition.lng]} 
        icon={truckIcon}
      >
        <Popup>Unit D1 — En Route to Downtown Call</Popup>
      </Marker>
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
        
        {/* Static trucks at fixed locations */}
        {staticTrucks.map((truck, idx) => (
          <Marker 
            key={idx} 
            position={[truck.lat, truck.lng]} 
            icon={truckIcon}
          >
            <Popup>{truck.label}</Popup>
          </Marker>
        ))}
        
        {/* One moving truck following route */}
        <AnimatedTruck />
      </MapContainer>
    </div>
  );
}

