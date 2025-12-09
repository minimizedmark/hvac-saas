'use client';
import { REFRIGERANTS } from '../../../lib/demoData';

export default function RefrigerantPage() {
  const totalStock = REFRIGERANTS.reduce((sum, r) => sum + r.stock, 0);
  const compliantCount = REFRIGERANTS.filter(r => r.status !== 'critical').length;
  const compliancePercent = Math.round((compliantCount / REFRIGERANTS.length) * 100);

  return (
    <div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: '#00d4ff', marginBottom: 24 }}>Refrigerant Tracking</h1>

      {/* EPA Compliance Banner */}
      <div style={{ background: '#10B981', borderRadius: 12, padding: 20, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 36 }}>✓</div>
        <div>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4 }}>EPA Compliance: {compliancePercent}%</p>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>All refrigerant usage logged and tracked</p>
        </div>
      </div>

      {/* Refrigerant Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {REFRIGERANTS.map(refrigerant => {
          const stockPercent = (refrigerant.stock / 50) * 100;
          const statusColor = refrigerant.status === 'good' ? '#10B981' : 
                            refrigerant.status === 'low' ? '#F59E0B' : '#EF4444';
          
          return (
            <div key={refrigerant.type} style={{
              background: '#001528',
              border: `2px solid ${statusColor}`,
              borderRadius: 12,
              padding: 24,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: statusColor, marginBottom: 4 }}>{refrigerant.type}</h3>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  background: statusColor,
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {refrigerant.status}
                </span>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Stock Level</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{refrigerant.stock} lbs</span>
                </div>
                <div style={{ background: '#0a192f', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(stockPercent, 100)}%`,
                    height: '100%',
                    background: statusColor,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Cost/lb</p>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>${refrigerant.costPerUnit}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Monthly Usage</p>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>{refrigerant.monthlyUsage} lbs</p>
                </div>
              </div>

              {refrigerant.status === 'low' || refrigerant.status === 'critical' ? (
                <button style={{
                  width: '100%',
                  background: statusColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>
                  Order Now
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
