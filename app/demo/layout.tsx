export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ background: '#0a192f', color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Segoe UI',sans-serif" }}>
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
