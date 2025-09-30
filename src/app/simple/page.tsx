export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Simple Test Page</h1>
        <p className="text-gray-600">This is a basic test page without any complex components.</p>
        <div className="mt-4">
          <a href="/app-builder" className="text-blue-500 hover:underline">
            Go to App Builder
          </a>
        </div>
      </div>
    </div>
  );
}
