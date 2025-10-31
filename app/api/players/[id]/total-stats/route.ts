import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get aggregated stats from player_match_performance
    const { data: matchStats, error: matchError } = await supabase
      .from('player_match_performance')
      .select('kills, deaths, teamkills, combat_score, offense_score, defense_score, support_score, playtime_seconds')
      .eq('player_id', id);

    if (matchError) {
      return NextResponse.json(
        { error: 'Failed to fetch match statistics' },
        { status: 500 }
      );
    }

    // Calculate totals
    const visits = matchStats?.length || 0;
    const totalKills = matchStats?.reduce((sum, m) => sum + (m.kills || 0), 0) || 0;
    const totalDeaths = matchStats?.reduce((sum, m) => sum + (m.deaths || 0), 0) || 0;
    const totalTeamkills = matchStats?.reduce((sum, m) => sum + (m.teamkills || 0), 0) || 0;
    const totalCombatScore = matchStats?.reduce((sum, m) => sum + (m.combat_score || 0), 0) || 0;
    const totalOffenseScore = matchStats?.reduce((sum, m) => sum + (m.offense_score || 0), 0) || 0;
    const totalDefenseScore = matchStats?.reduce((sum, m) => sum + (m.defense_score || 0), 0) || 0;
    const totalSupportScore = matchStats?.reduce((sum, m) => sum + (m.support_score || 0), 0) || 0;
    const totalMatchPlaytime = matchStats?.reduce((sum, m) => sum + (m.playtime_seconds || 0), 0) || 0;

    // Calculate averages (avoid division by zero)
    const avgKills = visits > 0 ? totalKills / visits : 0;
    const avgDeaths = visits > 0 ? totalDeaths / visits : 0;
    const avgTeamkills = visits > 0 ? totalTeamkills / visits : 0;
    const avgKD = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
    const avgCombatScore = visits > 0 ? totalCombatScore / visits : 0;
    const avgOffenseScore = visits > 0 ? totalOffenseScore / visits : 0;
    const avgDefenseScore = visits > 0 ? totalDefenseScore / visits : 0;
    const avgSupportScore = visits > 0 ? totalSupportScore / visits : 0;
    const avgPlaytime = visits > 0 ? totalMatchPlaytime / visits : 0;

    return NextResponse.json({
      totals: {
        visits,
        playtime: totalMatchPlaytime,
        kills: totalKills,
        deaths: totalDeaths,
        teamkills: totalTeamkills,
        combatScore: totalCombatScore,
        offenseScore: totalOffenseScore,
        defenseScore: totalDefenseScore,
        supportScore: totalSupportScore,
      },
      averages: {
        kills: avgKills,
        deaths: avgDeaths,
        teamkills: avgTeamkills,
        kdRatio: avgKD,
        combatScore: avgCombatScore,
        offenseScore: avgOffenseScore,
        defenseScore: avgDefenseScore,
        supportScore: avgSupportScore,
        playtime: avgPlaytime,
      },
    });
  } catch (error) {
    console.error('Error fetching total stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
