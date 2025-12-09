'use client';
import { CUSTOMERS } from '../../../lib/demoData';

export default function CustomersPage() {
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
        <a href="/demo/dashboard" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📊 Dashboard</a>
        <a href="/demo/gps" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📍 GPS Tracking</a>
        <a href="/demo/invoicing" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📄 Invoicing</a>
        <a href="/demo/customers" style={{ padding: '8px 16px', background: '#00d4ff', color: '#0a192f', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>👥 Customers</a>
        <a href="/demo/refrigerant" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>🧊 Refrigerant</a>
        <a href="/demo/schedule" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📅 Schedule</a>
      </div>

      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Customers</h1>
      
      <div style={{ background: '#001528', border: '2px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0a192f', borderBottom: '2px solid #334155' }}>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Contact</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>System</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Last Service</th>
              <th style={{ padding: 16, textAlign: 'right', color: '#00d4ff', fontWeight: 700 }}>Lifetime Value</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map(customer => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{customer.name}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>{customer.address}</p>
                  </div>
                </td>
                <td style={{ padding: 16 }}>
                  <div>
                    <p style={{ fontSize: 13, marginBottom: 4 }}>{customer.phone}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>{customer.email}</p>
                  </div>
                </td>
                <td style={{ padding: 16 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{customer.system}</p>
                    {customer.notes && (
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{customer.notes}</p>
                    )}
                  </div>
                </td>
                <td style={{ padding: 16, fontSize: 14 }}>
                  {customer.lastService || 'N/A'}
                </td>
                <td style={{ padding: 16, textAlign: 'right', fontWeight: 700, fontSize: 18, color: '#10B981' }}>
                  ${customer.lifetime.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
