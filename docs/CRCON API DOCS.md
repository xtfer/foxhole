# **CRCON API Documentation**

CRCON is a community-built remote console tool for Hell Let Loose game servers. This API provides comprehensive server management capabilities including player administration, server configuration, and monitoring.

## **Base Information**

* **Version**: v11.5.1  
* **Authentication**: Session-based authentication required for most endpoints  
* **HTTP Methods**: GET, POST (as specified per endpoint)  
* **Permissions**: Role-based access control with granular permissions

  ## **Authentication Endpoints**

  ### **Login/Logout**

* **`POST /login`** \- Authenticate user session  
* **`GET|POST /logout`** \- End user session  
* **`GET /is_logged_in`** \- Check authentication status

  ## **Player Management**

  ### **Basic Player Operations**

* **`GET /get_players`** \- Get list of currently connected players  
* **`GET /get_detailed_players`** \- Get detailed info for all connected players  
* **`GET /get_detailed_player_info`** \- Get detailed info for specific player  
  * `player_name: str` \- Player name to query  
  * `player: GetPlayersType | None` \- Optional player object  
* **`GET /get_playerids`** \- Get player IDs and names  
  * `as_dict: bool = False` \- Return as dictionary format  
* **`GET /get_player_info`** \- Get basic player information  
  * `player_name: str` \- Player name  
  * `can_fail: bool = False` \- Allow operation to fail gracefully

  ### **Player Administration**

* **`POST /kick`** \- Kick player from server  
  * `player_name: str` \- Player to kick  
  * `reason: str` \- Kick reason  
  * `by: str` \- Administrator name  
  * `player_id: str | None` \- Optional player ID  
* **`POST /punish`** \- Issue punishment to player  
  * `player_name: str` \- Player name  
  * `reason: str` \- Punishment reason  
  * `by: str` \- Administrator name  
* **`POST /switch_player_now`** \- Force immediate team switch  
  * `player_name: str` \- Player to switch  
* **`POST /switch_player_on_death`** \- Switch player on next death  
  * `player_name: str` \- Player to switch  
  * `by: str` \- Administrator name

  ### **Player Communication**

* **`POST /message_player`** \- Send direct message to player  
  * `player_name: str | None` \- Player name  
  * `player_id: str | None` \- Player ID  
  * `message: str` \- Message content  
  * `by: str` \- Sender name  
  * `save_message: bool = False` \- Save to message history  
* **`GET /get_player_messages`** \- Get player message history  
  * `player_id: str` \- Player ID

  ### **Player Profiles & History**

* **`GET /get_player_profile`** \- Get comprehensive player profile  
  * `player_id: str` \- Player ID  
  * `num_sessions: int = 10` \- Number of recent sessions  
* **`GET /get_players_history`** \- Search player history with filters  
  * `page: int = 1` \- Page number  
  * `page_size: int = 500` \- Results per page  
  * `last_seen_from: datetime | None` \- Start date filter  
  * `last_seen_till: datetime | None` \- End date filter  
  * `player_id: str | None` \- Player ID filter  
  * `player_name: str | None` \- Name filter  
  * `blacklisted: bool | None` \- Blacklist status filter  
  * `is_watched: bool | None` \- Watch status filter  
  * `exact_name_match: bool = False` \- Exact name matching  
  * `ignore_accent: bool = True` \- Ignore accent characters  
  * `flags: str | list[str] | None` \- Flag filters  
  * `country: str | None` \- Country filter

  ## **Banning & Blacklisting**

  ### **Temporary & Permanent Bans**

* **`POST /temp_ban`** \- Issue temporary ban  
  * `player_name: str | None` \- Player name  
  * `player_id: str | None` \- Player ID  
  * `duration_hours: int = 2` \- Ban duration  
  * `reason: str` \- Ban reason  
  * `by: str` \- Administrator name  
* **`POST /perma_ban`** \- Issue permanent ban  
  * `player_name: str | None` \- Player name  
  * `player_id: str | None` \- Player ID  
  * `reason: str` \- Ban reason  
  * `by: str` \- Administrator name  
* **`POST /unban`** \- Remove all bans from player  
  * `player_id: str` \- Player ID to unban  
