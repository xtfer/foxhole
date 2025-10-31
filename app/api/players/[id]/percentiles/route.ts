import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get player's aggregated stats
    const { data: playerMatches } = await supabase
      .from('player_match_performance')
      .select('kills, deaths, teamkills, combat_score, offense_score, defense_score, support_score, playtime_seconds')
      .eq('player_id', id);

    const { data: player } = await supabase
      .from('players')
      .select('total_playtime_seconds')
      .eq('id', id)
      .single();

    if (!playerMatches || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Calculate player's totals and averages
    const playerVisits = playerMatches.length;
    const playerTotalKills = playerMatches.reduce((sum, m) => sum + (m.kills || 0), 0);
    const playerTotalDeaths = playerMatches.reduce((sum, m) => sum + (m.deaths || 0), 0);
    const playerTotalCombat = playerMatches.reduce((sum, m) => sum + (m.combat_score || 0), 0);
    const playerTotalOffense = playerMatches.reduce((sum, m) => sum + (m.offense_score || 0), 0);
    const playerTotalDefense = playerMatches.reduce((sum, m) => sum + (m.defense_score || 0), 0);
    const playerTotalSupport = playerMatches.reduce((sum, m) => sum + (m.support_score || 0), 0);
    const playerTotalPlaytime = playerMatches.reduce((sum, m) => sum + (m.playtime_seconds || 0), 0);
    const playerKD = playerTotalDeaths > 0 ? playerTotalKills / playerTotalDeaths : playerTotalKills;
    const playerAvgKills = playerVisits > 0 ? playerTotalKills / playerVisits : 0;
    const playerAvgDeaths = playerVisits > 0 ? playerTotalDeaths / playerVisits : 0;
    const playerAvgCombat = playerVisits > 0 ? playerTotalCombat / playerVisits : 0;
    const playerAvgOffense = playerVisits > 0 ? playerTotalOffense / playerVisits : 0;
    const playerAvgDefense = playerVisits > 0 ? playerTotalDefense / playerVisits : 0;
    const playerAvgSupport = playerVisits > 0 ? playerTotalSupport / playerVisits : 0;
    const playerAvgPlaytime = playerVisits > 0 ? playerTotalPlaytime / playerVisits : 0;
    const playerPlaytime = player.total_playtime_seconds || 0;

    // Get all players' aggregated data for comparison
    const { data: allPlayers } = await supabase
      .from('players')
      .select('id, total_playtime_seconds');

    if (!allPlayers) {
      return NextResponse.json(
        { error: 'Failed to fetch player data' },
        { status: 500 }
      );
    }

    // Get all match performances
    const { data: allMatches } = await supabase
      .from('player_match_performance')
      .select('player_id, kills, deaths, combat_score, offense_score, defense_score, support_score, playtime_seconds');

    if (!allMatches) {
      return NextResponse.json(
        { error: 'Failed to fetch match data' },
        { status: 500 }
      );
    }

    // Aggregate stats per player
    const playerStats = new Map<string, {
      visits: number;
      totalKills: number;
      totalDeaths: number;
      totalCombat: number;
      totalOffense: number;
      totalDefense: number;
      totalSupport: number;
      totalPlaytime: number;
      kdRatio: number;
      avgKills: number;
      avgDeaths: number;
      avgCombat: number;
      avgOffense: number;
      avgDefense: number;
      avgSupport: number;
      avgPlaytime: number;
      playtime: number;
    }>();

    // Initialize all players
    allPlayers.forEach(p => {
      playerStats.set(p.id, {
        visits: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalCombat: 0,
        totalOffense: 0,
        totalDefense: 0,
        totalSupport: 0,
        totalPlaytime: 0,
        kdRatio: 0,
        avgKills: 0,
        avgDeaths: 0,
        avgCombat: 0,
        avgOffense: 0,
        avgDefense: 0,
        avgSupport: 0,
        avgPlaytime: 0,
        playtime: p.total_playtime_seconds || 0,
      });
    });

    // Aggregate match data
    allMatches.forEach(match => {
      const stats = playerStats.get(match.player_id);
      if (stats) {
        stats.visits++;
        stats.totalKills += match.kills || 0;
        stats.totalDeaths += match.deaths || 0;
        stats.totalCombat += match.combat_score || 0;
        stats.totalOffense += match.offense_score || 0;
        stats.totalDefense += match.defense_score || 0;
        stats.totalSupport += match.support_score || 0;
        stats.totalPlaytime += match.playtime_seconds || 0;
      }
    });

    // Calculate derived stats
    playerStats.forEach((stats, playerId) => {
      stats.kdRatio = stats.totalDeaths > 0 ? stats.totalKills / stats.totalDeaths : stats.totalKills;
      stats.avgKills = stats.visits > 0 ? stats.totalKills / stats.visits : 0;
      stats.avgDeaths = stats.visits > 0 ? stats.totalDeaths / stats.visits : 0;
      stats.avgCombat = stats.visits > 0 ? stats.totalCombat / stats.visits : 0;
      stats.avgOffense = stats.visits > 0 ? stats.totalOffense / stats.visits : 0;
      stats.avgDefense = stats.visits > 0 ? stats.totalDefense / stats.visits : 0;
      stats.avgSupport = stats.visits > 0 ? stats.totalSupport / stats.visits : 0;
      stats.avgPlaytime = stats.visits > 0 ? stats.totalPlaytime / stats.visits : 0;
    });

    // Calculate percentile and rank
    const calculateStats = (value: number, allValues: number[]): { percentile: number; rank: number } => {
      if (allValues.length === 0) return { percentile: 0, rank: 0 };
      const sorted = allValues.sort((a, b) => b - a); // Sort descending for rank
      const rank = sorted.findIndex(v => v <= value) + 1;
      const lessThan = allValues.filter(v => v < value).length;
      const percentile = Math.round((lessThan / allValues.length) * 100);
      return { percentile, rank };
    };

    const allStats = Array.from(playerStats.values());

    const stats = {
      visits: calculateStats(playerVisits, allStats.map(s => s.visits)),
      totalKills: calculateStats(playerTotalKills, allStats.map(s => s.totalKills)),
      totalDeaths: calculateStats(playerTotalDeaths, allStats.map(s => s.totalDeaths)),
      kdRatio: calculateStats(playerKD, allStats.map(s => s.kdRatio)),
      combatScore: calculateStats(playerTotalCombat, allStats.map(s => s.totalCombat)),
      offenseScore: calculateStats(playerTotalOffense, allStats.map(s => s.totalOffense)),
      defenseScore: calculateStats(playerTotalDefense, allStats.map(s => s.totalDefense)),
      supportScore: calculateStats(playerTotalSupport, allStats.map(s => s.totalSupport)),
      avgKills: calculateStats(playerAvgKills, allStats.map(s => s.avgKills)),
      avgDeaths: calculateStats(playerAvgDeaths, allStats.map(s => s.avgDeaths)),
      avgCombatScore: calculateStats(playerAvgCombat, allStats.map(s => s.avgCombat)),
      avgOffenseScore: calculateStats(playerAvgOffense, allStats.map(s => s.avgOffense)),
      avgDefenseScore: calculateStats(playerAvgDefense, allStats.map(s => s.avgDefense)),
      avgSupportScore: calculateStats(playerAvgSupport, allStats.map(s => s.avgSupport)),
      avgPlaytime: calculateStats(playerAvgPlaytime, allStats.map(s => s.avgPlaytime)),
      playtime: calculateStats(playerPlaytime, allStats.map(s => s.playtime)),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error calculating percentiles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
