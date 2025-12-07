'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TECHS } from '../lib/demoData';

// Create professional truck icon with SVG
const createTruckIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: ${color}20;
        border: 4px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: all 0.3s;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
          <path d="M16 8h5l3 3v5h-2"></path>
          <circle cx="5.5" cy="18.5" r="2.5" fill="${color}"></circle>
          <circle cx="18.5" cy="18.5" r="2.5" fill="${color}"></circle>
        </svg>
      </div>
    `,
    className: 'custom-truck-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

export default function MapComponent({ height = '100%', width = '100%' }) {
  const [routeIndexes, setRouteIndexes] = useState<{[key: number]: number}>({});

  // Initialize route indexes
  useEffect(() => {
    const indexes: {[key: number]: number} = {};
    TECHS.forEach(tech => {
      indexes[tech.id] = 0;
    });
    setRouteIndexes(indexes);
  }, []);

  // Animate trucks along routes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndexes(prev => {
        const updated = { ...prev };
        TECHS.forEach(tech => {
          if (tech.status === 'en-route' && tech.route && tech.route.length > 0) {
            updated[tech.id] = ((prev[tech.id] || 0) + 1) % tech.route.length;
          }
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={[53.5444, -113.4909]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={19}
        />
        
        {/* Draw routes for en-route techs */}
        {TECHS.map(tech => 
          tech.status === 'en-route' && tech.route && tech.route.length > 0 && (
            <Polyline 
              key={`route-${tech.id}`}
              positions={tech.route.map(p => [p.lat, p.lng])} 
              color={tech.color} 
              weight={5}
              opacity={0.7}
              dashArray="12, 8"
            />
          )
        )}
        
        {/* Show all tech markers at their current positions */}
        {TECHS.map(tech => {
          // Calculate current position for moving trucks
          let currentPos = tech.position;
          if (tech.status === 'en-route' && tech.route && tech.route.length > 0) {
            const index = routeIndexes[tech.id] || 0;
            currentPos = tech.route[index];
          }
          
          return (
            <Marker 
              key={tech.id}
              position={[currentPos.lat, currentPos.lng]} 
              icon={createTruckIcon(tech.color)}
            >
              <Popup maxWidth={280}>
                <div style={{ padding: '12px 8px', fontFamily: 'system-ui, sans-serif' }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    color: tech.color, 
                    fontSize: 18, 
                    fontWeight: 800,
                    borderBottom: `3px solid ${tech.color}`,
                    paddingBottom: 8
                  }}>
                    {tech.name}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                        {tech.truck}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#6b7280' }}>
                        📞 {tech.phone}
                      </p>
                    </div>
                    
                    <div style={{ 
                      padding: '8px 12px', 
                      borderRadius: 8,
                      background: tech.status === 'on-site' ? '#10B98120' : 
                                 tech.status === 'en-route' ? '#3B82F620' : '#6B728020',
                      border: `2px solid ${tech.status === 'on-site' ? '#10B981' : 
                                          tech.status === 'en-route' ? '#3B82F6' : '#6B7280'}`,
                    }}>
                      <p style={{ 
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: tech.status === 'on-site' ? '#10B981' : 
                               tech.status === 'en-route' ? '#3B82F6' : '#6B7280'
                      }}>
                        {tech.status}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: '#f3f4f6', 
                      padding: 10, 
                      borderRadius: 6,
                      borderLeft: `4px solid ${tech.color}`
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#111827' }}>
                        {tech.customer || 'Available'}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#4b5563' }}>
                        📍 {tech.currentJob}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                        {tech.jobType}
                      </p>
                      {tech.eta && (
                        <p style={{ 
                          margin: '8px 0 0 0', 
                          fontSize: 14, 
                          color: tech.color, 
                          fontWeight: 700,
                          textAlign: 'right'
                        }}>
                          🕐 ETA: {tech.eta} min
                        </p>
                      )}
                    </div>
                    
                    <div style={{ 
                      paddingTop: 8, 
                      borderTop: '2px solid #e5e7eb',
                      marginTop: 4
                    }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                        CERTIFICATIONS
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#4b5563' }}>
                        {tech.skills.join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

