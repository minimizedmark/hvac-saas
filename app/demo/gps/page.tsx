'use client';
import { useState, useEffect } from 'react';
import HVACMap from '../../../components/HVACMap';

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

export default function GPSPage() {
  const [techs, setTechs] = useState<Tech[]>([]);
  const [updates, setUpdates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh demo state from API
  const fetchDemoState = async () => {
    try {
      const response = await fetch('/api/generate-demo-state');
      
      if (!response.ok) {
        throw new Error('Failed to fetch demo state');
      }
      
      const data = await response.json();
      
      if (data.techs && Array.isArray(data.techs)) {
        setTechs(data.techs);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching demo state:', err);
      setError('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDemoState();
  }, []);

  // Refresh demo state every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDemoState();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Update counter for UI feedback (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(u => u + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ 
          fontSize: 24, 
          color: '#00d4ff', 
          fontWeight: 700,
          animation: 'pulse 2s infinite' 
        }}>
          Loading live GPS tracking...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 60,
        background: '#1a1a2e',
        borderRadius: 12,
        border: '2px solid #EF4444'
      }}>
        <div style={{ fontSize: 24, color: '#EF4444', fontWeight: 700, marginBottom: 12 }}>
          {error}
        </div>
        <button 
          onClick={fetchDemoState}
          style={{
            padding: '12px 24px',
            background: '#00d4ff',
            color: '#0a192f',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Retry
        </button>
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>
        Live GPS Tracking
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 30 }}>
        Real-time fleet tracking across Edmonton • Updates every 3 seconds • Click trucks for details
      </p>
      
      {/* Live Map */}
      <div style={{
        width: '100%',
        height: 600,
        border: '3px solid #00d4ff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,212,255,0.3)',
        marginBottom: 40
      }}>
        <HVACMap height="100%" width="100%" techs={techs} />
      </div>
      
      {/* Tech Status List */}
      <div style={{ background: '#001528', border: '2px solid #334155', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#00d4ff', marginBottom: 16 }}>
          Fleet Status (Updates: {updates})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {techs.map(tech => (
            <div key={tech.id} style={{
              background: '#0a192f',
              border: \2px solid \\,
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: tech.color,
                  animation: tech.status === 'en-route' ? 'pulse 2s infinite' : 'none'
                }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{tech.name}</p>
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>{tech.currentJob}</p>
                  <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{tech.jobType}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: tech.status === 'on-site' ? '#10B981' : 
                             tech.status === 'en-route' ? '#3B82F6' : '#6B7280',
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {tech.status}
                </span>
                {tech.eta && (
                  <p style={{ color: tech.color, fontSize: 14, fontWeight: 600, marginTop: 8 }}>
                    ETA: {tech.eta} min
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
