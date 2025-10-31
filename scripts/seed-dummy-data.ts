import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const maps = [
  { id: 'stmariedumont', name: 'St. Marie du Mont' },
  { id: 'carentan', name: 'Carentan' },
  { id: 'omahabeach', name: 'Omaha Beach' },
  { id: 'purpleheartlane', name: 'Purple Heart Lane' },
  { id: 'utahbeach', name: 'Utah Beach' },
  { id: 'hill400', name: 'Hill 400' },
  { id: 'foy', name: 'Foy' },
  { id: 'kursk', name: 'Kursk' },
];

const names = [
  'Sergeant Murphy', 'Private Johnson', 'Captain Smith', 'Lieutenant Brown',
  'Colonel Davis', 'Major Wilson', 'Corporal Miller', 'Private Taylor',
  'Sergeant Anderson', 'Private Thomas', 'Captain Jackson', 'Lieutenant White',
  'Major Harris', 'Sergeant Martin', 'Private Thompson', 'Corporal Garcia',
  'Lieutenant Martinez', 'Private Robinson', 'Captain Clark', 'Major Rodriguez',
  'Sergeant Lewis', 'Private Lee', 'Corporal Walker', 'Captain Hall',
  'Lieutenant Allen', 'Private Young', 'Sergeant Hernandez', 'Major King',
  'Private Wright', 'Captain Lopez', 'Corporal Hill', 'Lieutenant Scott',
];

