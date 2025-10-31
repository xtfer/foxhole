import type {
  CRCONResponse,
  Player,
  DetailedPlayer,
  GameState,
  ScoreboardMap,
  DateScoreboard,
  VIPRequest,
  MessagePlayerRequest,
  KickRequest,
  BanRequest,
} from '@/types/crcon';

export class CRCONClient {
  private baseUrl: string;
  private token: string;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.status === 429) {
          const delay = this.retryDelay * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CRCONResponse<T> = await response.json();

        if (data.failed) {
          throw new Error(data.error || 'CRCON request failed');
        }

        return data.result;
      } catch (error) {
        if (attempt === this.retryAttempts - 1) {
          throw error;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * (attempt + 1))
        );
      }
    }

    throw new Error('Max retry attempts reached');
  }

  // Player Data Methods
  async getPlayers(): Promise<Player[]> {
    return this.request<Player[]>('/get_players');
  }

  async getDetailedPlayers(): Promise<DetailedPlayer[]> {
    return this.request<DetailedPlayer[]>('/get_detailed_players');
  }

  async getDetailedPlayerInfo(playerName: string): Promise<DetailedPlayer> {
    return this.request<DetailedPlayer>(
      `/get_detailed_player_info?player_name=${encodeURIComponent(playerName)}`
    );
  }

  async getPlayerProfile(
    playerId: string,
    numSessions: number = 10
  ): Promise<any> {
    return this.request<any>(
      `/get_player_profile?player_id=${playerId}&num_sessions=${numSessions}`
    );
  }

  async getPlayersHistory(params: {
    page?: number;
    pageSize?: number;
    playerId?: string;
    playerName?: string;
    lastSeenFrom?: string;
    lastSeenTill?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize)
      queryParams.append('page_size', params.pageSize.toString());
    if (params.playerId) queryParams.append('player_id', params.playerId);
    if (params.playerName) queryParams.append('player_name', params.playerName);
    if (params.lastSeenFrom)
      queryParams.append('last_seen_from', params.lastSeenFrom);
    if (params.lastSeenTill)
      queryParams.append('last_seen_till', params.lastSeenTill);

    return this.request<any>(`/get_players_history?${queryParams.toString()}`);
  }

  // Statistics Methods
  async getGameState(): Promise<GameState> {
    return this.request<GameState>('/get_gamestate');
  }

  async getLiveGameStats(): Promise<any> {
    return this.request<any>('/get_live_game_stats');
  }

  async getDateScoreboard(start: number, end: number): Promise<DateScoreboard[]> {
    return this.request<DateScoreboard[]>(
      `/get_date_scoreboard?start=${start}&end=${end}`
    );
  }

  async getScoreboardMaps(params: {
    page?: number;
    pageSize?: number;
  }): Promise<{ maps: ScoreboardMap[]; total: number; page: number; page_size: number }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());

    return this.request<any>(`/get_scoreboard_maps?${queryParams.toString()}`);
  }

  async getMapScoreboard(mapId?: string): Promise<any> {
    const url = mapId ? `/get_map_scoreboard?map=${mapId}` : '/get_map_scoreboard';
    return this.request<any>(url);
  }

  // Admin Action Methods
  async addVip(data: VIPRequest): Promise<void> {
    return this.request<void>('/add_vip', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeVip(playerId: string): Promise<void> {
    return this.request<void>('/remove_vip', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  async getVipIds(): Promise<any[]> {
    return this.request<any[]>('/get_vip_ids');
  }

  async messagePlayer(data: MessagePlayerRequest): Promise<void> {
    return this.request<void>('/message_player', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async kickPlayer(data: KickRequest): Promise<void> {
    return this.request<void>('/kick', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async tempBan(data: BanRequest): Promise<void> {
    return this.request<void>('/temp_ban', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async permaBan(data: BanRequest): Promise<void> {
    return this.request<void>('/perma_ban', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unban(playerId: string): Promise<void> {
    return this.request<void>('/unban', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  async punishPlayer(playerName: string, reason: string, by: string): Promise<void> {
    return this.request<void>('/punish', {
      method: 'POST',
      body: JSON.stringify({
        player_name: playerName,
        reason,
        by,
      }),
    });
  }
}

// Singleton instance
let crconClient: CRCONClient | null = null;

export function getCRCONClient(): CRCONClient {
  if (!crconClient) {
    const baseUrl = process.env.CRCON_API_URL;
    const token = process.env.CRCON_API_TOKEN;

    if (!baseUrl || !token) {
      throw new Error('CRCON API credentials not configured');
    }

    crconClient = new CRCONClient(baseUrl, token);
  }

  return crconClient;
}
