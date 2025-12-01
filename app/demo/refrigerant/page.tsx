export default function RefrigerantPage() {
  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Refrigerant Tracking Demo</h1>
      <p style={{ color: '#94a3b8', fontSize: 20, marginBottom: 24 }}>
        Track refrigerant usage and compliance. One-click EPA reports.
      </p>
      <div style={{
        background: '#001528', border: '2px solid #00d4ff', borderRadius: 16, padding: 32, maxWidth: 600, margin: '0 auto', boxShadow: '0 2px 16px rgba(0,212,255,0.10)'
      }}>
        <h2 style={{ color: '#00d4ff', fontSize: 28, fontWeight: 800 }}>Sample Refrigerant Log</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
          <thead>
            <tr style={{ background: '#002040' }}>
              <th style={{ padding: 8, border: '1px solid #00d4ff' }}>Date</th>
              <th style={{ padding: 8, border: '1px solid #00d4ff' }}>Technician</th>
              <th style={{ padding: 8, border: '1px solid #00d4ff' }}>Type</th>
              <th style={{ padding: 8, border: '1px solid #00d4ff' }}>Amount (lbs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8, border: '1px solid #334155' }}>2025-11-30</td>
              <td style={{ padding: 8, border: '1px solid #334155' }}>Alex Lee</td>
              <td style={{ padding: 8, border: '1px solid #334155' }}>R410A</td>
              <td style={{ padding: 8, border: '1px solid #334155' }}>2.5</td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #334155' }}>2025-11-29</td>
              <td style={{ padding: 8, border: '1px solid #334155' }}>Morgan Yu</td>
              <td style={{ padding: 8, border: '1px solid #334155' }}>R22</td>
              <td style={{ padding: 8, border: '1px solid #334155' }}>1.0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
