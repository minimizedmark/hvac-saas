'use client';
import { useState, useEffect } from 'react';
import { TECHS, JOBS } from '../../../lib/demoData';

export default function Dashboard() {
  const [revenue, setRevenue] = useState(18400);
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 50));
      setUpdates(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeTechs = TECHS.filter(t => t.status === 'on-site' || t.status === 'en-route').length;
  const activeJobs = JOBS.filter(j => j.status === 'in-progress').length;

  return (
    <div>
      {/* Demo Navigation */}
      <div style={{ 
        background: '#001528', 
        border: '2px solid #334155', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 32,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <a href="/demo/dashboard" style={{ padding: '8px 16px', background: '#00d4ff', color: '#0a192f', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📊 Dashboard</a>
        <a href="/demo/gps" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📍 GPS Tracking</a>
        <a href="/demo/invoicing" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📄 Invoicing</a>
        <a href="/demo/customers" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>👥 Customers</a>
        <a href="/demo/refrigerant" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>🧊 Refrigerant</a>
        <a href="/demo/schedule" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📅 Schedule</a>
      </div>

      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Dashboard</h1>

      {/* Live Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: '#001528', border: '2px solid #10B981', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Active Technicians</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#10B981' }}>{activeTechs}/{TECHS.length}</p>
        </div>
        <div style={{ background: '#001528', border: '2px solid #00d4ff', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Today's Revenue</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#00d4ff' }}>${revenue.toLocaleString()}</p>
        </div>
        <div style={{ background: '#001528', border: '2px solid #F59E0B', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Active Jobs</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#F59E0B' }}>{activeJobs}</p>
        </div>
        <div style={{ background: '#001528', border: '2px solid #8B5CF6', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Live Updates</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#8B5CF6' }}>{updates}</p>
        </div>
      </div>

      {/* Active Jobs */}
      <div style={{ background: '#001528', border: '2px solid #334155', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Active Jobs</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {JOBS.filter(j => j.status === 'in-progress').map(job => (
            <div key={job.id} style={{
              background: '#0a192f',
              border: `2px solid ${job.priority === 'emergency' ? '#EF4444' : '#3B82F6'}`,
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{job.customer}</p>
                <p style={{ fontSize: 13, color: '#94a3b8' }}>{job.type} • {job.tech}</p>
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: job.priority === 'emergency' ? '#EF4444' : '#3B82F6',
                color: 'white',
                textTransform: 'uppercase'
              }}>
                {job.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status Banner */}
      <div style={{
        marginTop: 32,
        background: 'linear-gradient(135deg, #00d4ff 0%, #2563eb 100%)',
        borderRadius: 12,
        padding: 24,
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>All Systems Operational</p>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>GPS tracking, invoicing, and refrigerant compliance monitoring active</p>
      </div>
    </div>
  );
}
