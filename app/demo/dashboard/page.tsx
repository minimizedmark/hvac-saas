export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Contractor Dashboard</h1>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 40
      }}>
        <div style={{
          background: '#001528', border: '2px solid #00d4ff', borderRadius: 16, padding: 32, textAlign: 'center'
        }}>
          <h2 style={{ color: '#00d4ff', fontSize: 28, fontWeight: 800 }}>Founding Member</h2>
          <p style={{ fontSize: 40, fontWeight: 900, margin: '16px 0' }}>#12</p>
          <p style={{ color: '#94a3b8' }}>Lifetime Pro Access</p>
        </div>
        <div style={{
          background: '#001528', border: '2px solid #00d4ff', borderRadius: 16, padding: 32, textAlign: 'center'
        }}>
          <h2 style={{ color: '#e2e8f0', fontSize: 28, fontWeight: 800 }}>Today's Leads</h2>
          <p style={{ fontSize: 40, fontWeight: 900, margin: '16px 0' }}>7</p>
        </div>
        <div style={{
          background: '#001528', border: '2px solid #00d4ff', borderRadius: 16, padding: 32, textAlign: 'center'
        }}>
          <h2 style={{ color: '#e2e8f0', fontSize: 28, fontWeight: 800 }}>Revenue This Month</h2>
          <p style={{ fontSize: 40, fontWeight: 900, margin: '16px 0' }}>$18,400</p>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #00d4ff 0%, #2563eb 100%)',
          color: '#fff', borderRadius: 20, padding: 36, textAlign: 'center', fontWeight: 700, fontSize: 24, boxShadow: '0 2px 16px rgba(0,212,255,0.15)'
        }}>
          AI Diagnosis Tool<br /><span style={{ fontSize: 18, fontWeight: 400 }}>Voice + Photo → Instant Answer</span>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #00d4ff 0%, #00b894 100%)',
          color: '#fff', borderRadius: 20, padding: 36, textAlign: 'center', fontWeight: 700, fontSize: 24, boxShadow: '0 2px 16px rgba(0,212,255,0.15)'
        }}>
          Good/Better/Best Proposals<br /><span style={{ fontSize: 18, fontWeight: 400 }}>Coming in 48 hours</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 22, marginTop: 40 }}>
        More tools dropping daily. You’re in early.
      </div>
    </div>
  );
}
