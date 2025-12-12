'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main style={{ background: '#0a192f', color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Segoe UI',sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: inline-block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-button {
            display: none !important;
          }
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
      
      <nav style={{
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        padding: '24px 20px',
        justifyContent: 'space-between',
        background: '#001528',
        borderBottom: '2px solid #00d4ff',
        marginBottom: 40,
        position: 'relative',
        flexWrap: 'wrap'
      }}>
        {/* Logo/Brand */}
        <Link href="/" style={{ 
          color: '#00d4ff', 
          fontWeight: 900, 
          fontSize: 28, 
          letterSpacing: 1,
          textDecoration: 'none'
        }}>
          Flow Platform
        </Link>

        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'transparent',
            border: '2px solid #00d4ff',
            borderRadius: 6,
            padding: '8px 12px',
            cursor: 'pointer',
            color: '#00d4ff',
            fontSize: 24,
            lineHeight: 1
          }}
          className="mobile-menu-button"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Nav Links */}
        <div style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
        }} className="desktop-nav">
          <Link href="/demo/dashboard" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00d4ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}>📊 Dashboard</Link>
          <Link href="/demo/gps" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00d4ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}>📍 GPS Tracking</Link>
          <Link href="/demo/invoicing" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00d4ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}>📄 Invoicing</Link>
          <Link href="/demo/customers" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00d4ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}>👥 Customers</Link>
          <Link href="/demo/refrigerant" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00d4ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}>🧊 Refrigerant</Link>
          <Link href="/demo/schedule" style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00d4ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}>📅 Schedule</Link>
        </div>

        {/* Mobile Nav Links - Slides down when hamburger clicked */}
        {menuOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
            padding: '20px 0',
            borderTop: '1px solid #334155',
            marginTop: 16
          }} className="mobile-nav">
            <Link 
              href="/demo/dashboard" 
              style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              📊 Dashboard
            </Link>
            <Link 
              href="/demo/gps" 
              style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              📍 GPS Tracking
            </Link>
            <Link 
              href="/demo/invoicing" 
              style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              📄 Invoicing
            </Link>
            <Link 
              href="/demo/customers" 
              style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              👥 Customers
            </Link>
            <Link 
              href="/demo/refrigerant" 
              style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              🧊 Refrigerant
            </Link>
            <Link 
              href="/demo/schedule" 
              style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              📅 Schedule
            </Link>
          </div>
        )}
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
          <strong>Email:</strong> <a href="mailto:mark@hvacflow.app" style={{ color: '#00d4ff' }}>mark@hvacflow.app</a>
        </p>
        <p style={{ marginTop: 30, fontSize: 14 }}>
          Flow Platform &copy; 2025 | Alberta, Canada
        </p>
      </footer>
    </main>
  );
}
