'use client';
import HVACMap from '../../../components/HVACMap';

export default function GPSPage() {
  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Live GPS Tracking</h1>
      <p style={{ color: '#94a3b8', fontSize: 20, marginBottom: 24 }}>
        See your fleet in real time across Edmonton. Built for Alberta contractors.
      </p>
      <div style={{
        width: '100%', height: 500, border: '3px solid #00d4ff', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,212,255,0.3)', margin: '40px 0'
      }}>
        <HVACMap height="100%" width="100%" />
      </div>
    </div>
  );
}
