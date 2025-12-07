'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TECHS } from '../lib/demoData';

// Create custom icons for each tech using their color
const createTruckIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-center; font-size: 16px;">🚛</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function MapComponent({ height = '100%', width = '100%' }) {
  const [techPositions, setTechPositions] = useState(TECHS);
  const [routeIndexes, setRouteIndexes] = useState<{[key: number]: number}>({});

  // Initialize route indexes for moving techs
  useEffect(() => {
    const indexes: {[key: number]: number} = {};
    TECHS.forEach(tech => {
      if (tech.route && tech.route.length > 0) {
        indexes[tech.id] = 0;
      }
    });
    setRouteIndexes(indexes);
  }, []);

  // Animate moving trucks every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTechPositions(prev => prev.map(tech => {
        if (tech.status === 'en-route' && tech.route && tech.route.length > 0) {
          const currentIndex = routeIndexes[tech.id] || 0;
          const nextIndex = (currentIndex + 1) % tech.route.length;
          
          setRouteIndexes(prev => ({ ...prev, [tech.id]: nextIndex }));
          
          return {
            ...tech,
            position: tech.route[nextIndex]
          };
        }
        return tech;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [routeIndexes]);

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={[53.5444, -113.4909]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Draw routes for moving techs */}
        {techPositions.map(tech => 
          tech.route && tech.route.length > 0 && (
            <Polyline 
              key={`route-${tech.id}`}
              positions={tech.route.map(p => [p.lat, p.lng])} 
              color={tech.color} 
              weight={4}
              opacity={0.6}
              dashArray="10, 10"
            />
          )
        )}
        
        {/* Show all tech markers */}
        {techPositions.map(tech => (
          <Marker 
            key={tech.id}
            position={[tech.position.lat, tech.position.lng]} 
            icon={createTruckIcon(tech.color)}
          >
            <Popup>
              <div style={{ minWidth: 220, padding: 8 }}>
                <h3 style={{ margin: '0 0 8px 0', color: tech.color, fontSize: 16, fontWeight: 700 }}>
                  {tech.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: 13 }}>
                  <strong>{tech.truck}</strong>
                </p>
                <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>
                  {tech.phone}
                </p>
                <div style={{ 
                  margin: '8px 0 4px 0', 
                  padding: '4px 8px', 
                  borderRadius: 4,
                  background: tech.status === 'on-site' ? '#10B981' : 
                             tech.status === 'en-route' ? '#3B82F6' : '#6B7280',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {tech.status}
                </div>
                <p style={{ margin: '8px 0 4px 0', fontSize: 13, fontWeight: 600 }}>
                  {tech.currentJob}
                </p>
                <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>
                  {tech.jobType}
                </p>
                {tech.eta && (
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: tech.color, fontWeight: 600 }}>
                    ETA: {tech.eta} minutes
                  </p>
                )}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
                    Skills: {tech.skills.join(', ')}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

