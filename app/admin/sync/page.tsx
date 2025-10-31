'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Database, RefreshCw, CheckCircle, XCircle, Loader2, Server } from 'lucide-react';

export default function SyncManagementPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<{ url: string; status: string } | null>(null);

  useEffect(() => {
    // Fetch server info on component mount
    fetch('/api/sync/server-info')
      .then((res) => res.json())
      .then((data) => setServerInfo(data))
      .catch(() => setServerInfo({ url: 'Unknown', status: 'Error' }));
  }, []);

  const triggerSync = async (syncType: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sync Management</h1>
              <p className="text-slate-600">Manually trigger data synchronization from CRCON</p>
              {serverInfo && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Server className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700">
                    Server: <span className="font-mono text-slate-900">{serverInfo.url}</span>
                  </span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      serverInfo.status === 'Connected'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {serverInfo.status}
                  </span>
                </div>
              )}
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sync Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sync Players
              </CardTitle>
              <CardDescription>
                Fetch and update all player profiles from CRCON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => triggerSync('players')}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Players
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sync Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sync Statistics
              </CardTitle>
              <CardDescription>
                Fetch player statistics from the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => triggerSync('statistics')}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Statistics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sync Games */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sync Games
              </CardTitle>
              <CardDescription>
                Fetch match history (last 100 games)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => triggerSync('games')}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Games
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sync All */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sync Everything
              </CardTitle>
              <CardDescription>
                Run all sync operations sequentially
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => triggerSync('all')}
                disabled={loading}
                className="w-full"
                variant="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync All Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                Sync Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Sync Completed Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-white p-4 rounded border text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Data Synchronization</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              <strong>Players:</strong> Syncs current player profiles from the CRCON server. This
              includes names, countries, VIP status, and basic information.
            </p>
            <p>
              <strong>Statistics:</strong> Fetches aggregated player statistics from the last 7
              days, including kills, deaths, scores, and playtime.
            </p>
            <p>
              <strong>Games:</strong> Retrieves match history with results, maps, and duration for
              the last 100 games played.
            </p>
            <p>
              <strong>All:</strong> Runs all three sync operations in sequence. This can take
              several minutes depending on the amount of data.
            </p>
            <p className="text-yellow-700 bg-yellow-50 p-3 rounded mt-4">
              ⚠️ Large syncs may take several minutes. The page will wait for completion before
              showing results.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
