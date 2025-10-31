export interface CRCONResponse<T> {
  result: T;
  command: string;
  arguments: Record<string, any>;
  failed: boolean;
  error: string | null;
  forwards_results: any;
  version: string;
}

export interface Player {
  player_id: string;
  name: string;
  team: 'axis' | 'allies' | null;
  role: string;
  loadout: string;
  unit_id: number;
  unit_name: string;
  level: number;
  kills: number;
  deaths: number;
  combat: number;
  offense: number;
  defense: number;
  support: number;
}

export interface DetailedPlayer extends Player {
  country: string;
  steam_id_64: string;
  steam_bans: SteamBans | null;
  created: string;
  vip_expiration: string | null;
  profile: PlayerProfile | null;
  is_vip: boolean;
  is_online: boolean;
}

export interface SteamBans {
  has_bans: boolean;
  vac_bans: number;
  game_bans: number;
  days_since_last_ban: number;
}

export interface PlayerProfile {
  player_id: string;
  names: PlayerName[];
  sessions: PlayerSession[];
  total_playtime_seconds: number;
  current_playtime_seconds: number;
  received_actions: PlayerAction[];
  penalty_count: PenaltyCount;
  blacklist_records: BlacklistRecord[];
  flags: PlayerFlag[];
  watchlist: Watchlist | null;
  steaminfo: SteamInfo | null;
}

export interface PlayerName {
  name: string;
  last_seen: string;
}

export interface PlayerSession {
  start: string;
  end: string | null;
  server_number: number;
  server_name: string;
}

export interface PlayerAction {
  action_type: string;
  reason: string;
  by: string;
  time: string;
}

export interface PenaltyCount {
  kicks: number;
  punishments: number;
  temp_bans: number;
  perma_bans: number;
}

export interface BlacklistRecord {
  id: number;
  blacklist_id: number;
  blacklist_name: string;
  reason: string;
  admin_name: string;
  created_at: string;
  expires_at: string | null;
}

export interface PlayerFlag {
  id: number;
  flag: string;
  comment: string | null;
  modified: string;
}

export interface Watchlist {
  player_id: string;
  reason: string;
  by: string;
  created: string;
}

export interface SteamInfo {
  profile: {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
  };
  country: string;
  bans: SteamBans;
}

export interface GameState {
  num_allied_players: number;
  num_axis_players: number;
  allied_score: number;
  axis_score: number;
  time_remaining: number;
  current_map: string;
  next_map: string;
}

export interface ScoreboardMap {
  id: string;
  start: string;
  end: string | null;
  server_number: number;
  map: {
    id: string;
    pretty_name: string;
    game_mode: string;
    environment: string;
    map: {
      id: string;
      pretty_name: string;
    };
  };
  result: {
    allied: number;
    axis: number;
  } | null;
}

export interface DateScoreboard {
  player_id: string;
  player: string;
  kills: number;
  kills_streak: number;
  deaths: number;
  deaths_without_kill_streak: number;
  teamkills: number;
  teamkills_streak: number;
  deaths_by_tk: number;
  deaths_by_tk_streak: number;
  nb_vote_started: number;
  nb_voted_yes: number;
  nb_voted_no: number;
  time_seconds: number;
  kills_per_minute: number;
  deaths_per_minute: number;
  kill_death_ratio: number;
  longest_life_secs: number;
  shortest_life_secs: number;
  combat: number;
  offense: number;
  defense: number;
  support: number;
  most_killed: Record<string, number>;
  death_by: Record<string, number>;
  weapons: Record<string, number>;
  death_by_weapons: Record<string, number>;
}

export interface VIPRequest {
  player_id: string;
  description: string;
  expiration?: string;
}

export interface MessagePlayerRequest {
  player_id: string;
  message: string;
  by: string;
}

export interface KickRequest {
  player_name: string;
  player_id?: string;
  reason: string;
  by: string;
}

export interface BanRequest {
  player_id: string;
  player_name?: string;
  reason: string;
  by: string;
  duration_hours?: number;
}
