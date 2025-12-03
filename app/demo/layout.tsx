Import Link from 'next/link';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ background: '#0a192f', color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Segoe UI',sans-serif" }}>
      <nav style={{
        display: 'flex', gap: 32, alignItems: 'center', padding: '24px 0 24px 0', justifyContent: 'center',
        background: '#001528', borderBottom: '2px solid #00d4ff', marginBottom: 40
      }}>
        <Link href="/" style={{ color: '#00d4ff', fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Flow Platform</Link>
        <Link href="/demo/dashboard" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20 }}>Dashboard</Link>
        <Link href="/demo/gps" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20 }}>GPS Tracking</Link>
        <Link href="/demo/invoicing" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20 }}>Invoicing</Link>
        <Link href="/demo/refrigerant" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20 }}>Refrigerant</Link>
      </nav>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        {children}
      </div>
      <footer style={{ textAlign: 'center', padding: 40, color: '#64748b', marginTop: 40 }}>
        <p style={{ fontSize: 18, marginBottom: 10 }}>Questions?</p>
        <p style={{ fontSize: 20 }}>
          <strong>Text:</strong> <a href="sms:+15874028264" style={{ color: '#00d4ff' }}>(587) 402-8264</a>
        </p>
        <p style={{ fontSize: 20 }}>
          <strong>Email:</strong> <a href="mailto:mark@smartbizai.store" style={{ color: '#00d4ff' }}>mark@smartbizai.store</a>
        </p>
        <p style={{ marginTop: 30, fontSize: 14 }}>
          Flow Platform &copy; 2025 | Alberta, Canada
        </p>
      </footer>
    </main>
  );
}
