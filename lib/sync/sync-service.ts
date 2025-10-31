import { getCRCONClient } from '../crcon/client';
import { createClient } from '@supabase/supabase-js';

export class SyncService {
  private crcon;
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.crcon = getCRCONClient();
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async syncPlayers() {
    const logId = await this.createSyncLog('players');

    try {
      console.log('Fetching detailed players from CRCON...');
      const players = await this.crcon.getDetailedPlayers();
      console.log(`Fetched ${players.length} players`);

      let processed = 0;

      for (const player of players) {
        try {
          // Check if player exists
          const { data: existingPlayer } = await this.supabase
            .from('players')
            .select('id, names')
            .eq('player_id', player.player_id)
            .single();

          // Update names array
          const existingNames = existingPlayer?.names || [];
          const nameExists = existingNames.some(
            (n: any) => n.name === player.name
          );
          const updatedNames = nameExists
            ? existingNames
            : [...existingNames, { name: player.name, last_seen: new Date().toISOString() }];

          const playerData = {
            player_id: player.player_id,
            current_name: player.name,
            names: updatedNames,
            country: player.country,
            last_seen: new Date().toISOString(),
            is_vip: player.is_vip,
            vip_expiration: player.vip_expiration,
            profile_data: player.profile || {},
          };

          if (existingPlayer) {
            // Update existing player
            await this.supabase
              .from('players')
              .update(playerData)
              .eq('id', existingPlayer.id);
          } else {
            // Insert new player
            await this.supabase.from('players').insert(playerData);
          }

          processed++;
        } catch (error) {
          console.error(`Error syncing player ${player.name}:`, error);
        }
      }

      await this.completeSyncLog(logId, processed);
      return { success: true, processed };
    } catch (error: any) {
      await this.failSyncLog(logId, error.message);
      throw error;
    }
  }

  async syncStatistics(daysBack: number = 7) {
    const logId = await this.createSyncLog('statistics');

    try {
      const endTimestamp = Math.floor(Date.now() / 1000);
      const startTimestamp = endTimestamp - daysBack * 24 * 60 * 60;

      console.log('Fetching scoreboard data from CRCON...');
      const scoreboards = await this.crcon.getDateScoreboard(
        startTimestamp,
        endTimestamp
      );
      console.log(`Fetched statistics for ${scoreboards.length} players`);

      let processed = 0;

      for (const stats of scoreboards) {
        try {
          // Find player in our database
          const { data: player } = await this.supabase
            .from('players')
            .select('id')
            .eq('player_id', stats.player_id)
            .single();

          if (!player) {
            console.warn(`Player ${stats.player} not found, skipping stats`);
            continue;
          }

          const statisticsData = {
            player_id: player.id,
            period_start: new Date(startTimestamp * 1000).toISOString(),
            period_end: new Date(endTimestamp * 1000).toISOString(),
            kills: stats.kills,
            deaths: stats.deaths,
            teamkills: stats.teamkills,
            kill_death_ratio: stats.kill_death_ratio,
            kills_per_minute: stats.kills_per_minute,
            deaths_per_minute: stats.deaths_per_minute,
            combat_score: stats.combat,
            offense_score: stats.offense,
            defense_score: stats.defense,
            support_score: stats.support,
            playtime_seconds: stats.time_seconds,
            longest_life_seconds: stats.longest_life_secs,
            shortest_life_seconds: stats.shortest_life_secs,
            weapons: stats.weapons || {},
            most_killed: stats.most_killed || {},
            death_by: stats.death_by || {},
          };

          // Upsert statistics
          await this.supabase
            .from('player_statistics')
            .upsert(statisticsData, {
              onConflict: 'player_id,period_start,period_end',
            });

          processed++;
        } catch (error) {
          console.error(`Error syncing stats for ${stats.player}:`, error);
        }
      }

      await this.completeSyncLog(logId, processed);
      return { success: true, processed };
    } catch (error: any) {
      await this.failSyncLog(logId, error.message);
      throw error;
    }
  }

  async syncGames(limit: number = 100) {
    const logId = await this.createSyncLog('games');

    try {
      console.log('Fetching game history from CRCON...');
      const { maps } = await this.crcon.getScoreboardMaps({
        page: 1,
        pageSize: limit,
      });
      console.log(`Fetched ${maps.length} games`);

      let processed = 0;

      for (const game of maps) {
        try {
          const gameData = {
            game_id: game.id,
            server_number: game.server_number,
            map_id: game.map.id,
            map_name: game.map.pretty_name,
            game_mode: game.map.game_mode,
            environment: game.map.environment,
            started_at: game.start,
            ended_at: game.end,
            duration_seconds: game.end
              ? Math.floor(
                  (new Date(game.end).getTime() -
                    new Date(game.start).getTime()) /
                    1000
                )
              : null,
            allied_score: game.result?.allied,
            axis_score: game.result?.axis,
            winner:
              game.result?.allied > game.result?.axis
                ? 'allies'
                : game.result?.axis > game.result?.allied
                ? 'axis'
                : 'draw',
          };

          // Upsert game
          await this.supabase.from('games').upsert(gameData, {
            onConflict: 'game_id',
          });

          processed++;
        } catch (error) {
          console.error(`Error syncing game ${game.id}:`, error);
        }
      }

      await this.completeSyncLog(logId, processed);
      return { success: true, processed };
    } catch (error: any) {
      await this.failSyncLog(logId, error.message);
      throw error;
    }
  }

  private async createSyncLog(syncType: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('sync_logs')
      .insert({
        sync_type: syncType,
        status: 'running',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async completeSyncLog(logId: string, recordsProcessed: number) {
    await this.supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
      })
      .eq('id', logId);
  }

  private async failSyncLog(logId: string, errorMessage: string) {
    await this.supabase
      .from('sync_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', logId);
  }
}
