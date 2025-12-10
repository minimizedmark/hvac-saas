'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';
import FounderContact from '../components/FounderContact';

const HVACMap = dynamic(() => import('../components/HVACMap'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '500px', 
      background: '#0a192f',
      color: '#00d4ff',
      fontSize: 18,
      fontWeight: 700
    }}>
      📍 Loading map...
    </div>
  )
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function Home() {
  const [spotsLeft, setSpotsLeft] = useState<number>(50);
  const [loading, setLoading] = useState(true);
  const [demoTechs, setDemoTechs] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCount = async () => {
    const { count } = await supabase
      .from('founding_members')
      .select('*', { count: 'exact', head: true });

    const left = 50 - (count || 0);
    setSpotsLeft(left);
    setLoading(false);
  };

  // Fetch demo techs for map preview
  const fetchDemoTechs = async () => {
    try {
      const response = await fetch('/api/generate-demo-state');
      if (response.ok) {
        const data = await response.json();
        if (data.techs && Array.isArray(data.techs)) {
          setDemoTechs(data.techs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch demo techs:', error);
    }
  };

  useEffect(() => {
    fetchCount();
    fetchDemoTechs();
    const channel = supabase
      .channel('founding-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'founding_members' }, fetchCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const soldOut = spotsLeft <= 0;

  return (
    <>
      <style jsx>{`
        @media (max-width: 600px) {
          .hero-title {
            font-size: 36px !important;
          }
          .hero-subtitle {
            font-size: 18px !important;
          }
          .hero-description {
            font-size: 16px !important;
          }
          .demo-cta {
            font-size: 20px !important;
            padding: 16px 40px !important;
          }
          .section-title {
            font-size: 24px !important;
          }
          .pricing-amount {
            font-size: 42px !important;
          }
          .pricing-small {
            font-size: 16px !important;
          }
          .pricing-regular {
            font-size: 20px !important;
          }
          .spots-remaining {
            font-size: 22px !important;
          }
          .launch-urgency {
            font-size: 14px !important;
          }
          .savings-text {
            font-size: 16px !important;
          }
          .cta-button {
            font-size: 20px !important;
            padding: 16px 30px !important;
          }
          .comparison-table {
            font-size: 14px !important;
          }
          .comparison-table td, .comparison-table th {
            padding: 10px !important;
          }
          .map-container {
            height: 350px !important;
          }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .hero-title {
            font-size: 42px !important;
          }
          .pricing-amount {
            font-size: 52px !important;
          }
          .map-container {
            height: 400px !important;
          }
        }
      `}</style>
      
      <main style={{ background: '#0a192f', color: '#e2e8f0', fontFamily: "'Segoe UI',sans-serif", minHeight: '100vh' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '10px' }}>
          {/* HEADER */}
          <header style={{ textAlign: 'center', padding: '40px 20px 20px' }}>
            <h1 className="hero-title" style={{ fontSize: 48, margin: 0, color: '#00d4ff', fontWeight: 900 }}>HVAC Flow</h1>
            <p className="hero-subtitle" style={{ fontSize: 22, color: '#94a3b8', margin: '20px 0' }}>
              Only 50 contractors will EVER lock in $1,495/year for life
            </p>
            <p className="hero-description" style={{ fontSize: 18, maxWidth: 700, margin: '20px auto', padding: '0 10px' }}>
              Built by Mark – Former HVAC tech who got sick of hearing his boss complain about $600/month software that didn't work for small shops.
            </p>
          </header>

          {/* LIVE DEMO CTA */}
          <div style={{ textAlign: 'center', margin: '40px 0', padding: '0 10px' }}>
            <a 
              href="/demo/dashboard"
              className="demo-cta"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #00d4ff 0%, #2563eb 100%)',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                padding: '20px 60px',
                borderRadius: 12,
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(0,212,255,0.4)',
                border: '2px solid #00d4ff',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🚀 Try Live Demo Now
            </a>
            <p style={{ color: '#94a3b8', marginTop: 15, fontSize: 16 }}>
              Interactive dashboard • GPS tracking • Invoicing • Refrigerant logs
            </p>
          </div>

          {/* LIVE DEMO MAP */}
          <h2 className="section-title" style={{ color: '#00d4ff', textAlign: 'center', marginTop: 60, fontSize: 32 }}>🔴 Live GPS Preview</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 20, padding: '0 10px' }}>
            Real-time truck tracking (updates every 3 seconds)
          </p>
          <div className="map-container" style={{
            width: '100%', height: 500, border: '3px solid #00d4ff', borderRadius: 12,
            overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,212,255,0.3)', margin: '40px 0'
          }}>
            {mounted && <HVACMap height="100%" width="100%" techs={demoTechs} />}
          </div>

          {/* FEATURES */}
          <div style={{
            background: '#001528', padding: '30px 20px', borderRadius: 16,
            border: '2px solid #00d4ff', margin: '40px 10px'
          }}>
            <h2 className="section-title" style={{ marginTop: 0, color: '#00d4ff', fontSize: 28 }}>✅ Live Today (Working Demo Above)</h2>
            <p style={{ color: '#94a3b8', marginBottom: 20 }}>Production-ready in Phase 1 (3 months after we hit 50 members)</p>
            <div style={{ margin: '0 auto', maxWidth: 600 }}>
              <ul style={{ lineHeight: 2 }}>
                <li><strong>Real-time GPS tracking</strong> on actual Edmonton streets</li>
                <li><strong>Magic-link login</strong> – no passwords, works with greasy gloves</li>
                <li><strong>Smart AI scheduling</strong> & route optimization</li>
                <li><strong>Automatic invoice generation</strong> from tech notes</li>
                <li><strong>Refrigerant tracking</strong> + one-click EPA reports</li>
                <li><strong>Customer management</strong> with full history</li>
              </ul>
            </div>
            <h2 className="section-title" style={{ marginTop: 40, color: '#00d4ff', fontSize: 28 }}>🚀 Phase 2 Features</h2>
            <p style={{ color: '#94a3b8' }}>(2 months after Phase 1 launch = 5 months total)</p>
            <div style={{ margin: '0 auto', maxWidth: 600 }}>
              <ul style={{ lineHeight: 2 }}>
                <li><strong>AI diagnostics</strong> from equipment photos (saves 20-30 min/call)</li>
                <li><strong>Mobile apps</strong> (iOS & Android native)</li>
                <li><strong>Advanced reporting</strong> & analytics</li>
                <li><strong>QuickBooks integration</strong></li>
              </ul>
            </div>
          </div>

          {/* FOUNDER'S CIRCLE */}
          <div style={{
            background: '#001528', padding: '30px 20px', borderRadius: 16,
            border: '2px solid #00d4ff', margin: '40px 10px'
          }}>
            <h2 className="section-title" style={{ marginTop: 0, color: '#00d4ff', fontSize: 28 }}>🏆 Founding Member Benefits (First 50 Only)</h2>
            <div style={{ margin: '0 auto', maxWidth: 600 }}>
              <ul style={{ lineHeight: 2 }}>
                <li><strong>Locked pricing forever:</strong> $1,495/year (max 7% annual increase)</li>
                <li><strong>AI diagnostics included FREE for 10 years</strong> ($5,000 total value - normally $500/year paid add-on)</li>
                <li><strong>Annual founder's summit</strong> at major HVAC trade shows (rotating trade shows)</li>
                <li><strong>National contractor network</strong> (50 members helping each other)</li>
                <li><strong>Private Slack channel</strong> + monthly video calls</li>
                <li><strong>Direct SMS line to founder:</strong> (587) 402-8264</li>
                <li><strong>Priority feature requests</strong> (you shape what gets built)</li>
                <li><strong>Beta access</strong> 2 weeks before Phase 1 launch</li>
                <li><strong>Founding member badge</strong> (digital + physical)</li>
              </ul>
            </div>
          </div>

          {/* PRICING / CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #001528 0%, #002040 100%)',
            padding: '40px 20px', border: '3px solid #00d4ff', boxShadow: '0 0 40px rgba(0,212,255,0.2)',
            borderRadius: 16, textAlign: 'center', margin: '40px 10px'
          }}>
            <h2 className="section-title" style={{ marginTop: 0, color: '#00d4ff', fontSize: 28 }}>Founding Member Price – Only 50 Spots Ever</h2>
            <p className="pricing-amount" style={{ fontSize: 62, color: '#00d4ff', fontWeight: 900, margin: '10px 0' }}>
              $1,495/year <small className="pricing-small" style={{ fontSize: 24, color: '#94a3b8', display: 'block', marginTop: 10 }}>
                locked for life (max 7% annual increase)
              </small>
            </p>
            <p className="pricing-regular" style={{ fontSize: 20, margin: '20px 0' }}>
              Regular price after these 50 → <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 28 }}>$2,990/year</span>
            </p>
            <p className="spots-remaining" style={{ fontSize: 28, color: '#ff4757', fontWeight: 'bold', margin: '20px 0' }}>
              {loading ? 'Loading spots...' : soldOut
                ? <span style={{ color: '#ff4757' }}>ALL 50 SPOTS FILLED!</span>
                : <><strong>{spotsLeft} of 50 spots remaining</strong><br /><span style={{ fontSize: 20, color: '#94a3b8' }}>{50 - spotsLeft} already claimed</span></>
              }
            </p>
            {!soldOut && (
              <p className="launch-urgency" style={{ fontSize: 18, color: '#00d4ff', fontWeight: 'bold', margin: '10px 0' }}>
                ⚡ Fill by Jan 31 = April launch | Fill by March = June launch
              </p>
            )}
            <p className="savings-text" style={{ color: '#94a3b8', fontSize: 18, margin: '30px 10px' }}>
              Your savings: <strong style={{ color: '#00d4ff' }}>$1,495/year on membership + $500/year on AI diagnostics = $1,995/year total savings, every year, forever</strong>
            </p>

            <FounderContact />

            {!soldOut && (
              <button
                onClick={() => window.location.href = '/founding-member-terms'}
                className="cta-button"
                style={{
                  display: 'inline-block', background: '#00d4ff', color: '#0a192f', fontWeight: 'bold',
                  fontSize: 24, padding: '18px 50px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  margin: '20px 0', transition: 'all 0.3s'
                }}
              >
                Claim Your Spot – $1,495/year
              </button>
            )}
            {soldOut && (
              <button
                disabled
                style={{
                  display: 'inline-block', background: '#64748b', color: '#0a192f', fontWeight: 'bold',
                  fontSize: 24, padding: '18px 50px', borderRadius: 12, border: 'none', cursor: 'not-allowed',
                  margin: '20px 0'
                }}
              >
                ALL SPOTS FILLED
              </button>
            )}
            <p style={{ marginTop: 30, fontSize: 18, color: '#94a3b8', padding: '0 10px' }}>
              Built for HVAC contractors across North America
            </p>
            <p style={{ marginTop: 30, fontSize: 16, color: '#64748b', padding: '0 10px' }}>
              <strong>Guarantee:</strong> Full refund if Phase 1 not live within 6 months of hitting 50 members
            </p>
          </div>

          {/* COMPARISON */}
          <div style={{
            background: '#001528', padding: '30px 20px', borderRadius: 16,
            border: '2px solid #00d4ff', margin: '40px 10px'
          }}>
            <h2 className="section-title" style={{ marginTop: 0, color: '#00d4ff', fontSize: 28 }}>💰 The Real Cost Comparison</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="comparison-table" style={{ width: '100%', maxWidth: 600, margin: '20px auto', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '2px solid #00d4ff' }}>
                    <th style={{ padding: 15, textAlign: 'left', color: '#00d4ff' }}>ServiceTitan</th>
                    <th style={{ padding: 15, textAlign: 'left', color: '#00d4ff' }}>HVAC Flow (Founding)</th>
                  </tr>
                  <tr>
                    <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>$7,200+/year</td>
                    <td style={{ padding: 15, borderBottom: '1px solid #334155' }}><strong style={{ color: '#00d4ff' }}>$1,495/year</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Built for 50+ truck operations</td>
                    <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Built for shops of all sizes</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>80% features you'll never use</td>
                    <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Every feature you actually need</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 15 }}>Price increases 15-30% yearly</td>
                    <td style={{ padding: 15 }}><strong style={{ color: '#00d4ff' }}>Locked forever (max 7%)</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* WHY I'M DOING THIS */}
          <div style={{
            background: '#001528', padding: '30px 20px', borderRadius: 16,
            border: '2px solid #00d4ff', margin: '40px 10px'
          }}>
            <h2 className="section-title" style={{ marginTop: 0, color: '#00d4ff', fontSize: 28 }}>Why I Built This</h2>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              I worked HVAC for years. Heard my boss complain constantly:
            </p>
            <ul style={{ maxWidth: 600, margin: '20px auto', textAlign: 'left', fontSize: 18, lineHeight: 2 }}>
              <li>"Why am I paying $600/month for a glorified calendar?"</li>
              <li>"This software was built for massive operations, not shops like yours"</li>
              <li>"I need 10% of these features but pay for 100%"</li>
            </ul>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              After hearing it enough times, I figured: <strong>screw it, I'll build something better.</strong>
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              This isn't some Silicon Valley startup looking to gouge you later. This is software built by someone who understands what it's like to stand in a customer's basement with greasy gloves trying to log into complicated software.
            </p>
            <p style={{ fontSize: 20, color: '#00d4ff', marginTop: 30 }}>
              <strong>- Mark, Former HVAC Tech</strong>
            </p>
          </div>

          {/* NO ADVICE SCAM */}
          <div style={{
            background: '#001528', padding: '30px 20px', borderRadius: 16,
            border: '2px solid #00d4ff', margin: '40px 10px', textAlign: 'center'
          }}>
            <h2 className="section-title" style={{ marginTop: 0, color: '#00d4ff', fontSize: 28 }}>I'm Not Here for Free Advice</h2>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              I'm not some guy looking for free advice or feedback just so I can gouge the shit out of you later.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              That's the Silicon Valley playbook: <em>"Help us build it! By the way, it's $400/month now."</em>
            </p>
            <p style={{ fontSize: 20, fontWeight: 'bold', color: '#00d4ff', margin: '30px auto' }}>Screw that.</p>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              Here's my deal: <strong>$1,495/year locked</strong> if you're in the first 50. <strong>$2,990/year</strong> for everyone else.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              Demo works today. Test it yourself above. If it solves your problems and you want locked pricing, grab your spot.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
              But don't wait thinking you'll "check it out later."
            </p>
            <p style={{ fontSize: 22, fontWeight: 'bold', color: '#ff4757', margin: '30px auto' }}>
              After 50 spots are gone, the $1,495/year price is gone forever.
            </p>
          </div>

          {/* FOOTER */}
          <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <p style={{ fontSize: 18, marginBottom: 10 }}>Questions?</p>
            <p style={{ fontSize: 20 }}>
              <strong>Text:</strong> <a href="sms:+15874028264" style={{ color: '#00d4ff' }}>(587) 402-8264</a>
            </p>
            <p style={{ fontSize: 20 }}>
              <strong>Email:</strong> <a href="mailto:mark@hvacflow.app" style={{ color: '#00d4ff' }}>mark@hvacflow.app</a>
            </p>
            <p style={{ marginTop: 30, fontSize: 14 }}>
              HVAC Flow &copy; 2025 | Alberta, Canada
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