* **`POST /remove_temp_ban`** \- Remove temporary ban  
  * `player_id: str` \- Player ID or ban log  
* **`POST /remove_perma_ban`** \- Remove permanent ban  
  * `player_id: str` \- Player ID (valid ban log)

  ### **Ban Information**

* **`GET /get_bans`** \- Get all server bans  
* **`GET /get_temp_bans`** \- Get temporary bans only  
* **`GET /get_perma_bans`** \- Get permanent bans only  
* **`GET /get_ban`** \- Get specific player's bans  
  * `player_id: str` \- Player ID to query

  ### **Blacklists (Advanced Ban Management)**

* **`POST /create_blacklist`** \- Create new blacklist  
  * `name: str` \- Blacklist name  
  * `sync: BlacklistSyncMethod = KICK_ONLY` \- Sync method  
  * `servers: Sequence[int] | None` \- Server numbers (None \= all)  
* **`GET /get_blacklists`** \- Get all blacklists  
* **`GET /get_blacklist`** \- Get specific blacklist with records  
  * `blacklist_id: int` \- Blacklist ID  
* **`POST /edit_blacklist`** \- Modify blacklist settings  
  * `blacklist_id: int` \- Blacklist to edit  
  * `name: str` \- New name  
  * `sync_method: BlacklistSyncMethod` \- Sync method  
  * `servers: Sequence[int] | None` \- Server assignments  
* **`POST /delete_blacklist`** \- Remove blacklist and all records  
  * `blacklist_id: int` \- Blacklist ID

  ### **Blacklist Records**

* **`POST /add_blacklist_record`** \- Add player to blacklist  
  * `player_id: str` \- Player ID to blacklist  
  * `blacklist_id: int` \- Target blacklist  
  * `reason: str` \- Blacklist reason  
  * `expires_at: datetime | None` \- Expiration time  
  * `admin_name: str` \- Administrator name  
* **`GET /get_blacklist_records`** \- Search blacklist records  
  * `player_id: str | None` \- Player filter  
  * `reason: str | None` \- Reason filter  
  * `blacklist_id: int | None` \- Blacklist filter  
  * `exclude_expired: bool = False` \- Hide expired records  
  * `page_size: int = 50` \- Results per page  
  * `page: int = 1` \- Page number  
* **`POST /edit_blacklist_record`** \- Modify blacklist record  
  * `record_id: int` \- Record ID  
  * `blacklist_id: int` \- Target blacklist  
  * `reason: str` \- New reason  
  * `expires_at: datetime | None` \- New expiration  
* **`POST /delete_blacklist_record`** \- Remove blacklist record  
  * `record_id: int` \- Record ID  
* **`POST /unblacklist_player`** \- Remove all blacklists and bans  
  * `player_id: str` \- Player ID

  ## **VIP Management**

  ### **VIP Operations**

* **`POST /add_vip`** \- Grant VIP status  
  * `player_id: str` \- Player ID  
  * `description: str` \- VIP description  
  * `expiration: str | None` \- Expiration date  
* **`POST /remove_vip`** \- Revoke VIP status  
  * `player_id: str` \- Player ID  
* **`POST /remove_all_vips`** \- Clear all VIP players  
* **`GET /get_vip_ids`** \- Get all VIP players  
* **`GET /get_vips_count`** \- Get VIP count  
* **`GET /download_vips`** \- Export VIP list  
* **`POST /upload_vips`** \- Import VIP list  
* **`GET /upload_vips_result`** \- Get upload results

  ### **VIP Settings**

* **`GET /get_vip_slots_num`** \- Get VIP slot count  
* **`POST /set_vip_slots_num`** \- Set VIP slot count  
  * `value: int` \- Number of VIP slots

  ## **Server Information**

  ### **Basic Server Status**

* **`GET /get_status`** \- Get comprehensive server status  
* **`GET /get_gamestate`** \- Get current game state (players, scores, time, map)  
* **`GET /get_slots`** \- Get current/max player slots  
* **`GET /get_name`** \- Get server name  
* **`POST /set_server_name`** \- Change server name  
  * `name: str` \- New server name  
* **`GET /get_version`** \- Get CRCON version  
* **`GET /get_public_info`** \- Get public server information

  ### **Maps & Rotation**

