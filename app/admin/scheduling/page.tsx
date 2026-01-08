'use client';

export default function SchedulingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Scheduling Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Job Scheduling</h2>
          <p className="text-gray-600 mb-4">
            Advanced scheduling features coming soon...
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Today's Jobs</h3>
              <p className="text-gray-500">No jobs scheduled</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Available Techs</h3>
              <p className="text-gray-500">No technicians online</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pending Assignments</h3>
              <p className="text-gray-500">No pending assignments</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Route Optimization</h3>
              <p className="text-gray-500">AI optimizer ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
