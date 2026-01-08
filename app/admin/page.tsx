'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

interface Tenant {
  id: string;
  name: string;
  email: string;
  company_name: string;
  status: string;
  requested_at: string;
  agent_recommendation: any;
  agent_confidence: number;
  risk_score: number;
}

interface Truck {
  id: string;
  truckNumber: string;
  status: string;
  location: { latitude: number; longitude: number } | null;
  lastUpdate: string;
}

export default function AdminDashboard() {
  const [pendingTenants, setPendingTenants] = useState<Tenant[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    loadPendingTenants();
    loadTrucks();
    
    // Subscribe to truck updates (Supabase realtime)
    // TODO: Implement Supabase realtime subscription
    const interval = setInterval(loadTrucks, 10000); // Refresh every 10s
    
    return () => clearInterval(interval);
  }, []);

  async function loadPendingTenants() {
    try {
      const res = await fetch('/api/admin/tenants/list?status=requested');
      const data = await res.json();
      if (data.success) {
        setPendingTenants(data.tenants);
      }
    } catch (error) {
      console.error('Failed to load pending tenants:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrucks() {
    try {
      const res = await fetch('/api/gps/trucks');
      const data = await res.json();
      if (data.success) {
        setTrucks(data.trucks);
      }
    } catch (error) {
      console.error('Failed to load trucks:', error);
    }
  }

  async function approveTenant(tenantId: string, plan: 'monthly' | 'annual') {
    setApproving(tenantId);
    try {
      const res = await fetch('/api/admin/tenants/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, plan }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(\`Tenant approved successfully! \${data.subscriptionId ? 'Subscription created.' : 'No billing configured.'}\`);
        loadPendingTenants();
      } else {
        alert(\`Error: \${data.error}\`);
      }
    } catch (error) {
      alert('Failed to approve tenant');
      console.error(error);
    } finally {
      setApproving(null);
    }
  }

  const trucksWithLocation = trucks.filter(t => t.location);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Pending Onboarding Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pending Onboarding Requests</h2>
          
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : pendingTenants.length === 0 ? (
            <div className="text-gray-500">No pending requests</div>
          ) : (
            <div className="space-y-4">
              {pendingTenants.map((tenant) => (
                <div key={tenant.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{tenant.company_name}</h3>
                      <p className="text-gray-600">{tenant.name} - {tenant.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested: {new Date(tenant.requested_at).toLocaleString()}
                      </p>
                      
                      {tenant.agent_recommendation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="font-medium text-sm">AI Recommendation:</p>
                          <p className="text-sm">
                            {tenant.agent_recommendation.recommendation} 
                            {' '}(Confidence: {(tenant.agent_confidence * 100).toFixed(0)}%)
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {tenant.agent_recommendation.reason}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => approveTenant(tenant.id, 'monthly')}
                        disabled={approving === tenant.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {approving === tenant.id ? 'Approving...' : 'Approve (Monthly)'}
                      </button>
                      <button
                        onClick={() => approveTenant(tenant.id, 'annual')}
                        disabled={approving === tenant.id}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve (Annual)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Truck Map */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Live Truck Tracking</h2>
          <p className="text-gray-600 mb-4">
            {trucksWithLocation.length} trucks with GPS location
          </p>
          
          <div className="h-96 rounded-lg overflow-hidden">
            <MapComponent trucks={trucksWithLocation} />
          </div>
        </div>
      </div>
    </div>
  );
}
