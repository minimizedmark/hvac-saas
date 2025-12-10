'use client';

import { useRouter } from 'next/navigation';

export default function FoundingMemberTerms() {
  const router = useRouter();

  const handleAgree = () => {
    // Redirect to checkout
    window.location.href = '/api/checkout';
  };

  return (
    <div style={{ 
      background: '#0a192f', 
      color: '#e2e8f0', 
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        <h1 style={{ color: '#00d4ff', fontSize: 36, marginBottom: 30 }}>
          Founding Member Agreement
        </h1>

        <div style={{ 
          background: '#001528', 
          padding: '30px', 
          borderRadius: 16,
          border: '2px solid #00d4ff',
          marginBottom: 30 
        }}>
          
          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 0 }}>
            Eligibility & Account Limits
          </h2>
          <p style={{ lineHeight: 1.8 }}>
            Founding Member pricing of $1,495/year is available exclusively to HVAC contractor operations meeting the following criteria:
          </p>
          <ul style={{ lineHeight: 2 }}>
            <li>Maximum 5 trucks/service vehicles</li>
            <li>Maximum 10 active user accounts</li>
            <li>Single business location (multi-location requires Enterprise pricing)</li>
          </ul>
          <p style={{ lineHeight: 1.8 }}>
            Operations exceeding these limits must upgrade to Enterprise pricing. HVACflow reserves the right to audit account usage and require upgrades for non-compliant accounts.
          </p>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Fair Usage Policy
          </h2>
          <p style={{ lineHeight: 1.8 }}>
            Founding Member pricing is based on reasonable usage for small contractor operations (1-5 trucks). The following fair usage limits apply:
          </p>
          <ul style={{ lineHeight: 2 }}>
            <li><strong>AI Diagnostics:</strong> 500 requests per month per account (avg 25/day)</li>
            <li><strong>Data Storage:</strong> 50GB per account</li>
            <li><strong>API Calls:</strong> 10,000 requests per month</li>
            <li><strong>SMS Notifications:</strong> 2,000 messages per month</li>
          </ul>
          <p style={{ lineHeight: 1.8, marginTop: 20 }}>
            <strong>Excessive Usage:</strong> Accounts consistently exceeding fair usage limits may be subject to:
          </p>
          <ul style={{ lineHeight: 2 }}>
            <li>Temporary throttling of services</li>
            <li>Required upgrade to higher-tier plan</li>
            <li>Additional usage fees at published rates</li>
          </ul>
          <p style={{ lineHeight: 1.8, marginTop: 20 }}>
            <strong>Prohibited Activities:</strong> Reselling access, automated scraping, reverse engineering, or any activity that degrades service for other users is strictly prohibited and may result in immediate account termination without refund.
          </p>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Pricing & Payment Terms
          </h2>
          <ul style={{ lineHeight: 2 }}>
            <li><strong>Annual fee:</strong> $1,495/year, billed annually</li>
            <li><strong>Price lock:</strong> Locked for life with maximum 7% annual increase</li>
            <li><strong>First payment:</strong> Due upon signup to secure your spot</li>
            <li><strong>Renewal:</strong> Automatic annual renewal at locked rate</li>
            <li><strong>No refunds</strong> after Phase 1 launch (except as outlined below)</li>
          </ul>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Launch Timeline & Refund Guarantee
          </h2>
          <p style={{ lineHeight: 1.8 }}>
            <strong>Phase 1 Launch:</strong> 3 months after 50th founding member joins<br />
            <strong>Phase 2 Launch:</strong> 5 months total (2 months after Phase 1)
          </p>
          <p style={{ lineHeight: 1.8, marginTop: 20 }}>
            <strong>Money-Back Guarantee:</strong> Full refund if Phase 1 is not live and accessible within 6 months of the 50th founding member joining. After Phase 1 launches, all sales are final.
          </p>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Founding Member Benefits
          </h2>
          <ul style={{ lineHeight: 2 }}>
            <li>AI diagnostics included FREE for 10 years (normally $500/year add-on)</li>
            <li>Annual founder's summit at major HVAC trade shows</li>
            <li>National contractor network (50 members)</li>
            <li>Private Slack channel + monthly video calls with founder</li>
            <li>Direct SMS line to founder: (587) 402-8264</li>
            <li>Priority feature requests</li>
            <li>Beta access 2 weeks before Phase 1 launch</li>
            <li>Founding member badge (digital + physical)</li>
          </ul>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Phase 1 Features (Included)
          </h2>
          <ul style={{ lineHeight: 2 }}>
            <li>Real-time GPS tracking</li>
            <li>Magic-link login (no passwords)</li>
            <li>Smart AI scheduling & route optimization</li>
            <li>Automatic invoice generation</li>
            <li>Refrigerant tracking + EPA reports</li>
            <li>Customer management with full history</li>
          </ul>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Phase 2 Features (5 Months Total)
          </h2>
          <ul style={{ lineHeight: 2 }}>
            <li>AI diagnostics from equipment photos</li>
            <li>Mobile apps (iOS & Android native)</li>
            <li>Advanced reporting & analytics</li>
            <li>QuickBooks integration</li>
          </ul>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Software License & Usage
          </h2>
          <ul style={{ lineHeight: 2 }}>
            <li>Non-transferable license for your business only</li>
            <li>Cannot resell or sublicense access</li>
            <li>Standard software warranty (provided "as is")</li>
            <li>99% uptime SLA (after Phase 1 launch)</li>
            <li>24-hour support response time (business days)</li>
          </ul>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Compliance & Account Review
          </h2>
          <p style={{ lineHeight: 1.8 }}>
            HVACflow may periodically review account usage to ensure compliance with founding member limits. If your operation grows beyond 5 trucks or 10 users, you'll be required to upgrade to Enterprise pricing within 30 days of notification.
          </p>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Cancellation Policy
          </h2>
          <ul style={{ lineHeight: 2 }}>
            <li>Cancel anytime after Phase 1 launch</li>
            <li>No refunds for partial years</li>
            <li>Access continues until end of paid period</li>
            <li>Founding member pricing cannot be reclaimed if you cancel and later return</li>
          </ul>

          <h2 style={{ color: '#00d4ff', fontSize: 24, marginTop: 40 }}>
            Contact & Support
          </h2>
          <p style={{ lineHeight: 1.8 }}>
            <strong>Founder Direct Line:</strong> (587) 402-8264<br />
            <strong>Email:</strong> mark@hvacflow.app<br />
            <strong>Business Address:</strong> Alberta, Canada
          </p>

        </div>

        <div style={{ 
          background: '#001528',
          padding: '30px',
          borderRadius: 16,
          border: '3px solid #00d4ff',
          textAlign: 'center',
          marginBottom: 20
        }}>
          <p style={{ fontSize: 18, marginBottom: 30, lineHeight: 1.6 }}>
            <strong>By clicking "I Agree & Continue to Payment" below, you acknowledge that you have read, understood, and agree to all terms and conditions outlined above.</strong>
          </p>
          
          <button
            onClick={handleAgree}
            style={{
              background: '#00d4ff',
              color: '#0a192f',
              fontSize: 22,
              fontWeight: 900,
              padding: '18px 50px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              marginBottom: 15
            }}
          >
            I Agree & Continue to Payment
          </button>

          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 15 }}>
            You will be redirected to Stripe's secure checkout
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              fontSize: 16,
              padding: '10px 20px',
              border: '1px solid #334155',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            ← Back to Landing Page
          </button>
        </div>

      </div>
    </div>
  );
}
