'use client';
import { INVOICES } from '../../../lib/demoData';

export default function InvoicingPage() {
  const totalRevenue = INVOICES.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pending = INVOICES.filter(i => i.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const overdue = INVOICES.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

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
        <a href="/demo/invoicing" style={{ padding: '8px 16px', background: '#00d4ff', color: '#0a192f', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📄 Invoicing</a>
        <a href="/demo/customers" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>👥 Customers</a>
        <a href="/demo/refrigerant" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>🧊 Refrigerant</a>
        <a href="/demo/schedule" style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>📅 Schedule</a>
      </div>

      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Invoicing</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div style={{ background: '#001528', border: '2px solid #10B981', borderRadius: 12, padding: 24 }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Total Revenue</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#10B981' }}>${totalRevenue.toLocaleString()}</p>
          <p style={{ color: '#10B981', fontSize: 12, marginTop: 4 }}>+15% this month</p>
        </div>
        <div style={{ background: '#001528', border: '2px solid #3B82F6', borderRadius: 12, padding: 24 }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Pending</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#3B82F6' }}>${pending.toLocaleString()}</p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>1 invoice sent</p>
        </div>
        <div style={{ background: '#001528', border: '2px solid #EF4444', borderRadius: 12, padding: 24 }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Overdue</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#EF4444' }}>${overdue.toLocaleString()}</p>
          <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Requires action</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{ background: '#001528', border: '2px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0a192f', borderBottom: '2px solid #334155' }}>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Invoice #</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Date</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#00d4ff', fontWeight: 700 }}>Status</th>
              <th style={{ padding: 16, textAlign: 'right', color: '#00d4ff', fontWeight: 700 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: 16, fontWeight: 600 }}>{invoice.id}</td>
                <td style={{ padding: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{invoice.customer}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>{invoice.items}</p>
                  </div>
                </td>
                <td style={{ padding: 16, fontSize: 14, color: '#94a3b8' }}>{invoice.date}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: invoice.status === 'paid' ? '#10B981' : 
                               invoice.status === 'sent' ? '#3B82F6' : '#EF4444',
                    color: 'white',
                    textTransform: 'uppercase'
                  }}>
                    {invoice.status}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: 'right', fontWeight: 700, fontSize: 18 }}>
                  ${invoice.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