* **`GET /get_map`** \- Get current map  
* **`GET /get_next_map`** \- Get next map in rotation  
* **`GET /get_previous_map`** \- Get previous map  
* **`GET /get_maps`** \- Get all available maps  
* **`GET /get_map_rotation`** \- Get current map rotation  
* **`POST /set_map`** \- Change current map  
  * `map_name: str` \- Map to switch to  
* **`POST /set_maprotation`** \- Set entire map rotation  
  * `map_names: list[str]` \- List of maps in order

  ### **Map Rotation Management**

* **`POST /add_map_to_rotation`** \- Add map to rotation  
  * `map_name: str` \- Map to add  
  * `after_map_name: str | None` \- Insert after this map  
  * `after_map_name_number: int | None` \- Insert after occurrence number  
* **`POST /add_maps_to_rotation`** \- Add multiple maps  
  * `map_names: list[str]` \- Maps to add  
* **`POST /remove_map_from_rotation`** \- Remove map from rotation  
  * `map_name: str` \- Map to remove  
  * `map_number: int | None` \- Specific occurrence  
* **`POST /remove_maps_from_rotation`** \- Remove multiple maps  
  * `map_names: list[str]` \- Maps to remove

  ### **Map Shuffle & Sequences**

* **`GET /get_map_shuffle_enabled`** \- Get shuffle status  
* **`POST /set_map_shuffle_enabled`** \- Enable/disable map shuffle  
  * `enabled: bool` \- Shuffle state  
* **`GET /get_current_map_sequence`** \- Get current map sequence

  ### **Map Objectives**

* **`GET /get_objective_rows`** \- Get all objective rows  
* **`GET /get_objective_row`** \- Get specific objective row  
  * `row: int` \- Row number  
* **`GET /get_team_objective_scores`** \- Get team objective counts  
* **`POST /set_game_layout`** \- Configure game objectives  
  * `objectives: Sequence[str | int | None]` \- Objective configuration  
  * `random_constraints: GameLayoutRandomConstraints = 0` \- Random constraints

  ## **Server Settings**

  ### **Player Management Settings**

* **`GET /get_server_settings`** \- Get all server settings  
* **`GET /get_autobalance_enabled`** \- Get autobalance status  
* **`POST /set_autobalance_enabled`** \- Enable/disable autobalance  
  * `value: bool` \- Autobalance state  
* **`GET /get_autobalance_threshold`** \- Get autobalance threshold  
* **`POST /set_autobalance_threshold`** \- Set autobalance threshold  
  * `max_diff: int` \- Maximum team difference  
* **`GET /get_idle_autokick_time`** \- Get idle kick time  
* **`POST /set_idle_autokick_time`** \- Set idle kick time  
  * `minutes: int` \- Minutes before kick  
* **`GET /get_max_ping_autokick`** \- Get ping kick threshold  
* **`POST /set_max_ping_autokick`** \- Set ping kick threshold  
  * `max_ms: int` \- Maximum ping in milliseconds  
* **`GET /get_team_switch_cooldown`** \- Get team switch cooldown  
* **`POST /set_team_switch_cooldown`** \- Set team switch cooldown  
  * `minutes: int` \- Cooldown in minutes  
* **`GET /get_queue_length`** \- Get server queue length  
* **`POST /set_queue_length`** \- Set server queue length  
  * `value: int` \- Queue size

  ### **Vote Kick Settings**

* **`GET /get_votekick_enabled`** \- Get vote kick status  
* **`POST /set_votekick_enabled`** \- Enable/disable vote kick  
  * `value: bool` \- Vote kick state  
* **`GET /get_votekick_thresholds`** \- Get vote kick thresholds  
* **`POST /set_votekick_thresholds`** \- Set vote kick thresholds  
  * `threshold_pairs: list[tuple[int, int]]` \- Player count/votes needed pairs  
* **`POST /reset_votekick_thresholds`** \- Reset to default thresholds

  ## **Admin Management**

  ### **Admin Roles**

* **`POST /add_admin`** \- Grant admin privileges  
  * `player_id: str` \- Player ID  
  * `role: str` \- Admin role  
  * `description: str` \- Admin description  
