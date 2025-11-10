export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HVAC Flow Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Active Jobs</h2>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500 mt-2">Currently in progress</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Pending Quotes</h2>
            <p className="text-3xl font-bold text-yellow-600">5</p>
            <p className="text-sm text-gray-500 mt-2">Awaiting customer approval</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">SMS Sent</h2>
            <p className="text-3xl font-bold text-green-600">48</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">New job created: AC Installation</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-medium">Quote sent to customer</p>
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="font-medium">SMS notification sent</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <a 
            href="/" 
            className="inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
