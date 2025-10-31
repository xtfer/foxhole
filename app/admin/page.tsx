import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Database, Activity, Settings } from 'lucide-react';
import { ConnectivityIndicator } from '@/components/admin/connectivity-indicator';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch counts
  const [
    { count: playerCount },
    { count: gameCount },
    { data: recentSyncLogs },
  ] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase
      .from('sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5),
  ]);

  const { data: recentPlayers } = await supabase
    .from('players')
    .select('*')
    .order('last_seen', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <div className="mt-1">
                <ConnectivityIndicator />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/players">
                <Button variant="outline">Players</Button>
              </Link>
              <Link href="/admin/sync">
                <Button variant="outline">Sync</Button>
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button variant="outline">Sign Out</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Tracked in database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Match history recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentSyncLogs?.[0]?.status || 'Never'}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentSyncLogs?.[0]?.started_at
                  ? new Date(recentSyncLogs[0].started_at).toLocaleString()
                  : 'No syncs yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/sync">
                <Button className="w-full" size="sm">
                  Trigger Sync
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Players */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Players</CardTitle>
              <CardDescription>Last seen on the server</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPlayers && recentPlayers.length > 0 ? (
                <div className="space-y-2">
                  {recentPlayers.map((player: any) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{player.current_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.country || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {player.last_seen
                            ? new Date(player.last_seen).toLocaleDateString()
                            : 'Never'}
                        </p>
                        {player.is_vip && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No players synced yet</p>
                  <Link href="/admin/sync">
                    <Button className="mt-4" size="sm">
                      Sync Players Now
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sync Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Syncs</CardTitle>
              <CardDescription>Last synchronization attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSyncLogs && recentSyncLogs.length > 0 ? (
                <div className="space-y-2">
                  {recentSyncLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium capitalize">{log.sync_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            log.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.status}
                        </span>
                        {log.records_processed && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.records_processed} records
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No sync history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
