'use client';
import { JOBS } from '../../../lib/demoData';

export default function SchedulePage() {
  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Schedule</h1>
      
      <div style={{ background: '#001528', border: '2px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0a192f', borderBottom: '2px solid #334155' }}>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Time</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Service</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Technician</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Status</th>
              <th style={{ padding: 16, textAlign: 'right', color: '#00d4ff', fontWeight: 700 }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {JOBS.map(job => (
              <tr key={job.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: 16, fontWeight: 600 }}>{job.scheduled}</td>
                <td style={{ padding: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{job.customer}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>{job.address}</p>
                  </div>
                </td>
                <td style={{ padding: 16 }}>
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: 4 }}>{job.type}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>{job.issue}</p>
                  </div>
                </td>
                <td style={{ padding: 16, fontSize: 14 }}>{job.tech}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: job.status === 'in-progress' ? '#3B82F6' : 
                               job.status === 'scheduled' ? '#10B981' : '#6B7280',
                    color: 'white',
                    textTransform: 'uppercase'
                  }}>
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: 'right', fontWeight: 700, fontSize: 18 }}>
                  ${job.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