* **`POST /remove_admin`** \- Revoke admin privileges  
  * `player_id: str` \- Player ID  
* **`GET /get_admin_ids`** \- Get all admins  
* **`GET /get_admin_groups`** \- Get available admin groups  
* **`GET /get_ingame_mods`** \- Get currently connected admins  
* **`GET /get_online_mods`** \- Get online admins

  ## **Messaging & Broadcasting**

  ### **Server Messages**

* **`GET /get_broadcast_message`** \- Get current broadcast message  
* **`POST /set_broadcast`** \- Set broadcast message  
  * `message: str` \- Broadcast content  
* **`GET /get_welcome_message`** \- Get welcome message  
* **`POST /set_welcome_message`** \- Set welcome message  
  * `message: str` \- Welcome content

  ### **Message Templates**

* **`GET /get_all_message_templates`** \- Get all message templates by category  
* **`GET /get_message_templates`** \- Get templates for specific category  
  * `category: MessageTemplateCategory` \- Template category  
* **`GET /get_message_template`** \- Get specific template  
  * `id: int` \- Template ID  
* **`GET /get_message_template_categories`** \- Get available categories  
* **`POST /add_message_template`** \- Create message template  
  * `title: str` \- Template title  
  * `content: str` \- Template content  
  * `category: str | MessageTemplateCategory` \- Template category  
  * `by: str` \- Creator name  
* **`POST /edit_message_template`** \- Modify message template  
  * `id: int` \- Template ID  
  * `title: str | None` \- New title  
  * `content: str | None` \- New content  
  * `category: str | MessageTemplateCategory | None` \- New category  
  * `by: str` \- Editor name  
* **`POST /delete_message_template`** \- Remove message template  
  * `id: int` \- Template ID

  ## **Player Flags & Comments**

  ### **Player Flags**

* **`POST /flag_player`** \- Add flag to player  
  * `player_id: str` \- Player ID  
  * `flag: str` \- Flag (usually emoji)  
  * `player_name: str | None` \- Player name  
  * `comment: str | None` \- Flag comment  
* **`POST /unflag_player`** \- Remove player flag  
  * `flag_id: int | None` \- Flag record ID  
  * `player_id: str | None` \- Player ID  
  * `flag: str | None` \- Flag to remove

  ### **Player Comments**

* **`POST /post_player_comment`** \- Add comment to player  
  * `player_id: str` \- Player ID  
  * `comment: str` \- Comment content  
  * `by: str` \- Commenter name  
* **`GET /get_player_comments`** \- Get player comments  
  * `player_id: str` \- Player ID

  ### **Player Watching**

* **`POST /watch_player`** \- Add player to watchlist  
  * `player_id: str` \- Player ID  
  * `reason: str` \- Watch reason  
  * `by: str` \- Administrator name  
  * `player_name: str | None` \- Player name  
* **`POST /unwatch_player`** \- Remove player from watchlist  
  * `player_id: str` \- Player ID

  ## **Logging & Monitoring**

  ### **Game Logs**

* **`GET /get_logs`** \- Get raw server logs  
  * `since_min_ago: str | int` \- Time range  
  * `filter_: str` \- Content filter  
  * `by: str` \- Player filter  
* **`GET /get_structured_logs`** \- Get parsed logs  
  * `since_min_ago: int` \- Minutes ago  
  * `filter_action: str | None` \- Action filter  
  * `filter_player: str | None` \- Player filter  
* **`GET /get_recent_logs`** \- Get recent parsed logs with filters  
  * `filter_player: list[str] | str = []` \- Player filters  
  * `filter_action: list[str] = []` \- Action filters  
  * `inclusive_filter: bool = True` \- Filter mode  
  * `start: int = 0` \- Start index  
  * `end: int = 10000` \- End index  
  * `exact_player_match: bool = True` \- Exact matching  
  * `exact_action: bool = False` \- Exact action matching

  ### **Historical Logs**

