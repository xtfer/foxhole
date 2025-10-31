import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, User, BarChart, History, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';
import TotalStatsView from './components/TotalStatsView';

export default async function AdminPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch player
  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !player) {
    notFound();
  }

  // Fetch recent matches
  const { data: matches } = await supabase
    .from('player_match_performance')
    .select(`
      *,
      games:game_id (
        map_name,
        game_mode,
        started_at,
        winner
      )
    `)
    .eq('player_id', player.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {player.current_name}
                </h1>
                <div className="flex gap-2">
                  {player.is_vip && (
                    <Badge className="bg-yellow-500">VIP</Badge>
                  )}
                  {player.is_banned && (
                    <Badge variant="destructive">Banned</Badge>
                  )}
                  {player.is_watched && (
                    <Badge variant="secondary">Watched</Badge>
                  )}
                </div>
              </div>
              <p className="text-slate-600 font-mono text-sm">{player.player_id}</p>
            </div>
            <Link href="/admin/players">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Players
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Player Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Current Name</p>
                  <p className="font-semibold">{player.current_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Player ID</p>
                  <p className="font-mono text-xs">{player.player_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Country</p>
                  <p className="font-semibold">{player.country || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Last Seen</p>
                  <p className="font-semibold">
                    {player.last_seen
                      ? new Date(player.last_seen).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Playtime</p>
                  <p className="font-semibold">
                    {Math.floor((player.total_playtime_seconds || 0) / 3600)}h{' '}
                    {Math.floor(((player.total_playtime_seconds || 0) % 3600) / 60)}m
                  </p>
                </div>
                {player.vip_expiration && (
                  <div>
                    <p className="text-sm text-slate-600">VIP Expiration</p>
                    <p className="font-semibold">
                      {new Date(player.vip_expiration).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CRCON Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  CRCON Actions
                </CardTitle>
                <CardDescription>
                  Admin actions (requires CRCON integration)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" disabled>
                  Send Message
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  {player.is_vip ? 'Remove VIP' : 'Add VIP'}
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Kick Player
                </Button>
                <Button variant="destructive" className="w-full" disabled>
                  Ban Player
                </Button>
                <p className="text-xs text-slate-500 mt-4">
                  Note: CRCON action buttons are placeholders. Implement with API calls.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats and History */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">
                  <BarChart className="h-4 w-4 mr-2" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="matches">
                  <History className="h-4 w-4 mr-2" />
                  Match History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-6">
                <TotalStatsView playerId={player.id} />
              </TabsContent>

              <TabsContent value="matches" className="space-y-4">
                {matches && matches.length > 0 ? (
                  matches.map((match: any) => (
                    <Card key={match.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {match.games.map_name}
                            </CardTitle>
                            <CardDescription>
                              {match.games.game_mode} •{' '}
                              {new Date(match.games.started_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              match.team === match.games.winner ? 'default' : 'secondary'
                            }
                          >
                            {match.team === match.games.winner ? 'Victory' : 'Defeat'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Kills</p>
                            <p className="font-bold">{match.kills}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Deaths</p>
                            <p className="font-bold">{match.deaths}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Role</p>
                            <p className="font-bold">{match.role || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Team</p>
                            <p className="font-bold capitalize">{match.team}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-slate-600">No match history available yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
