'use client';

import { useState, useEffect } from 'react';

export default function FounderContact() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <style jsx>{`
        .founder-contact {
          background: linear-gradient(135deg, #001f3f 0%, #003366 100%);
          border-radius: 16px;
          padding: ${isMobile ? '25px 20px' : '35px 30px'};
          margin: 30px 10px;
          border: 2px solid #00d4ff;
          text-align: center;
        }
        .founder-title {
          font-size: ${isMobile ? '24px' : '30px'};
          font-weight: 900;
          color: #00d4ff;
          margin: 0 0 20px 0;
        }
        .founder-description {
          color: #e2e8f0;
          font-size: ${isMobile ? '16px' : '18px'};
          margin: 0 auto 30px;
          max-width: 650px;
          line-height: 1.7;
        }
        .founder-button {
          display: inline-flex;
          align-items: center;
          gap: ${isMobile ? '10px' : '12px'};
          background: #00d4ff;
          color: #0a192f;
          font-size: ${isMobile ? '20px' : '24px'};
          font-weight: 900;
          padding: ${isMobile ? '16px 30px' : '20px 45px'};
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 8px 25px rgba(0,212,255,0.4);
          border: 2px solid #00d4ff;
          transition: transform 0.2s;
        }
        .founder-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0,212,255,0.5);
        }
        .founder-button:active {
          transform: scale(0.98);
        }
        .response-time {
          color: #94a3b8;
          font-size: ${isMobile ? '13px' : '15px'};
          margin-top: 20px;
          font-weight: 500;
        }
        .founder-quote {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid #334155;
        }
        .quote-text {
          color: #cbd5e1;
          font-size: ${isMobile ? '15px' : '17px'};
          font-style: italic;
          margin-bottom: 12px;
          line-height: 1.6;
        }
        .quote-author {
          color: #00d4ff;
          font-size: ${isMobile ? '15px' : '17px'};
          font-weight: 700;
        }
      `}</style>
      
      <div className="founder-contact">
        <h3 className="founder-title">
          Questions About Founding Membership?
        </h3>
        <p className="founder-description">
          Text me directly. I'm personally answering every question and reviewing every founding member application.
        </p>
        
        <a 
          href="sms:+15874028264?body=I have questions about HVACflow founding membership"
          className="founder-button"
        >
          <span style={{ fontSize: isMobile ? '22px' : '26px' }}>📱</span>
          <span>587-402-8264</span>
        </a>
        
        <p className="response-time">
          Response within 15 minutes during business hours (MT)
        </p>
        
        <div className="founder-quote">
          <p className="quote-text">
            "Built by a former HVAC tech who understands your daily frustrations."
          </p>
          <p className="quote-author">
            - Mark, Founder
          </p>
        </div>
      </div>
    </>
  );
}