* **`GET /get_historical_logs`** \- Search historical logs  
  * `player_name: str | None` \- Player filter  
  * `player_id: str | None` \- Player ID filter  
  * `action: str | None` \- Action filter  
  * `limit: int = 1000` \- Result limit  
  * `from_: datetime | None` \- Start time  
  * `till: datetime | None` \- End time  
  * `time_sort: Literal['desc', 'asc'] = 'desc'` \- Sort order  
  * `exact_player_match: bool = False` \- Exact matching  
  * `exact_action: bool = True` \- Exact action matching  
  * `server_filter: str | None` \- Server filter  
* **`GET /get_historical_logs_csv`** \- Export historical logs as CSV

  ### **Audit Logs**

* **`GET /get_audit_logs`** \- Get admin action audit logs  
* **`GET /get_audit_logs_autocomplete`** \- Get audit log autocomplete data

  ## **Statistics & Scoreboards**

  ### **Live Stats**

* **`GET /get_live_game_stats`** \- Get current match statistics  
* **`GET /get_live_scoreboard`** \- Get current player scoreboard  
* **`GET /get_round_time_remaining`** \- Get remaining round time in seconds

  ### **Historical Stats**

  #### **Date-Based Scoreboards**

* **`GET /get_date_scoreboard`** \- Get aggregated player statistics for a specific date range  
  * **Parameters:**  
    * `start: int` \- Start timestamp (Unix epoch seconds)  
    * `end: int` \- End timestamp (Unix epoch seconds)  
  * **Returns:** Aggregated player statistics including kills, deaths, score, playtime, and other metrics for all players who played during the specified period  
  * **Use Cases:**  
    * Generate weekly/monthly server reports  
    * Analyze player activity trends over time  
    * Create leaderboards for specific time periods  
    * Track server performance metrics  
* **Example Usage:**  
   \# Get scoreboard for last 7 daysstart \= current\_timestamp \- (7 \* 24 \* 60 \* 60\)  \# 7 days agoend \= current\_timestampGET /get\_date\_scoreboard?start=1694000000\&end=1694604800  
  *   
  * **Response Data Includes:**  
    * Player names and Steam IDs  
    * Total kills, deaths, teamkills  
    * Combat effectiveness ratios  
    * Total playtime during period  
    * Score accumulation  
    * Match participation statistics

  #### **Map-Specific Statistics**

* **`GET /get_map_scoreboard`** \- Get detailed statistics for specific map performances  
  * **Parameters:** None explicitly documented, but likely accepts map name or ID filters  
  * **Returns:** Player performance metrics broken down by individual maps  
  * **Use Cases:**  
    * Identify which players perform best on specific maps  
    * Analyze map balance and player preferences  
    * Generate map-specific leaderboards  
    * Track player specialization patterns  
  * **Response Data Likely Includes:**  
    * Per-map kill/death ratios  
    * Map-specific score achievements  
    * Win rates on different maps  
    * Player performance variations across map types  
    * Objective capture/defense statistics per map

  #### **Available Map Data**

* **`GET /get_scoreboard_maps`** \- Get list of all maps that have statistical data available  
  * **Parameters:** None  
  * **Returns:** List of map names/identifiers that have been played and have recorded statistics  
  * **Use Cases:**  
    * Populate dropdown menus for map selection  
    * Validate map names before querying specific map statistics  
    * Discover which maps have sufficient data for analysis  
    * Build dynamic reporting interfaces  
  * **Response Format:** Likely returns map identifiers, display names, and possibly metadata like:  
    * Map type (warfare, offensive, etc.)  
    * Total matches played  
    * Date range of available data  
    * Player count ranges

  #### **Server Map History**

* **`GET /get_map_history`** \- Get chronological history of map rotations and match results  
  * **Parameters:** Likely accepts date range and pagination parameters  
  * **Returns:** Chronological list of map changes, match durations, and basic match outcomes  
  * **Use Cases:**  
    * Track map rotation patterns  
    * Analyze match duration trends  
    * Identify popular/unpopular maps based on frequency  
    * Generate server activity timeline reports  
    * Correlate map choices with player count fluctuations  
  * **Response Data Likely Includes:**  
    * Map name and start/end timestamps  
    * Match duration and outcome (if completed)  
    * Player count at map start/peak/end  
    * Score progression during matches  
    * Whether map ended naturally or was forced to change  
    * Server population during each map session

  #### **Data Aggregation Notes**

