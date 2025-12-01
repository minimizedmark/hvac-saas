export default function InvoicingPage() {
  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Invoicing Demo</h1>
      <p style={{ color: '#94a3b8', fontSize: 20, marginBottom: 24 }}>
        Automatic invoice generation from tech notes. Built for 1-5 truck Alberta shops.
      </p>
      <div style={{
        background: '#001528', border: '2px solid #00d4ff', borderRadius: 16, padding: 32, maxWidth: 480, margin: '0 auto', boxShadow: '0 2px 16px rgba(0,212,255,0.10)'
      }}>
        <h2 style={{ color: '#00d4ff', fontSize: 28, fontWeight: 800 }}>Sample Invoice</h2>
        <p><b>Customer:</b> Jane Smith</p>
        <p><b>Service:</b> AC Repair</p>
        <p><b>Total:</b> $320.00</p>
        <p><b>Status:</b> <span style={{ color: 'lime' }}>Paid</span></p>
      </div>
    </div>
  );
}
