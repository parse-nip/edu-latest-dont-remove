'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">App Builder Test</h1>
        <p className="text-gray-600 mb-6">
          This is a simple test page to verify the basic setup is working.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">✅ Basic Setup</h3>
            <p className="text-sm text-blue-700">Next.js 15 with React components</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900">✅ Dependencies</h3>
            <p className="text-sm text-green-700">All bolt.new dependencies installed</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900">🔄 Integration</h3>
            <p className="text-sm text-yellow-700">WebContainer and workbench components ready</p>
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/app-builder" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors inline-block text-center"
          >
            Go to App Builder
          </a>
        </div>
      </div>
    </div>
  );
}