* **Timestamp Format:** All endpoints using timestamps expect Unix epoch time in seconds  
* **Data Retention:** Historical data availability depends on server configuration and storage limits  
* **Performance Considerations:** Large date ranges may require pagination or have response size limits  
* **Time Zones:** Timestamps are typically stored in UTC; client applications should handle timezone conversion  
* **Data Freshness:** Statistics may have slight delays as they're processed from game logs

  #### **Common Integration Patterns**

* // PHP example for getting weekly statistics  
* $weekStart \= strtotime('-1 week');  
* $weekEnd \= time();  
* $response \= $crcon-\>get('/get\_date\_scoreboard', \[  
*     'start' \=\> $weekStart,  
*     'end' \=\> $weekEnd  
* \]);  
*   
* // Get available maps for selection interface  
* $availableMaps \= $crcon-\>get('/get\_scoreboard\_maps');  
*   
* // Build map-specific performance report  
* foreach ($availableMaps\['result'\] as $mapName) {  
*     $mapStats \= $crcon-\>get('/get\_map\_scoreboard', \['map' \=\> $mapName\]);  
*     // Process map-specific statistics...  
* }


  ### **Team Information**

* **`GET /get_team_view`** \- Get team composition view

  ## **Vote Map System**

  ### **Vote Map Status & Control**

* **`GET /get_votemap_status`** \- Get current vote map status  
* **`POST /reset_votemap_state`** \- Reset vote map voting

  ### **Vote Map Whitelist**

* **`GET /get_votemap_whitelist`** \- Get allowed vote maps  
* **`POST /set_votemap_whitelist`** \- Set vote map whitelist  
  * `map_names: Iterable[str]` \- Allowed maps  
* **`POST /add_map_to_votemap_whitelist`** \- Add map to whitelist  
  * `map_name: str` \- Map to add  
* **`POST /add_maps_to_votemap_whitelist`** \- Add multiple maps to whitelist  
  * `map_names: Iterable[str]` \- Maps to add  
* **`POST /remove_map_from_votemap_whitelist`** \- Remove map from whitelist  
  * `map_name: str` \- Map to remove  
* **`POST /remove_maps_from_votemap_whitelist`** \- Remove multiple maps  
  * `map_names: Iterable[str]` \- Maps to remove  
* **`POST /reset_map_votemap_whitelist`** \- Reset whitelist to default

  ## **Content Filtering**

  ### **Profanity Management**

* **`GET /get_profanities`** \- Get banned profanity list  
* **`POST /ban_profanities`** \- Add words to profanity filter  
  * `profanities: list[str]` \- Words to ban  
* **`POST /unban_profanities`** \- Remove words from profanity filter  
  * `profanities: list[str]` \- Words to unban  
* **`POST /set_profanities`** \- Set entire profanity list  
  * `profanities: list[str]` \- Complete word list

  ## **Configuration Management**

CRCON includes extensive configuration management for various automated systems and integrations. All configuration endpoints follow similar patterns:

### **Configuration Patterns**

* **`GET /get_{feature}_config`** \- Get current configuration  
* **`POST /set_{feature}_config`** \- Update configuration  
  * `by: str` \- Administrator name  
  * `config: dict | BaseUserConfig | None` \- New configuration  
  * `reset_to_default: bool = False` \- Reset to defaults  
* **`POST /validate_{feature}_config`** \- Validate configuration without saving  
* **`GET /describe_{feature}_config`** \- Get configuration schema

  ### **Available Configuration Systems**

  #### **Auto Moderation**

* **Auto Mod Level** \- Level-based restrictions  
* **Auto Mod No Leader** \- No squad leader enforcement  
* **Auto Mod Seeding** \- Seeding mode rules  
* **Auto Mod Solo Tank** \- Anti-solo tank enforcement

  #### **Communication & Notifications**

* **Auto Broadcasts** \- Automatic server messages  
* **Chat Commands** \- In-game chat command responses  
* **RCON Chat Commands** \- Admin chat commands  
* **Standard Messages** \- Broadcast, punishment, welcome messages

  #### **Discord Integration**

