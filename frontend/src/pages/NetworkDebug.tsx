import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NetworkDebug() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        setStatus({
          apiUrl: API_BASE_URL,
          hostname: window.location.hostname,
          port: window.location.port,
          protocol: window.location.protocol,
          backendStatus: response.ok ? '✅ Connected' : '❌ Error',
          backendResponse: data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        setStatus({
          apiUrl: API_BASE_URL,
          hostname: window.location.hostname,
          port: window.location.port,
          protocol: window.location.protocol,
          backendStatus: '❌ Connection Failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleTimeString(),
        });
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-6">Network Diagnostics</h1>

          {loading ? (
            <div className="text-center text-gray-400">Checking connection...</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-3">Connection Status</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Backend Status:</span>
                    <span className="text-white font-mono">{status.backendStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">API URL:</span>
                    <span className="text-white font-mono text-xs break-all">{status.apiUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Hostname:</span>
                    <span className="text-white font-mono">{status.hostname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Port:</span>
                    <span className="text-white font-mono">{status.port || '80/443'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protocol:</span>
                    <span className="text-white font-mono">{status.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Check:</span>
                    <span className="text-white font-mono">{status.timestamp}</span>
                  </div>
                </div>
              </div>

              {status.error && (
                <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                  <h3 className="text-red-400 font-semibold mb-2">Connection Error</h3>
                  <p className="text-red-300 text-sm">{status.error}</p>
                  <div className="mt-4 text-sm text-red-300">
                    <p className="font-semibold mb-2">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure backend is running on port 5000</li>
                      <li>Check firewall settings</li>
                      <li>Verify you're on the same network</li>
                      <li>Try accessing from desktop first</li>
                    </ul>
                  </div>
                </div>
              )}

              {status.backendResponse && (
                <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                  <h3 className="text-green-400 font-semibold mb-2">Backend Response</h3>
                  <pre className="text-green-300 text-xs overflow-auto bg-slate-900 p-2 rounded">
                    {JSON.stringify(status.backendResponse, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">Instructions</h3>
                <div className="text-blue-300 text-sm space-y-2">
                  <p><strong>On Mobile:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Find your computer's IP address</li>
                    <li>Access: http://&lt;your-ip&gt;:5173</li>
                    <li>Try logging in again</li>
                  </ol>
                  <p className="mt-3"><strong>To find your IP:</strong></p>
                  <code className="bg-slate-900 p-2 rounded block text-xs">
                    Windows: ipconfig<br />
                    Mac/Linux: ifconfig
                  </code>
                </div>
              </div>

              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Refresh Status
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
