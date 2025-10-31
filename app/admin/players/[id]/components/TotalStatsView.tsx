'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Target, Award } from 'lucide-react';

interface TotalStats {
  visits: number;
  playtime: number;
  kills: number;
  deaths: number;
  teamkills: number;
  combatScore: number;
  offenseScore: number;
  defenseScore: number;
  supportScore: number;
}

interface AverageStats {
  kills: number;
  deaths: number;
  teamkills: number;
  kdRatio: number;
  combatScore: number;
  offenseScore: number;
  defenseScore: number;
  supportScore: number;
  playtime: number;
}

interface StatRank {
  percentile: number;
  rank: number;
}

interface Percentiles {
  visits: StatRank;
  totalKills: StatRank;
  totalDeaths: StatRank;
  kdRatio: StatRank;
  combatScore: StatRank;
  offenseScore: StatRank;
  defenseScore: StatRank;
  supportScore: StatRank;
  avgKills: StatRank;
  avgDeaths: StatRank;
  avgCombatScore: StatRank;
  avgOffenseScore: StatRank;
  avgDefenseScore: StatRank;
  avgSupportScore: StatRank;
  avgPlaytime: StatRank;
  playtime: StatRank;
}

interface TotalStatsViewProps {
  playerId: string;
}

export default function TotalStatsView({ playerId }: TotalStatsViewProps) {
  const [totals, setTotals] = useState<TotalStats | null>(null);
  const [averages, setAverages] = useState<AverageStats | null>(null);
  const [percentiles, setPercentiles] = useState<Percentiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Fetch totals and averages
        const statsRes = await fetch(`/api/players/${playerId}/total-stats`);
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();
        
        // Fetch percentiles
        const percentilesRes = await fetch(`/api/players/${playerId}/percentiles`);
        if (!percentilesRes.ok) throw new Error('Failed to fetch percentiles');
        const percentilesData = await percentilesRes.json();
        
        setTotals(statsData.totals);
        setAverages(statsData.averages);
        setPercentiles(percentilesData.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [playerId]);

  const formatPlaytime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPerformanceCategory = (percentile: number): { label: string; color: string } => {
    if (percentile >= 80) return { label: 'Excellent', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (percentile >= 60) return { label: 'Above Average', color: 'bg-green-100 text-green-800 border-green-300' };
    if (percentile >= 40) return { label: 'Average', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (percentile >= 20) return { label: 'Below Average', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const formatRank = (rank: number): string => {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = rank % 100;
    return rank + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">Loading statistics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !totals || !averages || !percentiles) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Failed to load statistics'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (totals.visits === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No match data available yet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Total Statistics (All-Time)
          </CardTitle>
          <CardDescription>
            Cumulative stats across {totals.visits} {totals.visits === 1 ? 'game' : 'games'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Games Played</p>
              <p className="text-2xl font-bold mb-1">{totals.visits}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.visits.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.visits.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.visits.rank)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Playtime</p>
              <p className="text-2xl font-bold mb-1">{formatPlaytime(totals.playtime)}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.playtime.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.playtime.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.playtime.rank)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Kills</p>
              <p className="text-2xl font-bold text-green-600 mb-1">{totals.kills.toLocaleString()}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.totalKills.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.totalKills.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.totalKills.rank)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Deaths</p>
              <p className="text-2xl font-bold text-red-600">{totals.deaths.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Score Breakdown</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Combat</p>
                <p className="text-xl font-bold text-red-500 mb-1">{totals.combatScore.toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.combatScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.combatScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.combatScore.rank)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Offense</p>
                <p className="text-xl font-bold text-orange-500 mb-1">{totals.offenseScore.toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.offenseScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.offenseScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.offenseScore.rank)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Defense</p>
                <p className="text-xl font-bold text-blue-500 mb-1">{totals.defenseScore.toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.defenseScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.defenseScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.defenseScore.rank)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Support</p>
                <p className="text-xl font-bold text-green-500 mb-1">{totals.supportScore.toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.supportScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.supportScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.supportScore.rank)}</p>
                </div>
              </div>
            </div>
          </div>

          {totals.teamkills > 0 && (
            <div className="border-t pt-4 mt-4">
              <div>
                <p className="text-sm text-slate-600">Teamkills</p>
                <p className="text-xl font-bold text-orange-600">{totals.teamkills}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Average Performance
          </CardTitle>
          <CardDescription>Per game statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Kills/Game</p>
              <p className="text-2xl font-bold mb-1">{averages.kills.toFixed(1)}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.avgKills.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.avgKills.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.avgKills.rank)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Deaths/Game</p>
              <p className="text-2xl font-bold mb-1">{averages.deaths.toFixed(1)}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.avgDeaths.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.avgDeaths.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.avgDeaths.rank)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">K/D Ratio</p>
              <p className="text-2xl font-bold text-blue-600 mb-1">{averages.kdRatio.toFixed(2)}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.kdRatio.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.kdRatio.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.kdRatio.rank)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Playtime/Game</p>
              <p className="text-2xl font-bold mb-1">{formatPlaytime(averages.playtime)}</p>
              <div className="flex flex-col gap-1">
                <Badge className={`${getPerformanceCategory(percentiles.avgPlaytime.percentile).color} w-fit`}>
                  {getPerformanceCategory(percentiles.avgPlaytime.percentile).label}
                </Badge>
                <p className="text-xs text-slate-500">{formatRank(percentiles.avgPlaytime.rank)}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Average Scores Per Game</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Combat</p>
                <p className="text-xl font-bold text-red-500 mb-1">{Math.round(averages.combatScore).toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.avgCombatScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.avgCombatScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.avgCombatScore.rank)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Offense</p>
                <p className="text-xl font-bold text-orange-500 mb-1">{Math.round(averages.offenseScore).toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.avgOffenseScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.avgOffenseScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.avgOffenseScore.rank)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Defense</p>
                <p className="text-xl font-bold text-blue-500 mb-1">{Math.round(averages.defenseScore).toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.avgDefenseScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.avgDefenseScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.avgDefenseScore.rank)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Support</p>
                <p className="text-xl font-bold text-green-500 mb-1">{Math.round(averages.supportScore).toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={`${getPerformanceCategory(percentiles.avgSupportScore.percentile).color} w-fit`}>
                    {getPerformanceCategory(percentiles.avgSupportScore.percentile).label}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatRank(percentiles.avgSupportScore.rank)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
