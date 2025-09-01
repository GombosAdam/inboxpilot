export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">OAuth Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">NextAuth Configuration</h2>
          <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL}</p>
          <p><strong>Google Client ID:</strong> {process.env.GOOGLE_CLIENT_ID?.slice(0, 20)}...</p>
          <p><strong>Google Client Secret:</strong> {process.env.GOOGLE_CLIENT_SECRET ? '✅ Configured' : '❌ Missing'}</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">Required Google Console Settings</h2>
          <p><strong>Authorized Redirect URI:</strong></p>
          <code className="block bg-white p-2 rounded mt-2">
            http://localhost:3000/api/auth/callback/google
          </code>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold mb-2">Test Links</h2>
          <div className="space-y-2">
            <div>
              <a 
                href="/api/auth/providers" 
                target="_blank"
                className="text-blue-600 underline"
              >
                Check Providers ↗
              </a>
            </div>
            <div>
              <a 
                href="/api/auth/signin" 
                className="bg-blue-600 text-white px-4 py-2 rounded inline-block"
              >
                Test Sign In
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold mb-2">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Verify redirect URI in Google Console matches exactly</li>
            <li>Make sure Gmail API is enabled in Google Console</li>
            <li>Check if OAuth consent screen is configured</li>
            <li>Try in incognito/private browsing mode</li>
            <li>Clear browser cookies for localhost:3000</li>
          </ol>
        </div>
      </div>
    </div>
  );
}