const countries = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'NL', 'PL', 'RU'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDummyData() {
  console.log('🌱 Starting to seed dummy data...');

  try {
    // 1. Create players
    console.log('Creating players...');
    const players = [];
    for (let i = 0; i < 50; i++) {
      const name = randomChoice(names);
      const playerData = {
        player_id: `dummy_player_${i}_${Date.now()}`,
        current_name: `${name} #${i}`,
        names: JSON.stringify([`${name} #${i}`]),
        country: randomChoice(countries),
        last_seen: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        total_playtime_seconds: randomInt(3600, 500000),
        is_vip: Math.random() > 0.8,
        is_banned: false,
        is_watched: Math.random() > 0.9,
        profile_data: JSON.stringify({
          level: randomInt(1, 100),
          rank: randomInt(1, 20),
        }),
      };
      players.push(playerData);
    }

    const { data: insertedPlayers, error: playersError } = await supabase
      .from('players')
      .insert(players)
      .select();

    if (playersError) {
      console.error('Error inserting players:', playersError);
      throw playersError;
    }
    console.log(`✅ Created ${insertedPlayers.length} players`);

    // 2. Create games
    console.log('Creating games...');
    const games = [];
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      const map = randomChoice(maps);
      const startedAt = new Date(now - (i * 2 * 60 * 60 * 1000)); // Every 2 hours
      const duration = randomInt(2700, 5400); // 45-90 minutes
      const endedAt = new Date(startedAt.getTime() + duration * 1000);
      const alliedScore = randomInt(0, 5);
      const axisScore = randomInt(0, 5);

      const gameData = {
        game_id: `dummy_game_${i}_${Date.now()}`,
        server_number: 1,
        map_id: map.id,
        map_name: map.name,
        game_mode: 'Warfare',
        environment: randomChoice(['day', 'night', 'dusk', 'dawn']),
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: duration,
        allied_score: alliedScore,
        axis_score: axisScore,
        winner: alliedScore > axisScore ? 'allies' : axisScore > alliedScore ? 'axis' : 'draw',
      };
      games.push(gameData);
    }

    const { data: insertedGames, error: gamesError } = await supabase
      .from('games')
      .insert(games)
      .select();

    if (gamesError) {
      console.error('Error inserting games:', gamesError);
      throw gamesError;
    }
    console.log(`✅ Created ${insertedGames.length} games`);

    // 3. Create player statistics
    console.log('Creating player statistics...');
    const statistics = [];
    const now7DaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    for (const player of insertedPlayers) {
      const kills = randomInt(50, 500);
      const deaths = randomInt(30, 400);
      const playtime = randomInt(10800, 86400); // 3-24 hours

      const statData = {
        player_id: player.id,
        period_start: now7DaysAgo.toISOString(),
        period_end: new Date().toISOString(),
        kills,
        deaths,
        teamkills: randomInt(0, 10),
        kill_death_ratio: deaths > 0 ? (kills / deaths).toFixed(2) : kills,
        kills_per_minute: (kills / (playtime / 60)).toFixed(4),
        deaths_per_minute: (deaths / (playtime / 60)).toFixed(4),
        combat_score: randomInt(1000, 20000),
        offense_score: randomInt(500, 10000),
        defense_score: randomInt(500, 10000),
        support_score: randomInt(500, 10000),
        playtime_seconds: playtime,
        longest_life_seconds: randomInt(300, 1800),
        shortest_life_seconds: randomInt(10, 120),
        weapons: JSON.stringify({
          'M1 Garand': randomInt(50, 200),
          'Kar98k': randomInt(40, 180),
          'Thompson': randomInt(30, 150),
        }),
        most_killed: JSON.stringify({
          'Private Smith': randomInt(5, 20),
          'Sergeant Jones': randomInt(3, 15),
        }),
        death_by: JSON.stringify({
          'Corporal Brown': randomInt(3, 15),
          'Private Davis': randomInt(2, 10),
        }),
      };
      statistics.push(statData);
    }

    const { error: statsError } = await supabase
      .from('player_statistics')
      .insert(statistics);

    if (statsError) {
      console.error('Error inserting statistics:', statsError);
      throw statsError;
    }
    console.log(`✅ Created ${statistics.length} player statistics`);

    // 4. Create player match performances
    console.log('Creating player match performances...');
    const performances = [];
    
    for (const game of insertedGames) {
      // Pick 10-20 random players for each game
      const numPlayers = randomInt(10, 20);
      const shuffledPlayers = [...insertedPlayers].sort(() => Math.random() - 0.5);
      const gamePlayers = shuffledPlayers.slice(0, numPlayers);

      for (const player of gamePlayers) {
        const perfData = {
          player_id: player.id,
          game_id: game.id,
          team: randomChoice(['axis', 'allies']),
          role: randomChoice(['Rifleman', 'Assault', 'Support', 'Engineer', 'Medic', 'Officer']),
          kills: randomInt(0, 30),
          deaths: randomInt(0, 20),
          teamkills: randomInt(0, 2),
          combat_score: randomInt(500, 3000),
          offense_score: randomInt(200, 1500),
          defense_score: randomInt(200, 1500),
          support_score: randomInt(100, 1000),
          playtime_seconds: randomInt(1800, 5400),
          weapons_used: JSON.stringify({
            'M1 Garand': randomInt(10, 50),
            'Grenade': randomInt(2, 10),
          }),
        };
        performances.push(perfData);
      }
    }

    const { error: perfError } = await supabase
      .from('player_match_performance')
      .insert(performances);

    if (perfError) {
      console.error('Error inserting performances:', perfError);
      throw perfError;
    }
    console.log(`✅ Created ${performances.length} player match performances`);

    // 5. Create sync logs
    console.log('Creating sync logs...');
    const syncLogs = [];
    for (let i = 0; i < 10; i++) {
      const startedAt = new Date(Date.now() - i * 60 * 60 * 1000); // Every hour
      const completedAt = new Date(startedAt.getTime() + randomInt(30000, 180000));
      
      syncLogs.push({
        sync_type: randomChoice(['players', 'statistics', 'games', 'all']),
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        status: randomChoice(['completed', 'completed', 'completed', 'failed']), // 75% success
        records_processed: randomInt(10, 500),
        error_message: null,
        metadata: JSON.stringify({
          source: 'manual',
        }),
      });
    }

    const { error: syncError } = await supabase
      .from('sync_logs')
      .insert(syncLogs);

    if (syncError) {
      console.error('Error inserting sync logs:', syncError);
      throw syncError;
    }
    console.log(`✅ Created ${syncLogs.length} sync logs`);

    console.log('\n🎉 Dummy data seeding complete!');
    console.log(`
Summary:
- ${insertedPlayers.length} players
- ${insertedGames.length} games
- ${statistics.length} player statistics
- ${performances.length} match performances
- ${syncLogs.length} sync logs
    `);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedDummyData();
