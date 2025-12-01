'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const truckIcon = L.icon({
  iconUrl: '/truck.png',
  iconSize: [40, 40],
  iconAnchor: [20, 35],
  popupAnchor: [0, -30],
});

export default function HVACMap({ height = '100%', width = '100%' }) {
  return (
    <div style={{ height, width }}>
      <MapContainer
        center={[53.5444, -113.4909]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[53.5444, -113.4909]} icon={truckIcon}>
          <Popup>Downtown Unit D1 — Edmonton Tower</Popup>
        </Marker>
        {/* Add more markers or polylines as needed */}
      </MapContainer>
    </div>
  );
}
