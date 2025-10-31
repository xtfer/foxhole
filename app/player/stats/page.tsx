import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function PlayerStatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const playerName = user?.user_metadata?.player_name || user?.email?.split('@')[0];

  const { data: player } = await supabase
    .from('players')
    .select('*')
    .ilike('current_name', `%${playerName}%`)
    .limit(1)
    .single();

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
      <header className="bg-slate-900/50 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Detailed Statistics</h1>
              <p className="text-slate-300">{playerName}</p>
            </div>
            <Link href="/player">
              <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {player && stats ? (
          <div className="space-y-6">
            {/* Combat Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Combat Statistics</CardTitle>
                <CardDescription className="text-slate-300">
                  Your combat performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                  <div>
                    <p className="text-sm text-slate-300">Kills</p>
                    <p className="text-2xl font-bold">{stats.kills}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Deaths</p>
                    <p className="text-2xl font-bold">{stats.deaths}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">K/D Ratio</p>
                    <p className="text-2xl font-bold">{stats.kill_death_ratio?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Teamkills</p>
                    <p className="text-2xl font-bold">{stats.teamkills}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Kills/Min</p>
                    <p className="text-2xl font-bold">{stats.kills_per_minute?.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Deaths/Min</p>
                    <p className="text-2xl font-bold">{stats.deaths_per_minute?.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Longest Life</p>
                    <p className="text-2xl font-bold">
                      {Math.floor((stats.longest_life_seconds || 0) / 60)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Shortest Life</p>
                    <p className="text-2xl font-bold">
                      {Math.floor((stats.shortest_life_seconds || 0) / 60)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Score Breakdown</CardTitle>
                <CardDescription className="text-slate-300">
                  Points earned by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                  <div>
                    <p className="text-sm text-slate-300">Combat</p>
                    <p className="text-3xl font-bold text-red-400">{stats.combat_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Offense</p>
                    <p className="text-3xl font-bold text-orange-400">{stats.offense_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Defense</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.defense_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Support</p>
                    <p className="text-3xl font-bold text-green-400">{stats.support_score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playtime */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Playtime</CardTitle>
                <CardDescription className="text-slate-300">
                  Time spent in game
                </CardDescription>
              </CardHeader>
              <CardContent className="text-white">
                <div className="text-4xl font-bold">
                  {Math.floor((stats.playtime_seconds || 0) / 3600)} hours{' '}
                  {Math.floor(((stats.playtime_seconds || 0) % 3600) / 60)} minutes
                </div>
                <p className="text-slate-300 mt-2">
                  Total playtime in the tracked period
                </p>
              </CardContent>
            </Card>

            {/* Weapons (if data available) */}
            {stats.weapons && Object.keys(stats.weapons).length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Weapons</CardTitle>
                  <CardDescription className="text-slate-300">
                    Most used weapons by kills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.weapons)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 10)
                      .map(([weapon, kills]) => (
                        <div
                          key={weapon}
                          className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0"
                        >
                          <span className="text-white">{weapon}</span>
                          <span className="text-slate-300">{kills as number} kills</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">No Statistics Available</CardTitle>
              <CardDescription className="text-slate-300">
                Statistics data hasn't been synced yet
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white">
              <p>Please wait for an administrator to sync your statistics data.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
