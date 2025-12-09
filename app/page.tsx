'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';

const HVACMap = dynamic(() => import('../components/HVACMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a192f', color: '#00d4ff' }}>Loading map...</div>
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function Home() {
  const [spotsLeft, setSpotsLeft] = useState<number>(50);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    const { count } = await supabase
      .from('founding_members')
      .select('*', { count: 'exact', head: true });

    const left = 50 - (count || 0);
    setSpotsLeft(left);
    setLoading(false);
  };

  useEffect(() => {
    fetchCount();
    const channel = supabase
      .channel('founding-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'founding_members' }, fetchCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const res = await fetch('/api/checkout', { method: 'POST' });
    const { sessionId } = await res.json();
    stripe?.redirectToCheckout({ sessionId });
  };

  const soldOut = spotsLeft <= 0;

  return (
    <main style={{ background: '#0a192f', color: '#e2e8f0', fontFamily: "'Segoe UI',sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        {/* HEADER */}
        <header style={{ textAlign: 'center', padding: '40px 20px 20px' }}>
          <h1 style={{ fontSize: 48, margin: 0, color: '#00d4ff', fontWeight: 900 }}>HVAC Flow</h1>
          <p style={{ fontSize: 22, color: '#94a3b8', margin: '20px 0' }}>
            Only 50 contractors will EVER lock in $1,495/year for life
          </p>
          <p style={{ fontSize: 18, maxWidth: 700, margin: '20px auto' }}>
            Built by Mark – Former HVAC tech who got sick of hearing his boss complain about $600/month software that didn't work for small shops.
          </p>
        </header>

        {/* LIVE DEMO CTA */}
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <a 
            href="/demo/dashboard"
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
        <h2 style={{ color: '#00d4ff', textAlign: 'center', marginTop: 60 }}>🔴 Live GPS Preview</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 20 }}>
          Real-time truck tracking (updates every 3 seconds) • <a href="/demo/gps" style={{ color: '#00d4ff', textDecoration: 'underline' }}>See full GPS demo →</a>
        </p>
        <div style={{
          width: '100%', height: 500, border: '3px solid #00d4ff', borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,212,255,0.3)', margin: '40px 0'
        }}>
          <HVACMap height="100%" width="100%" />
        </div>

        {/* FEATURES */}
        <div style={{
          background: '#001528', padding: 40, borderRadius: 16,
          border: '2px solid #00d4ff', margin: '40px 0'
        }}>
          <h2 style={{ marginTop: 0, color: '#00d4ff' }}>✅ Live Today (Working Demo Above)</h2>
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
          <h2 style={{ marginTop: 40, color: '#00d4ff' }}>🚀 Launching April 2026</h2>
          <p style={{ color: '#94a3b8' }}>(4 months after we hit 50 founding members)</p>
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
          background: '#001528', padding: 40, borderRadius: 16,
          border: '2px solid #00d4ff', margin: '40px 0'
        }}>
          <h2 style={{ marginTop: 0, color: '#00d4ff' }}>🏆 Founding Member Benefits (First 50 Only)</h2>
          <div style={{ margin: '0 auto', maxWidth: 600 }}>
            <ul style={{ lineHeight: 2 }}>
              <li><strong>Locked pricing forever:</strong> $1,495/year (max 7% annual increase)</li>
              <li><strong>AI diagnostics included FREE</strong> (worth $500/year)</li>
              <li><strong>Annual founder's summit</strong> at major HVAC trade shows (rotating cities)</li>
              <li><strong>National contractor network</strong> (50 members helping each other)</li>
              <li><strong>Private Slack channel</strong> + monthly video calls</li>
              <li><strong>Direct SMS line to founder:</strong> (587) 402-8264</li>
              <li><strong>Priority feature requests</strong> (you shape what gets built)</li>
              <li><strong>Beta access</strong> 2 weeks before launch</li>
              <li><strong>Founding member badge</strong> (digital + physical)</li>
            </ul>
          </div>
        </div>

        {/* PRICING / CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #001528 0%, #002040 100%)',
          padding: 50, border: '3px solid #00d4ff', boxShadow: '0 0 40px rgba(0,212,255,0.2)',
          borderRadius: 16, textAlign: 'center', margin: '40px 0'
        }}>
          <h2 style={{ marginTop: 0, color: '#00d4ff' }}>Founding Member Price – Only 50 Spots Ever</h2>
          <p style={{ fontSize: 62, color: '#00d4ff', fontWeight: 900, margin: '10px 0' }}>
            $1,495/year <small style={{ fontSize: 24, color: '#94a3b8', display: 'block', marginTop: 10 }}>
              locked for life (max 7% annual increase)
            </small>
          </p>
          <p style={{ fontSize: 20, margin: '20px 0' }}>
            Regular price after these 50 → <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 28 }}>$2,090/year</span>
          </p>
          <p style={{ fontSize: 28, color: '#ff4757', fontWeight: 'bold', margin: '20px 0' }}>
            {loading ? 'Loading spots...' : soldOut
              ? <span style={{ color: '#ff4757' }}>ALL 50 SPOTS FILLED!</span>
              : <><strong>{spotsLeft} of 50 spots remaining</strong><br /><span style={{ fontSize: 20, color: '#94a3b8' }}>{50 - spotsLeft} already claimed</span></>
            }
          </p>
          <p style={{ color: '#94a3b8', fontSize: 18, margin: '30px 0' }}>
            Your savings: <strong style={{ color: '#00d4ff' }}>$595/year, every year, forever</strong>
          </p>
          {!soldOut && (
            <button
              onClick={handleCheckout}
              style={{
                display: 'inline-block', background: '#00d4ff', color: '#0a192f', fontWeight: 'bold',
                fontSize: 24, padding: '18px 50px', borderRadius: 12, border: 'none', cursor: 'pointer',
                margin: '20px 0', transition: 'all 0.3s'
              }}
            >
              Reserve My Spot – $1,495/year
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
          <p style={{ marginTop: 30, fontSize: 18, color: '#94a3b8' }}>
            Built for 1-5 truck HVAC operations across North America
          </p>
          <p style={{ marginTop: 30, fontSize: 16, color: '#64748b' }}>
            <strong>Guarantee:</strong> Full refund if not live in 6 months
          </p>
        </div>

        {/* COMPARISON */}
        <div style={{
          background: '#001528', padding: 40, borderRadius: 16,
          border: '2px solid #00d4ff', margin: '40px 0'
        }}>
          <h2 style={{ marginTop: 0, color: '#00d4ff' }}>💰 The Real Cost Comparison</h2>
          <table style={{ width: '100%', maxWidth: 600, margin: '20px auto', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '2px solid #00d4ff' }}>
                <th style={{ padding: 15, textAlign: 'left', color: '#00d4ff' }}>ServiceTitan</th>
                <th style={{ padding: 15, textAlign: 'left', color: '#00d4ff' }}>HVAC Flow (Founding)</th>
              </tr>
              <tr>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Built for 50+ truck operations</td>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}><strong style={{ color: '#00d4ff' }}>$1,495/year</strong></td>
              </tr>
              <tr>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Built for 50+ truck operations</td>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Built for 1-5 truck shops</td>
              </tr>
              <tr>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>80% features you'll never use</td>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Every feature you actually need</td>
              </tr>
              <tr>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}>Price increases 15-30% yearly</td>
                <td style={{ padding: 15, borderBottom: '1px solid #334155' }}><strong style={{ color: '#00d4ff' }}>Locked forever (max 7%)</strong></td>
              </tr>
              <tr>
                <td style={{ padding: 15 }}>Designed for US market</td>
                <td style={{ padding: 15 }}><strong style={{ color: '#00d4ff' }}>Built for small shops (1-5 trucks)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* WHY I'M DOING THIS */}
        <div style={{
          background: '#001528', padding: 40, borderRadius: 16,
          border: '2px solid #00d4ff', margin: '40px 0'
        }}>
          <h2 style={{ marginTop: 0, color: '#00d4ff' }}>Why I Built This</h2>
          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
            I worked HVAC for years. Heard my boss complain constantly:
          </p>
          <ul style={{ maxWidth: 600, margin: '20px auto', textAlign: 'left', fontSize: 18, lineHeight: 2 }}>
            <li>"Why am I paying $600/month for a glorified calendar?"</li>
            <li>"This software was built for massive operations, not shops like yours"</li>
            <li>"I need 10% of these features but pay for 100%"</li>
          </ul>
          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
            After hearing it enough times, I figured: <strong>fuck it, I'll build something better.</strong>
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
          background: '#001528', padding: 40, borderRadius: 16,
          border: '2px solid #00d4ff', margin: '40px 0', textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, color: '#00d4ff' }}>I'm Not Here for Free Advice</h2>
          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
            I'm not some guy looking for free advice or feedback just so I can gouge the shit out of you later.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
            That's the Silicon Valley playbook: <em>"Help us build it! By the way, it's $400/month now."</em>
          </p>
          <p style={{ fontSize: 20, fontWeight: 'bold', color: '#00d4ff', margin: '30px auto' }}>Screw that.</p>
          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '20px auto' }}>
            Here's my deal: <strong>$1,495/year locked</strong> if you're in the first 50. <strong>$2,090/year</strong> for everyone else.
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
        <footer style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
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
  );
}
