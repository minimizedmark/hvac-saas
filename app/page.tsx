export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to HVAC Flow
        </h1>
        
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Job Management
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Track and manage HVAC service jobs efficiently with our intuitive dashboard.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Smart Quoting
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              AI-powered quote generation for accurate and fast customer estimates.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              SMS Notifications
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Keep customers informed with automated SMS updates via Twilio integration.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
