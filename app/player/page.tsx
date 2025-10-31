import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';

export default async function PlayerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For now, show placeholder since we don't have player linking yet
  const playerName = user?.user_metadata?.player_name || user?.email?.split('@')[0];
  
  // Check if user is admin
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAdmin = user && adminEmails.includes(user.email || '');

  // Fetch player data if exists
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .ilike('current_name', `%${playerName}%`)
    .limit(1)
    .single();

  // Fetch recent stats if player exists
  let stats = null;
  if (player) {
    const { data } = await supabase
      .from('player_statistics')
      .select('*')
      .eq('player_id', player.id)
      .order('period_end', { ascending: false })
      .limit(1)
      .single();
    stats = data;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Player Dashboard</h1>
              <p className="text-slate-300">Welcome back, {playerName}</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="default">Admin</Button>
                </Link>
              )}
              <Link href="/player/stats">
                <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white">Stats</Button>
              </Link>
              <Link href="/player/matches">
                <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white">Matches</Button>
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white">Sign Out</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {player ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Kills</CardTitle>
                  <Target className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats?.kills || 0}
                  </div>
                  <p className="text-xs text-slate-300">
                    K/D: {stats?.kill_death_ratio?.toFixed(2) || '0.00'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Deaths</CardTitle>
                  <Trophy className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats?.deaths || 0}
                  </div>
                  <p className="text-xs text-slate-300">
                    Teamkills: {stats?.teamkills || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Playtime</CardTitle>
                  <Clock className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats?.playtime_seconds
                      ? Math.floor(stats.playtime_seconds / 3600)
                      : 0}h
                  </div>
                  <p className="text-xs text-slate-300">
                    {stats?.playtime_seconds
                      ? Math.floor((stats.playtime_seconds % 3600) / 60)
                      : 0}m
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Combat Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats?.combat_score || 0}
                  </div>
                  <p className="text-xs text-slate-300">
                    Support: {stats?.support_score || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Card */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Player Profile</CardTitle>
                <CardDescription className="text-slate-300">
                  Your Hell Let Loose statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Player Name</p>
                    <p className="font-semibold">{player.current_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Country</p>
                    <p className="font-semibold">{player.country || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Last Seen</p>
                    <p className="font-semibold">
                      {player.last_seen
                        ? new Date(player.last_seen).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Status</p>
                    <p className="font-semibold">
                      {player.is_vip ? (
                        <span className="text-yellow-400">VIP Member</span>
                      ) : (
                        'Regular'
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Details */}
            {stats && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Performance</CardTitle>
                  <CardDescription className="text-slate-300">
                    Statistics from latest period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                    <div>
                      <p className="text-sm text-slate-300">Combat</p>
                      <p className="text-xl font-bold">{stats.combat_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Offense</p>
                      <p className="text-xl font-bold">{stats.offense_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Defense</p>
                      <p className="text-xl font-bold">{stats.defense_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Support</p>
                      <p className="text-xl font-bold">{stats.support_score}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Not Found</CardTitle>
              <CardDescription className="text-slate-300">
                We couldn't find your player profile in our database
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white">
              <p className="mb-4">
                Your in-game profile hasn't been synced yet. This could be because:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-slate-300">
                <li>You haven't played on the server recently</li>
                <li>The admin hasn't run a sync yet</li>
                <li>Your in-game name doesn't match your account name</li>
              </ul>
              <p className="text-sm text-slate-300">
                Please contact an administrator to link your account, or wait for the next
                automatic sync.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
