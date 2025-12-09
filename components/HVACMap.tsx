'use client';
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Tech {
  id: number;
  name: string;
  truck: string;
  phone: string;
  status: 'en-route' | 'on-site' | 'available';
  currentJob: string;
  customer: string | null;
  jobType: string;
  eta: number | null;
  skills: string[];
  color: string;
  position: { lat: number; lng: number };
  route: { lat: number; lng: number }[];
}

interface MapComponentProps {
  height?: string;
  width?: string;
  techs?: Tech[];
}

// Memoized truck icon factory with enhanced styling
const createTruckIcon = (color: string, isMoving: boolean) => {
  const pulseAnimation = isMoving ? `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.1); opacity: 1; }
    }
  ` : '';
  
  return L.divIcon({
    html: `
      <style>${pulseAnimation}</style>
      <div class="truck-marker" style="
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, ${color}30, ${color}15);
        border: 4px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 30px ${color}60;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        ${isMoving ? 'animation: pulse 2s ease-in-out infinite;' : ''}
      ">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
          <path d="M16 8h5l3 3v5h-2"></path>
          <circle cx="5.5" cy="18.5" r="2.5" fill="${color}"></circle>
          <circle cx="18.5" cy="18.5" r="2.5" fill="${color}"></circle>
        </svg>
        ${isMoving ? `<div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background: #10B981;
          border: 3px solid #0a192f;
          border-radius: 50%;
          box-shadow: 0 0 8px #10B981;
        "></div>` : ''}
      </div>
    `,
    className: 'custom-truck-icon',
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
  });
};

export default function MapComponent({ height = '100%', width = '100%', techs = [] }: MapComponentProps) {
  const [routeIndexes, setRouteIndexes] = useState<{[key: number]: number}>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize route indexes when techs change
  useEffect(() => {
    const indexes: {[key: number]: number} = {};
    techs.forEach(tech => {
      indexes[tech.id] = 0;
    });
    setRouteIndexes(indexes);
    setIsInitialized(true);
  }, [techs]);

  // Animate trucks along routes every 3 seconds with smooth progression
  useEffect(() => {
    if (!isInitialized || techs.length === 0) return;

    const interval = setInterval(() => {
      setRouteIndexes(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        techs.forEach(tech => {
          // Only animate if truck has en-route status and has a valid route
          if (tech.status === 'en-route' && tech.route && tech.route.length > 2) {
            const currentIndex = prev[tech.id] || 0;
            // Cycle through route points
            const nextIndex = (currentIndex + 1) % tech.route.length;
            updated[tech.id] = nextIndex;
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [techs, isInitialized]);

  // Memoize truck icons to prevent recreation on every render
  const truckIcons = useMemo(() => {
    const icons: {[key: number]: L.DivIcon} = {};
    techs.forEach(tech => {
      icons[tech.id] = createTruckIcon(tech.color, tech.status === 'en-route');
    });
    return icons;
  }, [techs]);

  // Show loading state if no techs
  if (!techs || techs.length === 0) {
    return (
      <div style={{ 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a192f',
        color: '#00d4ff',
        fontSize: 18,
        fontWeight: 700
      }}>
        Loading map data...
      </div>
    );
  }

  return (
    <div style={{ height, width, position: 'relative' }}>
      <style>{`
        .custom-truck-icon {
          background: transparent !important;
          border: none !important;
          cursor: pointer;
          transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .custom-truck-icon:hover .truck-marker {
          transform: scale(1.15) !important;
        }
        .leaflet-marker-icon {
          transition: all 3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .leaflet-popup-content-wrapper {
          background: linear-gradient(135deg, #0a192f 0%, #001528 100%);
          border: 2px solid #00d4ff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
        }
        .leaflet-popup-tip {
          background: #0a192f;
          border: 2px solid #00d4ff;
          border-top: none;
          border-right: none;
        }
        .leaflet-container {
          background: #0a192f !important;
        }
        .route-polyline {
          animation: dashAnimation 20s linear infinite;
        }
        @keyframes dashAnimation {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
      <MapContainer
        center={[53.5444, -113.4909]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
          subdomains="abcd"
        />
        
        {/* Draw routes for en-route techs with enhanced styling */}
        {techs.map(tech => 
          tech.status === 'en-route' && tech.route && tech.route.length > 0 && (
            <Polyline 
              key={`route-${tech.id}`}
              positions={tech.route.map(p => [p.lat, p.lng])} 
              color={tech.color} 
              weight={4}
              opacity={0.8}
              dashArray="10, 8"
              className="route-polyline"
            >
              <Popup>
                <div style={{ padding: '8px', color: '#e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: tech.color }}>
                    {tech.name}'s Route
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
                    → {tech.currentJob}
                  </p>
                </div>
              </Popup>
            </Polyline>
          )
        )}
        
        {/* Show all tech markers at their current positions with smooth transitions */}
        {techs.map(tech => {
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
              icon={truckIcons[tech.id]}
            >
              <Popup maxWidth={300}>
                <div style={{ 
                  padding: '16px 12px', 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  background: 'transparent',
                  color: '#e2e8f0'
                }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    color: tech.color, 
                    fontSize: 20, 
                    fontWeight: 900,
                    borderBottom: `3px solid ${tech.color}`,
                    paddingBottom: 10,
                    textShadow: `0 0 10px ${tech.color}40`
                  }}>
                    {tech.name}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#00d4ff' }}>
                        {tech.truck}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#94a3b8' }}>
                        📞 {tech.phone}
                      </p>
                    </div>
                    
                    <div style={{ 
                      padding: '10px 14px', 
                      borderRadius: 8,
                      background: tech.status === 'on-site' ? '#10B98130' : 
                                 tech.status === 'en-route' ? '#3B82F630' : '#6B728030',
                      border: `2px solid ${tech.status === 'on-site' ? '#10B981' : 
                                          tech.status === 'en-route' ? '#3B82F6' : '#6B7280'}`,
                      boxShadow: `0 4px 12px ${tech.status === 'on-site' ? '#10B98140' : 
                                               tech.status === 'en-route' ? '#3B82F640' : '#6B728040'}`,
                    }}>
                      <p style={{ 
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 800,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: tech.status === 'on-site' ? '#10B981' : 
                               tech.status === 'en-route' ? '#3B82F6' : '#6B7280'
                      }}>
                        {tech.status === 'en-route' ? `🚛 ${tech.status}` : tech.status}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: '#001528', 
                      padding: 12, 
                      borderRadius: 8,
                      borderLeft: `5px solid ${tech.color}`,
                      boxShadow: `0 2px 8px rgba(0,0,0,0.3)`
                    }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 800, color: '#00d4ff' }}>
                        {tech.customer || 'Available'}
                      </p>
                      <p style={{ margin: '0 0 6px 0', fontSize: 14, color: '#e2e8f0' }}>
                        📍 {tech.currentJob}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                        {tech.jobType}
                      </p>
                      {tech.eta && (
                        <p style={{ 
                          margin: '10px 0 0 0', 
                          fontSize: 16, 
                          color: tech.color, 
                          fontWeight: 900,
                          textAlign: 'right',
                          textShadow: `0 0 8px ${tech.color}60`
                        }}>
                          🕐 ETA: {tech.eta} min
                        </p>
                      )}
                    </div>
                    
                    <div style={{ 
                      paddingTop: 10, 
                      borderTop: '2px solid #334155',
                      marginTop: 6
                    }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        CERTIFICATIONS
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 6 
                      }}>
                        {tech.skills.map((skill, idx) => (
                          <span key={idx} style={{
                            background: '#00d4ff20',
                            border: '1px solid #00d4ff',
                            color: '#00d4ff',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
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
