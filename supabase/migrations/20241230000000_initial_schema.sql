-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT UNIQUE NOT NULL,
  current_name TEXT NOT NULL,
  names JSONB DEFAULT '[]'::jsonb,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE,
  total_playtime_seconds INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT FALSE,
  vip_expiration TIMESTAMP WITH TIME ZONE,
  is_banned BOOLEAN DEFAULT FALSE,
  is_watched BOOLEAN DEFAULT FALSE,
  flags JSONB DEFAULT '[]'::jsonb,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- Create player_statistics table
CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  teamkills INTEGER DEFAULT 0,
  kill_death_ratio DECIMAL(10, 2) DEFAULT 0,
  kills_per_minute DECIMAL(10, 4) DEFAULT 0,
  deaths_per_minute DECIMAL(10, 4) DEFAULT 0,
  combat_score INTEGER DEFAULT 0,
  offense_score INTEGER DEFAULT 0,
  defense_score INTEGER DEFAULT 0,
  support_score INTEGER DEFAULT 0,
  playtime_seconds INTEGER DEFAULT 0,
  longest_life_seconds INTEGER DEFAULT 0,
  shortest_life_seconds INTEGER DEFAULT 0,
  weapons JSONB DEFAULT '{}'::jsonb,
  most_killed JSONB DEFAULT '{}'::jsonb,
  death_by JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, period_start, period_end)
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id TEXT UNIQUE NOT NULL,
  server_number INTEGER,
  map_id TEXT NOT NULL,
  map_name TEXT NOT NULL,
  game_mode TEXT,
  environment TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  allied_score INTEGER,
  axis_score INTEGER,
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_match_performance table
CREATE TABLE IF NOT EXISTS player_match_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  team TEXT CHECK (team IN ('axis', 'allies')),
  role TEXT,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  teamkills INTEGER DEFAULT 0,
  combat_score INTEGER DEFAULT 0,
  offense_score INTEGER DEFAULT 0,
  defense_score INTEGER DEFAULT 0,
  support_score INTEGER DEFAULT 0,
  playtime_seconds INTEGER DEFAULT 0,
  weapons_used JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, game_id)
);

-- Create sync_configuration table
CREATE TABLE IF NOT EXISTS sync_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID
);

-- Create sync_logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);
CREATE INDEX IF NOT EXISTS idx_players_current_name ON players(current_name);
CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_player_statistics_player_id ON player_statistics(player_id);
CREATE INDEX IF NOT EXISTS idx_player_statistics_period ON player_statistics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_games_started_at ON games(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_map_id ON games(map_id);
CREATE INDEX IF NOT EXISTS idx_player_match_performance_player_id ON player_match_performance(player_id);
CREATE INDEX IF NOT EXISTS idx_player_match_performance_game_id ON player_match_performance(game_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_configuration_updated_at
  BEFORE UPDATE ON sync_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default sync configuration
INSERT INTO sync_configuration (config_key, config_value) VALUES
  ('sync_interval_minutes', '{"value": 5}'::jsonb),
  ('sync_enabled', '{"value": true}'::jsonb),
  ('last_sync_timestamp', '{"value": null}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_match_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for players (public read, authenticated write)
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (true);

CREATE POLICY "Players are insertable by authenticated users" ON players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Players are updatable by authenticated users" ON players
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for player_statistics (public read)
CREATE POLICY "Player statistics are viewable by everyone" ON player_statistics
  FOR SELECT USING (true);

CREATE POLICY "Player statistics are insertable by authenticated users" ON player_statistics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for games (public read)
CREATE POLICY "Games are viewable by everyone" ON games
  FOR SELECT USING (true);

CREATE POLICY "Games are insertable by authenticated users" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for player_match_performance (public read)
CREATE POLICY "Match performance is viewable by everyone" ON player_match_performance
  FOR SELECT USING (true);

CREATE POLICY "Match performance is insertable by authenticated users" ON player_match_performance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for sync_configuration (admin only)
CREATE POLICY "Sync configuration is viewable by authenticated users" ON sync_configuration
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sync configuration is updatable by authenticated users" ON sync_configuration
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for sync_logs (authenticated read)
CREATE POLICY "Sync logs are viewable by authenticated users" ON sync_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sync logs are insertable by authenticated users" ON sync_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
