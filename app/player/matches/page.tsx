import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';

export default async function PlayerMatchesPage() {
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

  let matches = null;
  if (player) {
    const { data } = await supabase
      .from('player_match_performance')
      .select(`
        *,
        games:game_id (
          game_id,
          map_name,
          game_mode,
          started_at,
          ended_at,
          duration_seconds,
          allied_score,
          axis_score,
          winner
        )
      `)
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(20);
    matches = data;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-900/50 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Match History</h1>
              <p className="text-slate-300">{playerName}</p>
            </div>
            <Link href="/player">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {player && matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match: any) => {
              const game = match.games;
              const isWinner =
                (match.team === 'allies' && game.winner === 'allies') ||
                (match.team === 'axis' && game.winner === 'axis');

              return (
                <Card key={match.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {game.map_name}
                          {isWinner && <Trophy className="h-5 w-5 text-yellow-400" />}
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                          {game.game_mode} • {new Date(game.started_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={isWinner ? 'default' : 'secondary'}
                          className={
                            isWinner
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600'
                          }
                        >
                          {isWinner ? 'Victory' : game.winner === 'draw' ? 'Draw' : 'Defeat'}
                        </Badge>
                        <p className="text-sm text-slate-300 mt-1 capitalize">
                          Team: {match.team}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-white">
                      <div>
                        <p className="text-xs text-slate-300">Score</p>
                        <p className="text-lg font-bold">
                          {game.allied_score} - {game.axis_score}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">Kills</p>
                        <p className="text-lg font-bold">{match.kills}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">Deaths</p>
                        <p className="text-lg font-bold">{match.deaths}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">K/D</p>
                        <p className="text-lg font-bold">
                          {match.deaths > 0
                            ? (match.kills / match.deaths).toFixed(2)
                            : match.kills.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">Role</p>
                        <p className="text-lg font-bold">{match.role || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">Duration</p>
                        <p className="text-lg font-bold">
                          {Math.floor((game.duration_seconds || 0) / 60)}m
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-300">Combat</p>
                          <p className="text-sm font-semibold text-red-400">
                            {match.combat_score}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">Offense</p>
                          <p className="text-sm font-semibold text-orange-400">
                            {match.offense_score}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">Defense</p>
                          <p className="text-sm font-semibold text-blue-400">
                            {match.defense_score}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">Support</p>
                          <p className="text-sm font-semibold text-green-400">
                            {match.support_score}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">No Match History</CardTitle>
              <CardDescription className="text-slate-300">
                Match data hasn't been synced yet
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white">
              <p>
                Match performance data will appear here after an administrator syncs the database.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