* **Admin Pings** \- Admin notification webhooks  
* **Audit** \- Admin action logging webhooks  
* **Camera** \- Camera notification webhooks  
* **Chat** \- Chat message webhooks  
* **Kills** \- Kill feed webhooks  
* **Watchlist** \- Watchlist event webhooks

  #### **Player Management**

* **Name Kick** \- Automatic name-based kicking  
* **Expired VIP** \- Expired VIP management  
* **Real VIP** \- VIP queue management  
* **Seed VIP** \- Seeding VIP rewards  
* **TK Ban on Connect** \- Team kill ban enforcement  
* **VAC Game Bans** \- Steam ban checking  
* **Watch Killrate** \- Kill rate monitoring

  #### **Server Integration**

* **Camera Notification** \- Screenshot notifications  
* **Log Line Webhook** \- Custom log line webhooks  
* **Log Stream** \- Real-time log streaming  
* **RCON Connection Settings** \- Connection parameters  
* **RCON Server Settings** \- Server-specific settings  
* **Scoreboard** \- Scoreboard posting configuration  
* **Server Name Change** \- Dynamic server naming  
* **Steam** \- Steam API integration  
* **Votekick Autotoggle** \- Automatic votekick management  
* **Votemap** \- Vote map system configuration

  ## **Service Management**

  ### **Service Control**

* **`GET /get_services`** \- Get available services  
* **`POST /do_service`** \- Control service operations

  ### **System Operations**

* **`POST /clear_cache`** \- Clear Redis cache  
* **`POST /reconnect_gameserver`** \- Restart web server workers  
* **`GET /get_connection_info`** \- Get connection information  
* **`GET /get_server_list`** \- Get other CRCON servers

  ### **Auto Settings**

* **`GET /get_auto_settings`** \- Get automated settings  
* **`POST /set_auto_settings`** \- Configure automated settings

  ## **Webhook Management**

  ### **Webhook Monitoring**

* **`GET /get_webhook_service_summary`** \- Get webhook service overview  
* **`GET /get_all_webhook_queues`** \- Get all webhook queue names  
* **`GET /get_webhook_queue_overview`** \- Get specific queue status  
  * `queue_id: str` \- Queue identifier

  ### **Queue Management**

* **`POST /reset_webhook_queues`** \- Clear all webhook queues  
* **`POST /reset_webhook_queue`** \- Clear specific queue  
  * `queue_id: str` \- Queue to clear  
* **`POST /reset_webhook_queue_type`** \- Clear queues by webhook type  
  * `webhook_type: WebhookType | str` \- Webhook type  
* **`POST /reset_webhook_message_type`** \- Clear queues by message type  
  * `message_type: WebhookMessageType | str` \- Message type  
* **`POST /reset_all_webhook_queues_for_server_number`** \- Clear server queues  
  * `server_number: int | str` \- Server number

  ## **Raw Commands & Permissions**

  ### **Advanced Operations**

* **`GET|POST /run_raw_command`** \- Execute raw RCON commands ⚠️  
* **`GET /get_own_user_permissions`** \- Get current user permissions

  ## **Response Types**

Most endpoints return JSON responses with the following structure:

* {  
*   "result": \<endpoint\_specific\_data\>,  
*   "command": "\<endpoint\_name\>",  
*   "arguments": \<request\_arguments\>,  
*   "failed": false,  
*   "error": null,  
*   "forwards\_results": null,  
*   "version": "v11.5.1"  
* }


  ## **Permission System**

CRCON uses granular role-based permissions. Each endpoint requires specific permissions like:

* `api.can_kick_players`  
* `api.can_view_player_info`  
* `api.can_change_server_settings`  
* `api.can_run_raw_commands`

  ## **Rate Limiting & Auto Settings**

Many endpoints support "auto settings" which allow automated systems to call them without manual intervention. This is indicated by the `auto_settings_capable: true` field in the API documentation.

## **Error Handling**

When operations fail, the API returns:

* `failed: true`  
* `error: <error_message>`  
* `result: null`

Always check the `failed` status before processing results.

---

**⚠️ Important Notes:**

* Always authenticate before making API calls  
* Check user permissions before attempting operations  
* Some operations like `run_raw_command` require elevated privileges  
* Be cautious with batch operations on large player bases  
* Configuration changes may require service restarts to take effect  
* 

