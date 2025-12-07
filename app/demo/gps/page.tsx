'use client';
import { useState, useEffect } from 'react';
import HVACMap from '../../../components/HVACMap';
import { TECHS } from '../../../lib/demoData';

export default function GPSPage() {
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(u => u + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
        <HVACMap height="100%" width="100%" />
      </div>

      {/* Tech Status List */}
      <div style={{ background: '#001528', border: '2px solid #334155', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#00d4ff', marginBottom: 16 }}>
          Fleet Status (Updates: {updates})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TECHS.map(tech => (
            <div key={tech.id} style={{
              background: '#0a192f',
              border: `2px solid ${tech.color}`,
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
