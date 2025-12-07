'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Employee profiles linked to trucks
const employees = [
  {
    id: 1,
    name: 'Mike Johnson',
    role: 'Senior Technician',
    truck: 'Unit 1',
    location: { lat: 53.5320, lng: -113.5200 },
    address: '123 Maple Crescent, Edmonton',
    type: 'residential',
    status: 'On Site - Furnace Repair'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'HVAC Specialist',
    truck: 'Unit 2',
    location: { lat: 53.5180, lng: -113.4850 },
    address: '456 Oak Drive, Edmonton',
    type: 'residential',
    status: 'On Site - AC Installation'
  },
  {
    id: 3,
    name: 'David Martinez',
    role: 'Lead Installer',
    truck: 'Unit 3',
    location: { lat: 53.5461, lng: -113.4938 },
    address: 'Commerce Place, 10155 102 St',
    type: 'commercial',
    status: 'On Site - Rooftop Unit Service'
  },
  {
    id: 4,
    name: 'Emma Wilson',
    role: 'Service Technician',
    truck: 'Unit 4',
    location: { lat: 53.5444, lng: -113.4909 },
    address: 'Manulife Place, 10180 101 St',
    type: 'commercial',
    status: 'On Site - Chiller Maintenance'
  },
  {
    id: 5,
    name: 'James Thompson',
    role: 'Lead Technician',
    truck: 'Unit 5',
    route: [
      { lat: 53.5444, lng: -113.4909, label: 'Starting - Downtown Core' },
      { lat: 53.5450, lng: -113.4880 },
      { lat: 53.5460, lng: -113.4850 },
      { lat: 53.5475, lng: -113.4820 },
      { lat: 53.5490, lng: -113.4790 },
      { lat: 53.5510, lng: -113.4750 },
      { lat: 53.5530, lng: -113.4710 },
      { lat: 53.5555, lng: -113.4670 },
      { lat: 53.5580, lng: -113.4630 },
      { lat: 53.5600, lng: -113.4590, label: 'Destination - Northeast Edmonton' }
    ],
    address: 'En route to 7890 Yellowhead Trail',
    type: 'moving',
    status: 'En Route - Emergency Call'
  }
];

const truckIcon = L.icon({
  iconUrl: '/truck.png',
  iconSize: [40, 40],
  iconAnchor: [20, 35],
  popupAnchor: [0, -30],
});

function MovingTruck() {
  const [routeIndex, setRouteIndex] = useState(0);
  const movingEmployee = employees.find(e => e.type === 'moving')!;

  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex(prev => (prev + 1) % movingEmployee.route!.length);
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, [movingEmployee.route]);

  const currentPosition = movingEmployee.route![routeIndex];

  return (
    <>
      {/* Route line */}
      <Polyline 
        positions={movingEmployee.route!.map(p => [p.lat, p.lng])} 
        color="#00d4ff" 
        weight={4}
        opacity={0.7}
        dashArray="10, 10"
      />
      {/* Moving truck */}
      <Marker 
        position={[currentPosition.lat, currentPosition.lng]} 
        icon={truckIcon}
      >
        <Popup>
          <div style={{ minWidth: 200 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#00d4ff' }}>{movingEmployee.name}</h3>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>{movingEmployee.role}</strong></p>
            <p style={{ margin: '4px 0', fontSize: 13 }}>{movingEmployee.truck}</p>
            <p style={{ margin: '8px 0 4px 0', fontSize: 13, color: '#ff6b6b' }}><strong>{movingEmployee.status}</strong></p>
            <p style={{ margin: '4px 0', fontSize: 12 }}>{movingEmployee.address}</p>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export default function MapComponent({ height = '100%', width = '100%' }) {
  const staticEmployees = employees.filter(e => e.type !== 'moving');

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={[53.5444, -113.4909]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Static trucks at job sites */}
        {staticEmployees.map((employee) => (
          <Marker 
            key={employee.id} 
            position={[employee.location.lat, employee.location.lng]} 
            icon={truckIcon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#00d4ff' }}>{employee.name}</h3>
                <p style={{ margin: '4px 0', fontSize: 14 }}><strong>{employee.role}</strong></p>
                <p style={{ margin: '4px 0', fontSize: 13 }}>{employee.truck}</p>
                <p style={{ margin: '8px 0 4px 0', fontSize: 13, color: '#52c41a' }}><strong>{employee.status}</strong></p>
                <p style={{ margin: '4px 0', fontSize: 12 }}>{employee.address}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#888' }}>
                  {employee.type === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Moving truck */}
        <MovingTruck />
      </MapContainer>
    </div>
  );
}

